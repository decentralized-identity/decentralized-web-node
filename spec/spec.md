Identity Hub
==================

**Specification Status:** Draft

**Latest Draft:**
  [identity.foundation/identity-hub/spec](https://identity.foundation/identity-hub/spec)
<!-- -->

**Editors:**
~ [Daniel Buchner](https://www.linkedin.com/in/dbuchner/) (Microsoft)
~ [Tobias Looker](https://www.linkedin.com/in/tplooker) (Mattr)

**Contributors:**
~ [Henry Tsai](https://www.linkedin.com/in/henry-tsai-6b884014/) (Microsoft)
~ [XinAn Xu](https://www.linkedin.com/in/xinan-xu-b868a326/) (Microsoft)

**Participate:**
~ [GitHub repo](https://github.com/decentralized-identity/identity-hub)
~ [File a bug](https://github.com/decentralized-identity/identity-hub/issues)
~ [Commit history](https://github.com/decentralized-identity/identity-hub/commits/master)

------------------------------------

## Abstract

Most digital activities between people, organizations, devices, and other entities require 
messaging and data exchanges. When entities exchange messages and data for credential, app, 
or service flows, they need an interface over which to store, discovery, and fetch data related 
to the entities they are interacting with. Identity Hubs are a data storage and message relay 
mechanism which entities can use to locate public or permissioned private data in relation to 
an entity's Decentralized Identifier (DID). Identity Hubs are a mesh-like datastore construction 
that allow an entity to operate multiple instances of compliant implementations that sync to the 
same state across one another, enabling the owning entity to own, manage, and transact their data 
with others without reliance on location/provider-specific locations, APIs, or routing.

## Status of This Document

Identity Hub is a _DRAFT_ specification under development within
the Decentralized Identity Foundation (DIF). It incorporates requirements and
learnings from related work of many active industry players into a shared
specification that meets the collective needs of the community.

The specification will be updated to incorporate feedback, from DIF members and 
the wider community, with a reference implementation being developed within DIF 
that exercises the features and requirements defined here. We encourage reviewers 
to submit [GitHub Issues](https://github.com/decentralized-identity/identity-hub/issues) 
as the means by which to communicate feedback and contributions.

## Terminology

[[def:Identity Hub]]
~ A decentralized personal and application data storage and message relay node, 
as defined in the DIF Identity Hub specification.

[[def:Hub Instance, Hub Instances]]
~ An instance of an Identity Hub running on a local device or at a remote location.

[[def:Hub Operator]]
~ Any entity, including individuals, who runs an Hub Instance on a device or 
infrastructure they control.

[[def:Hub User]]
~ An entity that stores DID-associated data and transmits messages via a given 
Hub Instance, which may be running on a device in their possession, or on the 
device or infrastructure of a Hub Operator.

[[def:Decentralized Identifiers, Decentralized Identifier, DID]]
~ Unique ID URI string and PKI metadata document format for describing the
cryptographic keys and other fundamental PKI values linked to a unique,
user-controlled, self-sovereign identifier in a target system (e.g., blockchain,
distributed ledger).

## Topology

<img src="images/topology.svg" style="display: block; margin: 0 auto; padding: 1em 0; width: 100%; max-width: 1000px;" />

## Protocol Stack

<style id="protocol-stack-styles">
  #protocol-stack-styles ~ table {
    display: table;
    width: 400px;
    border-radius: 4px;
    box-shadow: 0 1px 3px -1px rgb(0 0 0 / 80%);
    overflow: hidden;
  }
  #protocol-stack-styles ~ table tr, #protocol-stack-styles ~ table td {
    border: none;
  }
  #protocol-stack-styles ~ table tr {
    text-shadow: 0 1px 2px rgb(255 255 255 / 75%);
  }
  #protocol-stack-styles ~ table tr:nth-child(1) {
    background: hsl(0deg 100% 87%);
  }
  #protocol-stack-styles ~ table tr:nth-child(2) {
    background: hsl(0deg 100% 82%);
  }
  #protocol-stack-styles ~ table tr:nth-child(3) {
    background: hsl(198deg 100% 87%);
  }
  #protocol-stack-styles ~ table tr:nth-child(4) {
    background: hsl(198deg 100% 77%);
  }
  #protocol-stack-styles ~ table tr:nth-child(5) {
    background: hsl(274deg 100% 91%);
  }
  #protocol-stack-styles ~ table tr:nth-child(6) {
    background: hsl(274deg 100% 85%);
  }
  #protocol-stack-styles ~ table tr:nth-child(7) {
    background: hsl(149deg 100% 86%);
  }
  #protocol-stack-styles ~ table tr:nth-child(8) {
    background: hsl(149deg 100% 73%);
  }
  #protocol-stack-styles ~ table tr:nth-child(9) {
    background: #ffe1b6;
  }
</style>

Identity Hubs are comprised of the following component layers, each of which is defined 
in this specification to ensure multiple Hub implementations can be used together and operate 
as a single logical unit for users.

:----: |
DID Authentication |
Access & Authorization |
Interface Definitions |
Interface Processing |
Object Format |
Object Signing / Encryption |
File Structure |
IPFS |

::: todo
Finalize the component stack list - are these correct? Are we missing any?
:::

## Service Endpoints

The following DID Document Service Endpoint entries ****MUST**** be present in the DID Document of a target DID for DID-relative URL resolution to properly locate the URI for addressing a DID owner's Hub instances:

```json
{
  "id": "did:example:123",
  "service": [{
    "id":"#hub",
    "type": "IdentityHub", 
    "serviceEndpoint": ["https://hub.example.com", "https://example.org/hub"]
  }]
}
```

## Addressing

A user's logical Identity Hub (their collection of Hub Instances) can be addressed in many ways, 
but the mechanisms below ****MUST**** be supported by a compliant Identity Hub implementation:

### DID-Relative URLs

The following DID URL constructions are used to address [[ref: Hub Instances]] found to be associated 
with a given DID, as located via the DID resolution process.

#### Composition

The following process defines how a Identity Hub DID-Relative URL is composed:

1. Let the base URI authority portion of the DID URL string be the target DID being addressed.
2. Append a `service` parameter to the DID URL string with the value `Identity Hub`.
3. Assemble an array of whatever [Message Content](#message-content) objects are desired for encoding in the DID-relative URL
4. JSON stringify the array of [Message Content](#message-content) objects from Step 3, then Base64Url encode the stringified output.
5. Append a `request` parameter to the DID URL string with the value set to the JSON stringified, Base64Url encoded output of Step 4.

**DID-relative URLs are composed of the following segments**

`did:example:123` + `?service=IdentityHub` + `&request=` + `toBase64Url( JSON.stringify( [{ MESSAGE_1 }, { MESSAGE_N }] ) )`

```json
did:example:123?service=IdentityHub&request=W3sgTUVTU0FHRV8xIH0sIHsgTUVTU0FHRV9OIH1d...
```

#### Resolution

The following process defines how a DID-Relative URL addressing an Identity Hub is resolved:

1. Resolve the DID in the authority portion of the URL in accordance with the [W3C Decentralized Identifier Resolution](https://w3c.github.io/did-core/#resolution) process, which returns the DID Document for the resolved DID.
2. As indicated by the presence of the `service` parameter, locate the `IdentityHub` entry in the DID Document's [Service Endpoint](https://w3c.github.io/did-core/#services) entries.
3. Parse the `IdentityHub` Service Endpoint and let the first located `IdentityHub` Service Endpoint URI be the base URI of the Hub request being constructed. NOTE: there may be multiple Hub URIs within the `IdentityHub` Service Endpoint entry, and it is ****recommended**** that implementers address them in index order.

#### Request Construction

**DID-Relative URL for passing one or more messages:**

```json
did:example:123?service=IdentityHub&request=[{...}, { "descriptor": { "method": "CollectionsQuery", "schema": "https://schema.org/SocialMediaPosting" }}]
```

::: note
For example purposes, the `request` parameter value above is not URL encoded, but should be when using Identity Hub URLs in practice (see the [DID-relative URL Composition](#composition) instructions above).
:::

**Resolve DID to locate the Identity Hub URIs:**

`did:example:123` -->  resolve to Identity Hub endpoint(s)  -->  `https://hub.example.com/`

**Construct the *Request Object*{id=request-object}:**

1. Create a JSON object for the request.
2. The *Request Object* ****MUST**** include a `id` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string to identify the request.
3. The *Request Object* ****MUST**** include a `target` property, and its value ****MUST**** be the Decentralized Identifier base URI of the DID-relative URL.
4. The *Request Object* ****MUST**** include a `request` property, and its value ****MUST**** be an array composed of [Message](#messages) objects that are generated by parsing the DID-relative URL's `request` parameter value as a JSON array and performing the following steps for each entry:
    1. Construct a [Message Wrapper](#message-wrapper) object.
    2. Set the `content` property of the [Message Wrapper](#message-wrapper) object to the object entry, ensuring it is a valid [Message Content](#message-content) object.
    3. Augment the [Message Wrapper](#message-wrapper) object with any signing and authorization values required, as described in the [Message Wrapper](#message-wrapper) section.
    4. include the object in the *Request Object*'s `message` array.

*HTTP POST example:*

```json5
POST https://hub.example.com/

BODY {
  "id": "c5784162-84af-4aab-aff5-f1f8438dfc3d",
  "target": "did:example:123",
  "messages": [
    {
      "content": {
        "descriptor": {
          "method": "CollectionsQuery",
          "schema": "https://schema.org/SocialMediaPosting"
        }
      }
    },
    {...}
  ]
}
```

## Messages

All objects within an Identity Hub ****MUST**** be constructed and transacted between Identity Hubs using the following structures:

### Message Wrapper

Message Wrappers are JSON objects that are used to pass [Message Content](#message-content) via their `content` property, and can be augmented to include [[spec:rfc7515]] Flattened JSON Web Signature properties that may include permission evaluation material (e.g. capabilities).

```json
{
  "id": "c5784162-84af-4aab-aff5-f1f8438dfc3d",
  "target": "did:example:123",
  "messages": [
    {
      "content": {...},
      "protected": {
        "alg": "...",
        "kid": "...",
        "authz": "...",
      },
      "payload": cid(content),
      "signature": signature(protected + payload)
    },
    {...}
  ]
}
```

Message Wrappers objects ****MUST**** be composed as follows:

- The Message Wrapper object ****MUST**** contain a `target` property, and its value ****MUST**** be the Decentralized Identifier of the Hub being targeted by the message.
- The Message Wrapper object ****MUST**** contain a `messages` property, and its value ****MUST**** be an array of one or more Message Wrapper objects, composed as follows:
  - Each Message Wrapper object ****MUST**** contain a `content` property, and its value ****MUST**** be an object, as defined by the [Message Contents](#message-content) section of this specification.
  - If the message requires signatory and/or permission-evaluated authorization, the rest of the object must be constructed as follows: 
    1. Add a `payload` property to the Message Wrapper object and set its value as the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `content` object.
    2. If the message requires signatory authorization, the Message Wrapper object ****MUST**** includes a `protected` property with an object for a value that contains the correct `alg` and `kid` values for the algorithm and key used to generate the required [[spec:rfc7515]] JSON Web Signature.
    3. If the message requires passage of permission material, ensure the message object ****MUST**** includes a `protected` property with an object for a value that contains an `authz` property with the requisite permission material as its value.

### Message Content

The Identity Hub data structure that resides in the `content` property of the [Message Wrapper](#message-wrapper) is comprised of a common JSON structure that contains the following properties regardless of whether the message data is signed/encrypted:

```json
{
  "id": "c5784162-84af-4aab-aff5-f1f8438dfc3d",
  "target": "did:example:123",
  "messages": [
    {
      "content": {
        "descriptor": {
          "method": INTERFACE_METHOD_STRING,
          "cid": DATA_CID_STRING,
          "format": DATA_FORMAT_STRING,
          "datePublished": EPOCH_TIMESTAMP_STRING
        },
        "data": OPTIONAL_JSON_OBJECT
      },
      ...
    },
    {...}
  ]
}
```

A message is a JSON object that ****MUST**** be composed as follows:

- The message object ****MAY**** contain a `data` property, and if present it ****MUST**** be a JSON value that includes data related to the Interface method being invoked.
- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The `descriptor` object ****MUST**** contain a `method` property, and its value ****MUST**** be a string that matches a Hub Interface method.
  - If the message object has data associated with it, passed directly via the `data` property or through a channel external to the message object, the `descriptor` object ****MUST**** contain a `cid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded data.
  - If the message object has data associated with it, passed directly via the `data` property or through a channel external to the message object, the `descriptor` object ****MUST**** contain a `format` property, and its value ****MUST**** be a string that indicates the format of the data. The most common format is JSON, which is indicated by setting the value of the `format` property to `json`.
  - The `descriptor` object ****MAY**** contain a `datePublished` property, and its value ****MUST**** be an [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that ****MUST**** be set and interpreted as the time the logical entry was published by the DID owner or another permitted party.

Individual Interface methods may describe additional properties that the `descriptor` object ****MUST**** or ****MAY**** contain, which are detailed in the [Interfaces](#interfaces) section of the specification.

#### Raw Content

If there is no need or desire to sign or encrypt the content of a message (i.e. public repudiable data), the message `content` object need only include a `descriptor` object (with any method-specific properties required) and a `data` property (when desired or required to be present for a given method invocation).

```json
{ // Message Wrapper
  ...
  "content": {
    "descriptor": {
      "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
      "cid": CID(data),
      "clock": 0,
      "method": "CollectionsWrite",
      "schema": "https://schema.org/SocialMediaPosting",
      "format": "JSON"
    },
    "data": {...}
  }
}
```

#### Signed Content

If the object is to be attributed to a signer (e.g the Hub owner via signature with their DID key), the object ****MUST**** contain the following additional properties to produce a [[spec:rfc7515]] Flattened JSON Web Signature (JWS) object:

```json
{ // Message Wrapper
  ...
  "content": {
    "descriptor": {
      "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
      "cid": CID(data),
      "clock": 0,
      "method": "CollectionsWrite",
      "schema": "https://schema.org/SocialMediaPosting",
      "format": "JSON"
    },
    "data": {...},
    "protected": {
      "alg": "ES256K",
      "kid": "did:example:123#key-1"
    },
    "payload": CID(descriptor),
    "signature": Sign(protected + payload)
  }
}
```

The message generating party ****MUST**** construct the signed content object as follows:

1. If the message includes associated data, passed directly via the `data` property or through a channel external to the message object, add a `cid` property to the `descriptor` object and set its value as the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded data.
2. After the value of the `cid` property has been set to the CID of the data the message represents, add a `payload` property to the Message Content object and set its value as the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `descriptor` object.
3. Use the resulting values to generate a JWS Flattened JSON representation in accordance with the process described in the [[spec:rfc7515]] JSON Web Signature specification.

#### Encrypted Content

If the object is to be encrypted (e.g the Hub owner encrypting their data to keep it private), the `descriptor` object ****MUST**** be constructed as follows:

```json
{ // Message Wrapper
  ...
  "content": {
    "descriptor": {
      "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
      "cid": CID(data),
      "clock": 7,
      "method": "CollectionsWrite",
      "schema": "https://schema.org/SocialMediaPosting",
      "format": "json",
      "encryption": "jwe"
    },
    "data": { 
      "protected": ...,
      "recipients": ...,
      "ciphertext": ...,
      "iv": ...,
      "tag": ... 
    }
  }
}
```

The message generating party ****MUST**** construct the encrypted content object as follows:

1. The `encryption` property of the `descriptor` object ****MUST**** be set to the string value `JWE`.
2. Generate an [[spec:rfc7516]] JSON Web Encryption (JWE) object for the data that is to be represented in the message.
3. Generate a [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) from the JWE of the data produced in Step 1, and set the `cid` property of the `descriptor` object as the stringified representation of the CID.

#### Signed & Encrypted Content

If the object is to be both attributed to a signer and encrypted encrypted, it ****MUST**** be structured as follows:

```json
{ // Message Wrapper
  ...
  "content": {
    "descriptor": {
      "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
      "cid": CID(data),
      "clock": 3,
      "method": "CollectionsWrite",
      "schema": "https://w3id.org/vc-status-list-2021/v1",
      "format": "json",
      "encryption": "jwe"
    },
    "data": { 
      "protected": ...,
      "recipients": ...,
      "ciphertext": ...,
      "iv": ...,
      "tag": ... 
    },
    "protected": {
      "alg": "ES256K",
      "kid": "did:example:123#key-1"
    },
    "payload": CID(descriptor),
    "signature": Sign(protected + payload)
  }
}
```

The message generating party ****MUST**** construct the signed and encrypted content object as follows:

1. The `encryption` property of the `descriptor` object ****MUST**** be set to the string value `JWE`.
2. Generate an [[spec:rfc7516]] JSON Web Encryption (JWE) object for the data that is to be represented in the message.
3. Generate a [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) from the JWE of the data produced in Step 1, and set the `cid` property of the `descriptor` object as the stringified representation of the CID.
4. Follow the instructions described in the [Signed Content](#signed-content) subsection above to turn the content object into an [[spec:rfc7515]] Flattened JSON Web Signature object.

### Message Responses

Responses from Interface method invocations are JSON objects that ****MUST**** be constructed as follows:

1. The object ****MUST**** include an `id` property, and its value ****MUST**** be the [[spec:rfc4122]] UUID Version 4 string from the `id` property of the [*Request Object*](#request-object) it is in response to.
2. The object MUST have a `responses` property, and its value ****MUST**** be an object.
3. Each entry in the `responses` object ****MUST**** be a *Message Response Object*, keyed with its index value in the `messages` array of the corresponding [*Request Object*](#request-object) from which it was received, and are constructed as follows:
    1. The object ****MUST**** have a `status` property, and its value ****MUST**** be an object composed of the following properties:
        - The status object ****MUST**** have a `code` property, and its value ****MUST**** be an integer set to the [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) appropriate for the status of the response.
        - The status object ****MAY**** have a `message` property, and if present its value ****MUST**** be a string that describes a terse summary of the status. It is ****recommended**** that the implementer set the message text to the standard title of the HTTP Status Code, when a title/message has already been defined for that code.
    2. The object ****MAY**** have a `content` property if the message request was successful. If present, its value ****MUST**** be the resulting content returned from the invocation of the corresponding message.

::: example Example response object
```json
{
  "id": "c5784162-84af-4aab-aff5-f1f8438dfc3d",
  "responses": {
    "0": {
      "status": { "code": 404, "message": "Not Found" }
    },
    "1": {
      "status": { "code": 200, "message": "OK" },
      "content": {...}
    }
  }
}
```
:::

## Access & Permissions

::: todo
Agree on an access/permission scheme (e.g. Object Capabilities) for Hub interactions that require it.
:::


## Sync & Replication

::: todo
IPFS can provide this to some extent, but do we need anything in addition to what native IPFS provides?
:::

## Interfaces

### Feature Detection

The Identity Hub specification defines well-recognized Hub configurations to maximize 
interoperability (see Hub Configurations), but implementers may wish to support a custom 
subset of the Interfaces and features. The Feature Detection interface is the means by 
which a Hub expresses support for the Interfaces and features it implements.

#### Data Model

A compliant Identity Hub ****MUST**** produce a Feature Detection object 
defined as follows:

```json
{
  "type": "FeatureDetection",
  "interfaces": { ... }
}
```

##### Properties & Values

The following properties and values are defined for the Feature Detection object:

- The object ****MUST**** include an `interfaces` property, and its value ****MUST**** be an object composed as follows: 
    - The object ****MAY**** contain a `profile` property. If the property is not present, 
    it indicates the Hub implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `ProfileRead`
      - `ProfileWrite`
      - `ProfileDelete`
    - The object ****MAY**** contain a `collections` property. If the property is not present, 
    it indicates the Hub implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `CollectionsQuery`
      - `CollectionsWrite`
      - `CollectionsCommit`
      - `CollectionsDelete`
    - The object ****MAY**** contain a `actions` property. If the property is not present, 
    it indicates the Hub implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `ActionsQuery`
      - `ActionsCreate`
      - `ActionsUpdate`
      - `ActionsDelete`
    - The object ****MAY**** contain a `permissions` property. If the property is not present, 
    it indicates the Hub implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `PermissionsRequest`
      - `PermissionsQuery`
      - `PermissionsGrant`
      - `PermissionsRevoke`
- The object ****MAY**** contain a `messaging` property, and its value ****MAY**** be an object composed of the following:
    - The object ****MAY**** contain a `batching` property, and if present its value ****MUST**** be a boolean indicating whether the Hub Instance handles multiple messages in a single request. The absence of this property ****shall**** indicate that the Hub Instance does support multiple messages in a single request, thus if an implementer does not support multiple messages in a request, they ****MUST**** include this property and explicitly set its value to `false`;
  

#### Read

All compliant Hubs ****MUST**** respond with a valid Feature Detection object when receiving 
the following request object:

```json
{
  "descriptor": {
    "method": "FeatureDetectionRead"
  }
}
```

### Profile

The Profile interface provides a simple mechanism for setting and retrieving a JSON object 
with basic profile information that describes the target DID entity.

#### Data Model

A compliant Identity Hub that supports the Profile interface ****MUST**** produce an object of the following 
structure, if a Profile has been established by the controller of a DID:

```json
{
  "type": "Profile",
  "descriptors": [
    {
      "@context": "http://schema.org",
      "@type": "Person",
      "name": "Jeffrey Lebowski",
      "givenName": "Jeffery",
      "middleName": "The Big",
      "familyName": "Lebowski",
      "description": "That's just, like, your opinion, man.",
      "website": "https://ilovebowling.com",
      "email": "jeff@ilovebowling.com",
      "image": IMG_URL,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "5227 Santa Monica Boulevard",
        "addressLocality": "Los Angeles",
        "addressRegion": "CA"
      }
    },
    {...},
    {...}
  ]
}
```

An object ****MUST**** have one or more descriptors. The first element of the descriptors array is primary, and ****SHOULD**** be used unless another schema in the array is explicitly required.

#### Read

```json
{
  "descriptor": {
    "method": "ProfileRead"
  }
}
```

#### Write

```json
{
  "descriptor": {
    "cid": CID(data),
    "clock": 4,
    "method": "ProfileWrite",
    "format": "json"
  },
  "data": {
    "type": "Profile",
    "descriptors": [...]
  }
}
```

`ProfileWrite` messages are JSON objects that ****must**** be composed as follows:

- The message object ****MAY**** contain a `data` property, or its data may be conveyed through an external channel, and the data ****MUST**** be a JSON object that conforms with the data model described in the [Profile Data Model](#data-model-1) section above.
- The message object ****MUST**** `descriptor` property ****MUST**** be a JSON object composed as follows:
  - The `descriptor` object ****MUST**** contain a `cid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoding of the data associated with the message.
  - The `descriptor` object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `ProfileWrite`.
  - The `descriptor` object ****MUST**** contain a `clock` property, and its value ****MUST**** be an integer representing an incrementing logical counter.
  - The `descriptor` object ****MUST**** contain a `format` property, and its value ****MUST**** be the string `json`.
  - The `descriptor` object ****MAY**** contain an `encryption` property, and its value ****MUST**** be a string indicating what encryption scheme is being used. Currently the only supported scheme is [[spec:rfc7516]] JSON Web Encryption (JWE), and when a message's data is encrypted the `encryption` property MUST be set to the string `jwe`.

#### Delete

```json
{
  "descriptor": {
    "method": "ProfileDelete"
  }
}
```

### Collections

To maximize decentralized app and service interoperability, the Collections interface of Identity Hubs 
provides a mechanism to store data relative to shared schemas. By storing data in accordance with a 
given schema, which may be well-known in a given vertical or industry, apps and services can leverage 
the same datasets across one another, enabling a cohesive, cross-platform, cross-device, cross-app 
experience for users.

#### Query

```json
{
  "descriptor": {
    "method": "CollectionsQuery",
    "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "schema": "https://schema.org/MusicPlaylist"
  }
}
```

::: todo
Add more detail to the other props that can be present in CollectionsQuery messages.
:::

#### Write

```json
{
  "descriptor": {
    "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "cid": CID(data),
    "clock": 0,
    "method": "CollectionsWrite",
    "schema": "https://schema.org/SocialMediaPosting",
    "format": DATA_FORMAT
  },
  "data": {...}
}
```

`CollectionsWrite` messages are JSON objects that ****must**** be composed as follows:

- The message object ****MUST**** `descriptor` property ****MUST**** be a JSON object composed as follows:
  - The `descriptor` object ****MUST**** contain an `id` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The `descriptor` object ****MUST**** contain a `cid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the data associated with the message.
  - The `descriptor` object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsWrite`.
  - The `descriptor` object ****MUST**** contain a `clock` property, and its value ****MUST**** be an integer representing an incrementing logical counter.
  - The `descriptor` object ****MUST**** contain a `format` property, and its value ****MUST**** be a string that indicates the format of the data. The most common format is JSON, which is indicated by setting the value of the `format` property to `json`.

##### Processing Instructions

When processing a `CollectionsWrite` message, Hub instances ****MUST**** perform the following additional steps:
1. If the incoming message has a higher `clock` value than all of the other messages for the logical entry known to the Hub Instance, the message ****MUST**** be designated as the latest state of the logical entry and fully replace all previous messages for the entry.
2. If the incoming message has a lower `clock` value than the message that represents the current state of the logical entry, the message ****MUST NOT**** be applied to the logical entry and its data ****MAY**** be discarded.
3. If the incoming message has a `clock` value equal to the message that represents the current state of the logical entry, the incoming message's IPFS CID and the IPFS CID of the message that represents the current state must be lexicographically compared and handled as follows:
    - If the incoming message has a higher lexicographic value than the message that represents the current state, perform the actions described in Step 1 of this instruction set.
    - If the incoming message has a lower lexicographic value than the message that represents the current state, perform the actions described in Step 2 of this instruction set.

#### Commit

```json
{
  "descriptor": {
    "id": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "cid": CID(data),
    "clock": 0,
    "method": "CollectionsCommit",
    "schema": "https://schema.org/SocialMediaPosting",
    "strategy": "merge-patch",
    "format": DATA_FORMAT
  },
  "data": {...}
}
```

`CollectionsCommit` messages are JSON objects that ****must**** be composed as follows:

- The message object ****MUST**** `descriptor` property ****MUST**** be a JSON object composed as follows:
  - The `descriptor` object ****MUST**** contain an `id` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The `descriptor` object ****MUST**** contain a `cid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the data associated with the message.
  - The `descriptor` object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsWrite`.
  - The `descriptor` object ****MUST**** contain a `clock` property, and its value ****MUST**** be an integer representing an incrementing logical counter.

#### Delete

```json
{
  "descriptor": {
    "method": "CollectionsDelete",
    "id": "Qm65765jrn7be64v5q35v6we675br68jr"
  }
}
```

### Actions

Actions are notifications that are based on some form of directed action the Sender 
wants to convey to the [[ref:Hub User]]. All Actions ****MUST**** be of a type defined 
under the `schema.org/Action` family of objects.

#### Query

```json
{
  "descriptor": {
    "method": "ActionsQuery",
    "schema": "https://schema.org/LikeAction"
  }
}
```

#### Create

```json
{
  "descriptor": {
    "method": "ActionsCreate",
    "schema": "https://schema.org/LikeAction",
    "data": { ... }
  }
}
```

#### Update

```json
{
  "descriptor": {
    "method": "ActionsUpdate",
    "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
    "data": { ... }
  }
}
```

#### Delete

```json
{
  "descriptor": {
    "method": "ActionsDelete",
    "id": "Qm65765jrn7be64v5q35v6we675br68jr"
  }
}
```

### Permissions

The Permissions interface provides a mechanism for external entities to request access 
to a Hub User's non-public data.

#### Request

```json
{
  "descriptor": {
    "method": "PermissionsRequest",
    "schema": "https://schema.org/MusicPlaylist",
    "tags": ["classic rock", "rock", "rock and roll"]
  }
}
```

#### Query

```json
{
  "descriptor": {
    "method": "PermissionsQuery",
    "schema": "https://schema.org/MusicPlaylist",
  }
}
```

#### Grant

```json
{
  "descriptor": {
    "method": "PermissionsGrant",
    "schema": "https://schema.org/MusicPlaylist",
    "tags": ["classic rock", "rock", "rock and roll"]
  }
}
```

#### Revoke

```json
{
  "descriptor": {
    "method": "PermissionsRevoke",
    "id": "Qm65765jrn7be64v5q35v6we675br68jr"
  }
}
```

## Commit Strategies

Some interface methods may be bound to, or allow for choice between, the data modification algorithms detailed below. Interfaces methods that are bound to one or more of these strategies will indicate it within their interface definitions under the [Interfaces](#interfaces) section.

### Last-Write Wins

Last-Write Wins is the most basic Commit Strategy that allows for the traditional experience of posting an update to a file that fully replaces the data.

### JSON Merge Patch

::: todo
Detail JSON Merge Patch as a commit strategy option.
:::

## Hub Configurations

While it is strongly encouraged to implement the full set of Identity Hub features and Interfaces, not all devices and providers may be capable of doing so. To allow for maximum reach and proliferation in the ecosystem, the following are well-recognized configurations of Identity Hub feature sets that tend to serve different purposes.

### Open Data Publication

This Hub configuration is ideal for implementers who seek to expose intentionally public data via the Identity Hub semantic data discovery Interfaces. This implementation is lightweight does not require the implementer to support any of the authentication, permissioning, or ingest mechanisms that other features and Interfaces do.

```json
{
  "type": "FeatureDetection",
  "interfaces": {
    "profile": {
      "ProfileRead": true
    },
    "collections": {
      "CollectionsQuery": true
    }
  }
}
```


## Normative References

[[spec]]
