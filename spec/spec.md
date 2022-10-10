
Decentralized Web Node
==================

**Specification Status:** Draft

**Latest Draft:**
  [identity.foundation/decentralized-web-node/spec](https://identity.foundation/decentralized-web-node/spec)
<!-- -->

**Previous Draft:**
  [0.0.1-predraft](https://identity.foundation/decentralized-web-node/spec/0.0.1-predraft/)

**Editors:**
~ [Daniel Buchner](https://www.linkedin.com/in/dbuchner/) (Block)
~ [Tobias Looker](https://www.linkedin.com/in/tplooker) (Mattr)

**Contributors:**
~ [Henry Tsai](https://www.linkedin.com/in/henry-tsai-6b884014/) (Microsoft)
~ [XinAn Xu](https://www.linkedin.com/in/xinan-xu-b868a326/) (Microsoft)
~ [Moe Jangda](https://www.linkedin.com/in/moejangda/) (Block)

**Participate:**
~ [GitHub repo](https://github.com/decentralized-identity/decentralized-web-node)
~ [File a bug](https://github.com/decentralized-identity/decentralized-web-node/issues)
~ [Commit history](https://github.com/decentralized-identity/decentralized-web-node/commits/main)

------------------------------------

## Abstract

Most digital activities between people, organizations, devices, and other entities 
require the exchange of messages and data. For entities to exchange messages and 
data for credential, app, or service flows, they need an interface through which 
to store, discover, and fetch data related to the flows and experiences they are 
participating in. A Decentralized Web Node (DWN) is a data storage and message relay mechanism 
entities can use to locate public or private permissioned data related to a given 
Decentralized Identifier (DID). Decentralized Web Nodes are a mesh-like datastore construction 
that enable an entity to operate multiple nodes that sync to the same state across 
one another, enabling the owning entity to secure, manage, and transact their data 
with others without reliance on location or provider-specific infrastructure, 
interfaces, or routing mechanisms.

## Status of This Document

Decentralized Web Node is a _DRAFT_ specification under development within
the [Decentralized Identity Foundation](https://identity.foundation) (DIF). It is an active work item of the 
[Secure Data Storage Working Group at DIF](https://identity.foundation/working-groups/secure-data-storage.html).
It incorporates requirements and learnings from related work of many active industry players into a shared
specification that meets the collective needs of the community. 

The specification will be updated to incorporate feedback, from DIF members and 
the wider community, with a reference implementation being developed within DIF 
that exercises the features and requirements defined here. We encourage reviewers 
to submit [GitHub Issues](https://github.com/decentralized-identity/decentralized-web-node/issues) 
as the means by which to communicate feedback and contributions.

## Terminology

[[def:Decentralized Web Node, Decentralized Web Nodes, DWN, Node, Nodes]]
~ A decentralized personal and application data storage and message relay node, 
as defined in the DIF Decentralized Web Node specification. Users may have multiple 
Nodes that replicate their data between them.

[[def:Decentralized Identifiers, Decentralized Identifier, DID]]
~ Unique ID URI string and PKI metadata document format for describing the
cryptographic keys and other fundamental PKI values linked to a unique,
user-controlled, self-sovereign identifier in a target system (e.g., blockchain,
distributed ledger).

## Topology

<img src="images/topology.svg" style="display: block; margin: 0 auto; padding: 1em 0; width: 100%; max-width: 1000px;" />

## Technical Stack

Decentralized Web Nodes are comprised of the following component layers, each of which is defined 
in this specification to ensure multiple Decentralized Web Node implementations can be used together and operate 
as a single logical unit for users.

<style id="protocol-stack-styles">
  #protocol-stack-styles + table {
    display: table;
    width: 400px;
    border-radius: 4px;
    box-shadow: 0 1px 3px -1px rgb(0 0 0 / 80%);
    overflow: hidden;
  }
  #protocol-stack-styles + table tr, #protocol-stack-styles + table td {
    border: none;
  }
  #protocol-stack-styles + table tr {
    text-shadow: 0 1px 2px rgb(255 255 255 / 75%);
  }
  #protocol-stack-styles + table tr:nth-child(1) {
    background: hsl(0deg 100% 87%);
  }
  #protocol-stack-styles + table tr:nth-child(2) {
    background: hsl(0deg 100% 82%);
  }
  #protocol-stack-styles + table tr:nth-child(3) {
    background: hsl(198deg 100% 87%);
  }
  #protocol-stack-styles + table tr:nth-child(4) {
    background: hsl(198deg 100% 77%);
  }
  #protocol-stack-styles + table tr:nth-child(5) {
    background: hsl(274deg 100% 91%);
  }
  #protocol-stack-styles + table tr:nth-child(6) {
    background: hsl(274deg 100% 85%);
  }
  #protocol-stack-styles + table tr:nth-child(7) {
    background: hsl(149deg 100% 86%);
  }
  #protocol-stack-styles + table tr:nth-child(8) {
    background: hsl(149deg 100% 73%);
  }
</style>

:----: |
DID Authentication |
Access & Authorization |
Interface Definitions |
Interface-Specific Processing |
Object Format |
Object Signing / Encryption |
[IPLD Multiformats](https://multiformats.io/) |

## Service Endpoints

The following DID Document Service Endpoint entries ****MUST**** be present in the DID Document of a target DID for DID-relative URL resolution to properly locate the URI for addressing a DID owner's Decentralized Web Nodes:

```json
{
  "id": "did:example:123",
  "service": [{
    "id":"#dwn",
    "type": "DecentralizedWebNode",
    "serviceEndpoint": {
      "nodes": ["https://dwn.example.com", "https://example.org/dwn"]
    }
  }]
}
```

## Addressing

A user's Decentralized Web Nodes can be addressed in many ways, but the mechanisms below ****MUST**** be supported by a compliant Decentralized Web Node implementation:

### DID-Relative URLs

The following DID URL constructions are used to address [[ref: Decentralized Web Nodes]] found to be associated 
with a given DID, as located via the DID resolution process.

#### Composition

The following process defines how a DID-Relative URL is composed to address a Decentralized Web Node:

1. Let the base URI authority portion of the DID URL string be the target DID being addressed.
2. Append a `service` parameter to the DID URL string with the value `DecentralizedWebNode`.
3. Assemble an array of the [Message Descriptor](#message-descriptors) objects as desired for encoding in the DID-relative URL
4. JSON stringify the array of [Message Descriptor](#message-descriptors) objects from Step 3, then Base64Url encode the stringified output.
5. Append a `queries` parameter to the DID URL string with the value set to the JSON stringified, Base64Url encoded output of Step 4.

**DID-relative URLs are composed of the following segments**

`did:example:123` + `?service=DecentralizedWebNode` + `&queries=` + `toBase64Url( JSON.stringify( [{ DESCRIPTOR_1 }, { DESCRIPTOR_N }] ) )`

```json
did:example:123?service=DecentralizedWebNode&queries=W3sgTUVTU0FHRV8xIH0sIHsgTUVTU0FHRV9OIH1d...
```

#### Resolution

The following process defines how a DID-Relative URL for a Decentralized Web Node is resolved:

1. Resolve the DID in the authority portion of the URL in accordance with the [W3C Decentralized Identifier Resolution](https://w3c.github.io/did-core/#resolution) process, which returns the DID Document for the resolved DID.
2. As indicated by the presence of the `service` parameter, locate the `DecentralizedWebNode` entry in the DID Document's [Service Endpoint](https://w3c.github.io/did-core/#services) entries.
3. Parse the `DecentralizedWebNode` Service Endpoint object and select the first URI present in the `serviceEndpoint` objects `nodes` array. NOTE: implementers ****SHOULD**** select from the URIs in the `nodes` array in index order.
4. If the URI located in step 3 is not a DID URI, proceed to step 5. If the URI from step 3 is a DID, resolve the DID and follow steps 2 and 3 to select the first URI in the DID's `DecentralizedWebNode` Service Endpoint object `nodes` array that is not a DID URI. Do not iterate this loop more than once - if a non-DID URI cannot be located after one loop of recursive resolution, terminate resolution and produce an error.
5. Assuming a non-DID URI was located in steps 2-4, let the located URI be the base URI of the [[ref: Decentralized Web Node]] request being constructed.

#### Request Construction

**DID-Relative URL example for passing multiple messages:**

::: note
For example purposes, the `queries` parameter value below is neither JSON stringified nor Base64Url encoded, but should be when using Decentralized Web Node URLs in practice (see the [DID-relative URL Composition](#composition) instructions above).
:::

```json
did:example:123?service=DecentralizedWebNode&queries=[{ "method": "CollectionsQuery", "schema": "https://schema.org/SocialMediaPosting" }]
```

```json
did:example:123?service=DecentralizedWebNode&queries=W3sgTUVTU0FHRV8xIH0sIHsgTUVTU0FHRV9OIH1d...
```

**Resolve DID to locate its Decentralized Web Node URIs:**

`did:example:123` -->  resolve to Decentralized Web Node endpoint(s)  -->  `https://dwn.example.com/`

**Construct the *Request Object*{id=request-object}:**

1. Create a JSON object for the request.
2. The *Request Object* ****MUST**** include a `messages` property, and its value ****MUST**** be an array composed of [Message](#messages) objects that are generated by parsing the DID-relative URL's `queries` parameter value as a JSON array and performing the following steps for each entry:
    1. Construct a [Message](#messages) object.
    2. Set the `descriptor` property of the [Message](#messages) object to the entry, ensuring it is a valid [Message Descriptor](#message-descriptors) object.
    3. Set the `processing` property of the [Message](#messages) object to the entry, ensuring it is a valid [Message Processing](#message-processing) object.
    3. Augment the [Message](#messages) object with any signing and authorization values required, as described in the [Messages](#messages) section.
    4. Append the object to the [Request Object](#request-objects)'s `messages` array.

*HTTP POST example:*

```json5
POST https://dwn.example.com/

BODY {
  "messages": [
    {
      "descriptor": {
        "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
        "method": "CollectionsQuery",
        "schema": "https://schema.org/SocialMediaPosting"
      },
      "processing": {
        "target": "did:example:alice",
        "recipient": "did:example:bob",
      }
    },
    {...}
  ]
}
```

## Request Objects

Request Objects are JSON object envelopes used to pass messages to Decentralized Web Nodes.

```json
{  // Request Object
  "messages": [  // Message Objects
    {...},
    {...},
    {...}
  ]
}
```

Request Objects are composed as follows:

1. The *Request Object* ****MUST**** include a `target` property, and its value ****MUST**** be the Decentralized Identifier base URI of the DID-relative URL.
2. The *Request Object* ****MUST**** include a `messages` property, and its value ****MUST**** be an array composed of [Message](#messages) objects.

## Messages

All Decentralized Web Node messaging is transacted via Messages JSON objects. These objects contain message execution parameters, authorization material, authorization signatures, and signing/encryption information. For various purposes Messages rely on IPFS CIDs and DAG APIs.

```json
{  // Request Object
  "messages": [  // Message Objects
    {
      "data": BASE64URL_STRING,
      "descriptor": {
        "nonce": 32BYTE_RANDOM_NUMBER,
        "method": INTERFACE_METHOD_STRING,
        "dataCid": DATA_CID_STRING,
        "dataFormat": DATA_FORMAT_STRING,
      },
      "processing": {
        "target": "did:example:alice",
        "recipient": "did:example:bob",
      }
    },
    {...}
  ]
}
```

Messages objects ****MUST**** be composed as follows:

In order to enable data replication features for a [[ref: Decentralized Web Node]], all Messages MUST be committed to an IPFS DAG in a tree allocated to the DID of the owner after all subtrees are composed and committed. The top-level of Message objects MUST be committed as a [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded object.

- Message objects ****MAY**** contain a `data` property, and if present its value ****MUST**** be a `base64Url` encoded string of the Message's data.
- Message objects ****MUST**** contain a `processing` property, and its value ****MUST**** be an object with values used for internal processing of the message across the target DID's DWeb Nodes, composed as follows:
  - The object ****MUST**** contain a `target` property, and its value ****MUST**** be the DID URI string of the party whose DWeb Node the message is being committed to for retention.
  - The object ****MUST**** contain a `recipient` property, and its value ****MUST**** be the DID URI string of the counterparty who the message is logically intended for.
- Message objects ****MUST**** contain a `descriptor` property, and its value ****MUST**** be an object composed as follows:
  - The object ****MUST**** contain a `nonce` property, and its value ****MUST**** be a cryptographically random string that ensures each object is unique.
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be a string that matches a Decentralized Web Node Interface method.
  - If the [Message](#messages) has data associated with it, passed directly via the `data` property of the [Message](#messages) or an external channel (e.g. IPFS fetch), the `descriptor` object ****MUST**** contain a `dataCid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG PB](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-pb.md) encoded data.
  - If the [Message](#messages) has data associated with it, passed directly via the `data` property of the [Message](#messages) object or through a channel external to the message object, the `descriptor` object ****MUST**** contain a `dataFormat` property, and its value ****MUST**** be a string that corresponds with a registered [IANA Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml) data format (the most common being plain JSON, which is indicated by setting the value of the `dataFormat` property to `application/json`), or one of the following format strings pending registration:
    - `application/vc+jwt` - the data is a JSON Web Token (JWT) [[spec:rfc7519]] formatted variant of a [W3C Verifiable Credential](https://www.w3.org/TR/vc-data-model/#json-web-token).
    - `application/vc+ldp` - the data is a JSON-LD formatted [W3C Verifiable Credential](https://www.w3.org/TR/vc-data-model).

::: note
Individual Interface methods may describe additional properties that the `descriptor` object ****MUST**** or ****MAY**** contain, which are detailed in the [Interfaces](#interfaces) section of the specification.
:::

### Message Authorization

Some messages may require authorization material for processing them in accordance with the permissions a [[ref: Decentralized Web Node]] owner has specified. If a message requires authorization it ****MUST**** include an `authorization` property with a value that is a [[spec:rfc7515]] General JSON Web Signature (JWS), constructed as follows:

```json
{  // Request Object
  "messages": [  // Message Objects
      "data": BASE64URL_STRING,
      "descriptor": {
        "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
        "method": "CollectionsWrite",
        "schema": "https://schema.org/SocialMediaPosting",
        "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
        "dataCid": CID(data),
        "dateCreated": 123456789,
        "dataFormat": "application/json"
      },
      "processing": {
        "target": "did:example:alice",
        "recipient": "did:example:bob",
      },
      "attestation": {
        "payload": "89f5hw458fhw958fq094j9jdq0943j58jfq09j49j40f5qj30jf",
        "signatures": [{
          "protected": "4d093qj5h3f9j204fq8h5398hf9j24f5q9h83402048h453q",
          "signature": "49jq984h97qh3a49j98cq5h38j09jq9853h409jjq09h5q9j4"
        }]
      },
      "authorization": {
        "payload": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "signatures": [{
          "protected": "f454w56e57r68jrhe56gw45gw35w65w4f5i54c85j84wh5jj8h5",
          "signature": "5678nr67e56g45wf546786n9t78r67e45657bern797t8r6e5"
        }]
      }
    },
    {...}
  ]
}
```

- The JWS ****MUST**** include a `protected` property, and its value ****must**** be an object composed of the following values:
  - The object ****MUST**** include an `alg` property, and its value ****MUST**** be the string representing the algorithm used to verify the signature (as defined by the [[spec:rfc7515]] JSON Web Signature specification).
  - The object ****MUST**** include a `kid` property, and its value ****MUST**** be a [DID URL](https://w3c.github.io/did-core/#example-a-unique-verification-method-in-a-did-document) string identifying the key to be used in verifying the signature.
- The JWS ****MUST**** include a `payload` property, and its value ****must**** be an object composed of the following values:
  - The object ****MUST**** include a `descriptorCid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `descriptor` object.
  - The object ****MUST**** include a `processingCid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `processing` object.
  - The object ****MAY**** include a `permissionsGrantCid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded  [Permission Grant](#grant) being invoked.
  - If attestation of an object is permitted, the `payload` ****MAY**** include an `attestationCid` property, and its value ****MUST**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `attestation` string.

### Raw Data

If there is no need or desire to sign or encrypt the content of a message (i.e. public repudiable data), the message `descriptor` object is the only property required in a [Message](#messages) (with any method-specific properties required). An optional `data` property may be passed at the [Message](#messages) level that contains the data associated with the message (when data is desired or required to be present for a given method invocation).

```json
{ // Message
  "data": BASE64URL_STRING,
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsWrite",
    "schema": "https://schema.org/InviteAction",
    "dataCid": CID(data),
    "dateCreated": 123456789,
    "dataFormat": "application/json"
  },
  "processing": {
    "target": "did:example:alice",
    "recipient": "did:example:bob",
  }
}
```

### Signed Data

If the object is to be attested by a signer (e.g the Node owner via signature with their DID key), the object ****MUST**** contain the following additional properties to produce a [[spec:rfc7515]] General JSON Web Signature (JWS):

```json
{ // Message
  "data": {...},
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsWrite",
    "schema": "https://schema.org/InviteAction",
    "dataCid": CID(data),
    "dateCreated": 123456789,
    "dataFormat": "application/json"
  },
  "processing": {
    "target": "did:example:alice",
    "recipient": "did:example:bob",
  },
  "attestation": {
    "payload": "89f5hw458fhw958fq094j9jdq0943j58jfq09j49j40f5qj30jf",
    "signatures": [{
      "protected": "4d093qj5h3f9j204fq8h5398hf9j24f5q9h83402048h453q",
      "signature": "49jq984h97qh3a49j98cq5h38j09jq9853h409jjq09h5q9j4"
    }]
  }
  ...
}
```

The message generating party ****MUST**** construct the signed message object as follows:

1. The [Message](#messages) object ****MUST**** contain an `attestation` property, and its value ****MUST**** be a General object representation of a [[spec:rfc7515]] JSON Web Signature composed as follows: 
    - The object ****must**** include a `payload` property, and its value ****must**** be the stringified [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the [DAG CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md) encoded `descriptor` object, whose composition is defined in the [Message Descriptor](#message-descriptors) section of this specification.
    - The object ****MUST**** include a `protected` property, and its value ****must**** be an object composed of the following values:
        - The object ****MUST**** include an `alg` property, and its value ****MUST**** be the string representing the algorithm used to verify the signature (as defined by the [[spec:rfc7515]] JSON Web Signature specification).
        - The object ****MUST**** include a `kid` property, and its value ****MUST**** be a [DID URL](https://w3c.github.io/did-core/#example-a-unique-verification-method-in-a-did-document) string identifying the key to be used in verifying the signature.
    - The object ****MUST**** include a `signature` property, and its value ****must**** be a signature string produced by signing the `protected` and `payload` values, in accordance with the [[spec:rfc7515]] JSON Web Signature specification.

### Encrypted Data

If the object is to be encrypted (e.g the Node owner encrypting their data to keep it private), the `descriptor` object ****MUST**** be constructed as follows:

```json
{ // Message
  "data": { 
    "protected": ...,
    "recipients": ...,
    "ciphertext": ...,
    "iv": ...,
    "tag": ... 
  },
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsQuery",
    "schema": "https://schema.org/SocialMediaPosting"
  },
  "processing": {
    "target": "did:example:alice",
    "recipient": "did:example:bob",
  }
  ...
}
```

The message generating party ****MUST**** construct an encrypted message as follows:

1. The `encryption` property of the `descriptor` object ****MUST**** be set to the string value `jwe`.
2. Generate a [[spec:rfc7516]] JSON Web Encryption (JWE) object for the data that is to be represented in the message.
3. Generate a [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) from the JWE of the data produced in Step 1, and set the `dataCid` property of the `descriptor` object as the stringified representation of the CID.

### Signed & Encrypted Data

If the object is to be both attributed to a signer and encrypted encrypted, it ****MUST**** be structured as follows:

```json
{ // Message
  "data": { 
    "protected": ...,
    "recipients": ...,
    "ciphertext": ...,
    "iv": ...,
    "tag": ... 
  },
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsQuery",
    "schema": "https://schema.org/SocialMediaPosting"
  },
  "processing": {
    "target": "did:example:alice",
    "recipient": "did:example:bob",
  },
  "attestation": {
    "payload": "89f5hw458fhw958fq094j9jdq0943j58jfq09j49j40f5qj30jf",
    "signatures": [{
      "protected": "4d093qj5h3f9j204fq8h5398hf9j24f5q9h83402048h453q",
      "signature": "49jq984h97qh3a49j98cq5h38j09jq9853h409jjq09h5q9j4"
    }]
  },
}
```

The message generating party ****MUST**** construct the signed and encrypted message as follows:

1. Follow the instructions described in the [Encrypted Data](#encrypted-data) section to add the required properties to the `descriptor` and produce a [[spec:rfc7516]] JSON Web Encryption (JWE) object from the associated data.
2. Follow the instructions described in the [Signed Data](#signed-data) section to add an `attestation` property with a General object representation of a [[spec:rfc7515]] JSON Web Signature as its value.

### Response Objects

Responses from Interface method invocations are JSON objects that ****MUST**** be constructed as follows:

1. The object ****MAY**** have a `status` property if an error is produced from a general request-related issue, and if present its value ****MUST**** be an object composed of the following properties:
    - The status object ****MUST**** have a `code` property, and its value ****MUST**** be an integer set to the [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) appropriate for the status of the response.
    - The status object ****MAY**** have a `detail` property, and if present its value ****MUST**** be a string that describes a terse summary of the status. It is ****recommended**** that the implementer set the message text to the standard title of the HTTP Status Code, when a title/message has already been defined for that code.
2. The object ****MAY**** have a `replies` property, and if present its value ****MUST**** be an array containing *Message Result Objects*{#message-results-objects} for all messages that were included in the initiating request object. The *Message Result Objects* ****MUST**** be put in the index order that matches the index of each result's corresponding request message. *Message Result Objects* are constructed as follows:
    1. The object ****MUST**** have a `status` property, and its value ****MUST**** be an object composed of the following properties:
        - The status object ****MUST**** have a `code` property, and its value ****MUST**** be an integer set to the [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) appropriate for the status of the response.
        - The status object ****MAY**** have a `detail` property, and if present its value ****MUST**** be a string that describes a terse summary of the status. It is ****recommended**** that the implementer set the message text to the standard title of the HTTP Status Code, when a title/message has already been defined for that code.
    2. The object ****MAY**** have a `entries` property if the message request was successful. If present, its value ****MUST**** be the resulting message entries returned from the invocation of the corresponding message.

#### Request-Level Status Coding

If any of the scenarios described in this section are encountered during general message processing, the implementation ****must**** include a request-level `status` property, and its value must be an object as defined below.

**Target DID not found**

If the DID targeted by a request object is not found within the Decentralized Web Node, the implementation ****MUST**** produce a request-level `status` with the code `404`, and ****SHOULD**** use `Target DID not found within the Decentralized Web Node` as the status `detail` value.

*Response Example:*

::: example Target DID is not found
```json
{
  "status": {
    "code": 404,
    "detail": "Target DID not found within the Decentralized Web Node"
  }
}
```
:::

**General request-level processing errors**

If a general request-level error in processing occurs that is not covered by one of the specific status cases above and prevent the implementation from correctly evaluating the request, the implementation ****MUST**** produce a request-level `status` with the code `500`, and ****SHOULD**** use `The request cannot not be processed` as the status `detail` value.

*Response Example:*

::: example General request processing error
```json
{
  "status": {
    "code": 500,
    "detail": "The request could not be processed correctly"
  }
}
```
:::

#### Message-Level Status Coding

If any of the scenarios described in this section are encountered during the processing of an individual message, the implementation ****must**** include a message-level `status` property, and its value must be an object as defined below.

**Message succeeded for query/read-type interface that expects results**

If a message is processed correctly and a set of result `entries` is expected, the implementation ****MUST**** include a message-level `status` object with its `code` property set to `200`, and ****SHOULD**** use `The message was successfully processed` as the status `detail` value.

::: note
If no results are found, the `status` remains `200`, and the implementation ****MUST**** return an empty `entries` array.
:::

*Request Example:*

```json
{  // Request Object
  "messages": [  // Message Objects
    {
      "descriptor": {
        "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
        "method": "CollectionsQuery",
        "schema": "https://schema.org/SocialMediaPosting"
      }
    },
    ...
  ]
}
```

*Response Example:*

::: example Example response object
```json
{
  "replies": [
    {
      "status": { "code": 200, "detail": "OK" },
      "entries": [...]
    }
  ]
}
```
:::

**Improperly constructed message**

If a message is malformed or constructed with invalid properties/values, the implementation ****MUST**** include a message-level `status` object with its `code` property set to `400`, and ****SHOULD**** use `The message was malformed or improperly constructed` as the status `detail` value.

*Request Example:*

```json
{  // Request Object
  "messages": [  // Message Objects
    {
      "descriptorization": {
        "methodical": "CollectionsQuery",
        "schemata": "https://schema.org/SocialMediaPosting"
      }
    }
  ]
}
```

*Response Example:*

::: example Example response object
```json
{
  "replies": [
    {
      "status": { "code": 400, "detail": "The message was malformed or improperly constructed" }
    }
  ]
}
```
:::

**Message failed authorization requirements**

If a message fails to meet authorization requirements during processing, the implementation ****MUST**** include a message-level `status` object with its `code` property set to `401`, and ****SHOULD**** use `The message failed authorization requirements` as the status `detail` value.

*Request Example:*

```json
{  // Request Object
  "messages": [  // Message Objects
    { // Message
      "data": {...},
      "descriptor": {
        "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
        "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
        "dataCid": CID(data),
        "dateCreated": 123456789,
        "method": "CollectionsWrite",
        "schema": "https://schema.org/SocialMediaPosting",
        "dataFormat": "application/json"
      }

      ^  `authorization` PROPERTY MISSING
    }
  ]
}
```

*Response Example:*

::: example Example response object
```json
{
  "replies": [
    {
      "status": { "code": 401, "detail": "OK" }
    }
  ]
}
```
:::

**Interface is not implemented**

If a message attempts to invoke an interface `method` that is not the implementation does not support, the implementation ****MUST**** include a message-level `status` object with its `code` property set to `501`, and ****SHOULD**** use `The interface method is not implemented` as the status `detail` value.

*Request Example:*

```json
{  // Request Object
  "messages": [  // Message Objects
    { // Message
      "data": {...},
      "descriptor": {
        "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
        "dataCid": CID(data),
        "method": "CollectionsWrite",
        "schema": "https://schema.org/LikeAction",
        "dataFormat": "application/json"
      }
    }
  ]
}
```

*Response Example:*

::: example Example response object
```json
{
  "replies": [
    {
      "status": {
        "code": 501,
        "detail": "The interface method is not implemented"
      }
    }
  ]
}
```
:::

**Resource consumption limit exceeded**

If the DWeb Node instance receiving the request has determined that the rate of resource consumption has exceeded its tolerances and cannot process the request, the instance ****MUST**** respond with the following status entry:

*Response Example:*

::: example Example response object
```json
{
  "replies": [
    {
      "status": {
        "code": 429,
        "detail": "Resource consumption has exceeded tolerances"
      }
    }
  ]
}
```
:::

## Interfaces

### Feature Detection

The Decentralized Web Node specification defines well-recognized Decentralized Web Node configurations to maximize 
interoperability (see Configurations), but implementers may wish to support a custom 
subset of the Interfaces and features. The Feature Detection interface is the means by 
which a Decentralized Web Node expresses support for the Interfaces and features it implements.

#### Data Model

A compliant Decentralized Web Node ****MUST**** produce a Feature Detection object 
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
    - The object ****MAY**** contain a `collections` property. If the property is not present, 
    it indicates the Decentralized Web Node implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `CollectionsQuery`
      - `CollectionsWrite`
      - `CollectionsCommit`
      - `CollectionsDelete`
    - The object ****MAY**** contain a `permissions` property. If the property is not present, 
    it indicates the Decentralized Web Node implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `PermissionsRequest`
      - `PermissionsGrant`
      - `PermissionsRevoke`
    - The object ****MAY**** contain a `hooks` property. If the property is not present, 
    it indicates the Decentralized Web Node implementation does not support any methods of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    method, while a boolean `false` value or omission of the property indicates the interface 
    method is not supported:
      - `HooksWrite`
      - `HooksQuery`
      - `HooksDelete`
- The object ****MAY**** contain a `messaging` property, and its value ****MAY**** be an object composed of the following:
    - The object ****MAY**** contain a `batching` property, and if present its value ****MUST**** be a boolean indicating whether the Decentralized Web Node handles multiple messages in a single request. The absence of this property ****shall**** indicate that the Decentralized Web Node ****does**** support multiple messages in a single request, thus if an implementer does not support multiple messages in a request, they ****MUST**** include this property and explicitly set its value to `false`.
  

#### Read

All compliant Decentralized Web Nodes ****MUST**** respond with a valid Feature Detection object when receiving 
the following request object:

```json
{ // Message
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "FeatureDetectionRead"
  }
}
```

### Collections

To maximize decentralized app and service interoperability, the Collections interface of Decentralized Web Nodes 
provides a mechanism to store data relative to shared schemas. By storing data in accordance with a 
given schema, which may be well-known in a given vertical or industry, apps and services can leverage 
the same datasets across one another, enabling a cohesive, cross-platform, cross-device, cross-app 
experience for users.

#### Query

`CollectionsQuery` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsQuery`.
  - The object ****MAY**** contain a `filter` property, and if present its value ****MUST**** be an object that ****MAY**** contain the following properties:
    - The object ****MAY**** contain a `contextId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
    - The object ****MAY**** contain a `schema` property, and if present its value ****Must**** be a URI string that indicates the schema of the associated data.
    - The object ****MAY**** contain a `recordId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
    - The object ****MAY**** contain a `contextId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
    - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
      - If the object contains a `protocol` property the object ****MUST**** also contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
    - The object ****MAY**** contain a `dataFormat` property, and its value ****MUST**** be a string that indicates the format of the data in accordance with its MIME type designation. The most common format is JSON, which is indicated by setting the value of the `dataFormat` property to `application/json`.
    - The object ****MAY**** contain a `dateSort` field, and if present its value ****MUST**** be one of the following strings:
        - `createdAscending`: return results in order from the earliest `dateCreated` value to the latest.
        - `createdDescending`: return results in order from the latest `dateCreated` value to the earliest.
        - `publishedAscending`: return results in order from the earliest `datePublished` value to the latest.
        - `publishedDescending`: return results in order from the latest `datePublished` value to the earliest.

Get a single object by its ID reference:

```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsQuery",
    "filter": {
      "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e"
    }
  }
}
```

Get a objects of a given schema type:
```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsQuery",
    "filter": {
      "schema": "https://schema.org/MusicPlaylist"
    }
  }
}
```

Get all objects of a given schema type:
```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsQuery",
    "dateSort": "createdDescending",
    "filter": {
      "dataFormat": "image/gif"
    }
  }
}
```
 
#### Write

`CollectionsWrite` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsWrite`.
  - The object ****MUST**** contain a `recordId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `contextId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
    - If the object contains a `protocol` property the object ****MUST**** also contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
  - The object ****MAY**** contain a `schema` property, and if present its value ****Must**** be a URI string that indicates the schema of the associated data.
  - The object ****MAY**** contain a `published` property, and if present its value ****Must**** be a boolean indicating the record's publication state. A value of `true` indicates the record has been published for public queries and consumption without requiring authorization. A value of `false` or the absence of the property indicates the record ****MUST NOT**** be served in response to public queries that lack proper authorization.
  - The object ****MUST**** contain a `dateCreated` property, and its value ****MUST**** be a [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that ****MUST**** be set and interpreted as the time the logical entry was created by the DID owner or another permitted party.
  - The object ****MAY**** contain a `datePublished` property, and its value ****MUST**** be a [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that ****MUST**** be set and interpreted as the time the logical entry was published by the DID owner or another permitted party.

```json
{ // Message
  "data": {...},
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "dataCid": CID(data),
    "dateCreated": 123456789,
    "published": true,
    "method": "CollectionsWrite",
    "schema": "https://schema.org/SocialMediaPosting",
    "dataFormat": DATA_FORMAT
  }
}
```

##### Processing Instructions

When processing a `CollectionsWrite` message, Decentralized Web Nodes ****MUST**** perform the following additional steps:

1. If the incoming message has a higher `dateCreated` value than all of the other messages for the logical entry known to the Decentralized Web Node, the message ****MUST**** be designated as the latest state of the logical entry and fully replace all previous messages for the entry.
2. If the incoming message has a lower `dateCreated` value than the message that represents the current state of the logical entry, the message ****MUST NOT**** be applied to the logical entry and its data ****MAY**** be discarded.
3. If the incoming message has a `dateCreated` value equal to the message that represents the current state of the logical entry, the incoming message's IPFS CID and the IPFS CID of the message that represents the current state must be lexicographically compared and handled as follows:
    - If the incoming message has a higher lexicographic value than the message that represents the current state, perform the actions described in Step 1 of this instruction set.
    - If the incoming message has a lower lexicographic value than the message that represents the current state, perform the actions described in Step 2 of this instruction set.

#### Commit

```json
{ // Message
  "data": {...},
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "dataCid": CID(data),
    "dateCreated": 123456789,
    "method": "CollectionsCommit",
    "schema": "https://schema.org/SocialMediaPosting",
    "strategy": "merge-patch",
    "dataFormat": DATA_FORMAT
  }
}
```

`CollectionsCommit` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsCommit`.
  - The object ****MUST**** contain a `recordId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `contextId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
    - If the object contains a `protocol` property the object ****MUST**** also contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
  - The object ****MAY**** contain a `schema` property, and if present its value ****Must**** be a URI string that indicates the schema of the associated data.
  - The object ****MUST**** contain a `dateCreated` property, and its value ****MUST**** be a [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that ****MUST**** be set and interpreted as the time the logical entry was created by the DID owner or another permitted party.
  - The object ****MAY**** contain a `datePublished` property, and its value ****MUST**** be a [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that ****MUST**** be set and interpreted as the time the logical entry was published by the DID owner or another permitted party.

#### Delete

```json
{ // Message
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "CollectionsDelete",
    "recordId": "b6464162-84af-4aab-aff5-f1f8438dfc1e"
  }
}
```

`CollectionsDelete` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `CollectionsDelete`.
  - The object ****MUST**** contain a `recordId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string of the record to be deleted.

### Permissions

The Permissions interface provides a mechanism for external entities to request access 
to various data and functionality provided by a Decentralized Web Node. Permissions employ a 
capabilities-based architecture that allows for DID-based authorization and delegation 
of authorized capabilities to others, if allowed by the owner of a Decentralized Web Node.

#### Request

`PermissionsRequest` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `PermissionsRequest`.
  - The object ****MUST**** contain a `grantedBy` property, and its value ****MUST**** be the DID URI string of the party that is granting the permission.
  - The object ****MUST**** contain a `grantedTo` property, and its value ****MUST**** be the DID URI string of the party that is being granted the permission.
  - The object ****MAY**** contain a `description` property, and its value ****MUST**** be a string that the requesting party uses to communicate what the permission is being used for.
  - The object ****MUST**** contain a `scope` property, and its value ****Must**** be an object of the following properties:
    - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the interface method the requesting party wants to invoke.
    - The object ****MAY**** contain a `schema` property, and its value ****Must**** be a URI string that indicates the schema of the associated data.
    - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
    - The object ****MAY**** contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
    - The object ****MAY**** contain a `recordId` property, and its value ****Must**** be a UUID 4 string reference to an object.
    - The object ****MAY**** contain a `contextId` property, and its value ****Must**** be a UUID 4 string reference to a contextually segmented group of objects.
  - The object ****MAY**** contain a [`conditions` property](#permission-conditions){ id=permission-conditions }, and its value ****Must**** be an object of the following properties:
    - The object ****MAY**** contain an `attestation` property, and if present its value ****Must**** be a `string` representing the signing conditions detailed below. If the property is not present it ****MUST**** be evaluated as if it were set to the value `optional`.
      - `prohibited` - the object ****MUST NOT**** be signed.
      - `optional` - the object ****MAY**** be signed using a key linked to the DID of the owner of a Decentralized Web Node or authoring party (whichever is relevant to the application-level use case). 
      - `required` - the object ****MUST**** be signed using a key linked to the DID of the owner of a Decentralized Web Node or authoring party (whichever is relevant to the application-level use case). 
    - The object ****MAY**** contain an `encryption` property, and if present its value ****Must**** be a `string` representing the encryption conditions detailed below. If the property is not present it ****MUST**** be evaluated as if it were set to the value `optional`.
      - `optional` - the object ****MAY**** be encrypted using the key provided by the owner of a Decentralized Web Node in the [[spec:rfc7516]] JSON Web Encryption (JWE) format.
      - `required` - the object ****MUST**** be encrypted using the key provided by the owner of a Decentralized Web Node in the [[spec:rfc7516]] JSON Web Encryption (JWE) format.
    - The object ****MAY**** contain a `delegation` property, and its value ****Must**** be a boolean, wherein `true` indicates the issuing party is allowing the grantee the ability to delegate the capability. A value of `false` or omission of the property ****MUST**** be evaluated as false, and indicates the grantee ****MUST NOT**** be allowed to delegate the capability.
    - The object ****MAY**** contain a `publication` property, and its value ****Must**** be a boolean, wherein `true` indicates the issuing party is allowing the grantee the ability to publish data tied to methods that support the `public` boolean value in their descriptor field sets. Conforming implementations ****MUST**** throw an error and fail to grant a permission if this property is present and the `method` does not support publication.
    - The object ****MAY**** contain a `sharedAccess` property, and its value ****Must**** be a boolean, wherein `true` indicates the requesting 
      party wants the ability to use the permission against any object or data that aligns with the capability's definition, regardless of which 
      entity created the object or data. A value of `false` or omission of the property ****MUST**** be evaluated as false, and indicates the 
      requesting party only needs the ability to invoke the permission against objects or data it creates.
- The message object ****MUST**** contain an `authorization` property, which ****MUST**** be a JSON object as defined by the [Message Authorization](#message-authorization) 
  section of this specification, with the requirement that the `kid` and `signature` ****MUST**** match the DID of the requesting party.

```json
{
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "PermissionsRequest",
    "permissionRequestId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "grantedBy": "did:example:alice",
    "grantedTo": "did:example:bob",
    "description": "Help you create and edit your music playlists",
    "scope": {
      "method": "CollectionsWrite",
      "schema": "https://schema.org/MusicPlaylist"
    },
    "conditions": {
      "delegation": true,
      "publication": true,
      "sharedAccess": true,
      "encryption": "optional",
      "attestation": "prohibited"
    }
  },
  "authorization": {
    "payload": "89f5hw458fhw958fq094j9jdq0943j58jfq09j49j40f5qj30jf",
    "signatures": [{
      "protected": "4d093qj5h3f9j204fq8h5398hf9j24f5q9h83402048h453q",
      "signature": "49jq984h97qh3a49j98cq5h38j09jq9853h409jjq09h5q9j4"
    }]
  }
}
```

#### Grant

`PermissionsGrant` messages are JSON objects containing capabilities granted to parties that curtail the scope of permitted activities an invoker can perform. They are generated either in response to a `PermissionsRequest` message or optimistically by a user agent without an initiating `PermissionsRequest`. `PermissionsGrant` messages include general [Message Descriptor](#message-descriptors) properties and the following additional properties:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `PermissionsGrant`.
  - The object ****MUST**** contain a `permissionGrantId` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string representing the reply object.
  - If the granted permission is in response to a `PermissionRequest`, the object ****MUST**** contain a `permissionRequestId` property, and its value ****MUST**** be the [[spec:rfc4122]] UUID Version 4 string of the `PermissionRequest` object the permission is being granted in relation to.
  - The object ****MUST**** contain a `grantedBy` property, and its value ****MUST**** be the DID URI string of the party that is granting the permission.
  - The object ****MUST**** contain a `grantedTo` property, and its value ****MUST**** be the DID URI string of the party that is being granted the permission.
  - If the `PermissionsGrant` is a delegated permission, the object ****MUST**** contain a `delegatedFrom` property, and its value ****MUST**** be an [[spec:rfc4122]] UUID Version 4 string matching the `permissionGrantId` of the `PermissionsGrant` it was delegated from.
  - The object ****MUST**** contain a `expiry` property, and its value ****MUST**** be a [Unix epoch timestamp](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html#tag_04_16) that can be used to trigger revocation activities.
  - The object ****MUST**** contain a `scope` property, and its value ****Must**** be an object of the following properties:
    - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the interface method the requesting party wants to invoke.
    - The object ****MAY**** contain a `schema` property, and its value ****Must**** be a URI string that indicates the schema of the associated data.
    - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
    - The object ****MAY**** contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
    - The object ****MAY**** contain a `recordId` property, and its value ****Must**** be a UUID 4 string reference to an object.
    - The object ****MAY**** contain a `contextId` property, and its value ****Must**** be a UUID 4 string reference to a contextually segmented group of objects.
  - The object ****MAY**** contain a [`conditions` property](#permission-conditions){ id=permission-conditions }, and its value ****Must**** be an object of the following properties:
    - The object ****MAY**** contain an `attestation` property, and if present its value ****Must**** be a `string` representing the signing conditions detailed below. If the property is not present it ****MUST**** be evaluated as if it were set to the value `optional`.
      - `prohibited` - the object ****MUST NOT**** be signed.
      - `optional` - the object ****MAY**** be signed using a key linked to the DID of the owner of a Decentralized Web Node or authoring party (whichever is relevant to the application-level use case). 
      - `required` - the object ****MUST**** be signed using a key linked to the DID of the owner of a Decentralized Web Node or authoring party (whichever is relevant to the application-level use case). 
    - The object ****MAY**** contain an `encryption` property, and if present its value ****Must**** be a `string` representing the encryption conditions detailed below. If the property is not present it ****MUST**** be evaluated as if it were set to the value `optional`.
      - `optional` - the object ****MAY**** be encrypted using the key provided by the owner of a Decentralized Web Node in the [[spec:rfc7516]] JSON Web Encryption (JWE) format.
      - `required` - the object ****MUST**** be encrypted using the key provided by the owner of a Decentralized Web Node in the [[spec:rfc7516]] JSON Web Encryption (JWE) format.
    - The object ****MAY**** contain a `delegation` property, and its value ****Must**** be a boolean, wherein `true` indicates the issuing party is allowing the grantee the ability to delegate the capability. A value of `false` or omission of the property ****MUST**** be evaluated as false, and indicates the grantee ****MUST NOT**** be allowed to delegate the capability.
    - The object ****MAY**** contain a `publication` property, and its value ****Must**** be a boolean, wherein `true` indicates the issuing party is allowing the grantee the ability to publish data tied to methods that support the `public` boolean value in their descriptor field sets. Conforming implementations ****MUST**** throw an error and fail to grant a permission if this property is present and the `method` does not support publication.
    - The object ****MAY**** contain a `sharedAccess` property, and its value ****Must**** be a boolean, wherein `true` indicates the requesting 
      party wants the ability to use the permission against any object or data that aligns with the capability's definition, regardless of which 
      entity created the object or data. A value of `false` or omission of the property ****MUST**** be evaluated as false, and indicates the 
      requesting party only needs the ability to invoke the permission against objects or data it creates.
- The message object ****MUST**** contain an `authorization` property, which ****MUST**** be a JSON object as defined by the [Message Authorization](#message-authorization) 
  section of this specification, with the requirement that the `kid` and `signature` ****MUST**** match the DID of the requesting party.
- The message ****MUST**** contain a `data` payload, which is a JSON Web Token representation of the granted permission, as defined in the [Capability Objects](#capability-objects) section below.
- The message ****MUST**** contain an `encryptionKey` property if the data transacted using the permission grant is to be encrypted, per the directives for encryption under the `encryption` field of the permission's [conditions](#permission-conditions). If present, the value of the `encryptionKey` property ****MUST**** be a [[spec:rfc7516]] JSON Web Encryption (JWE) object that contains the encrypted key material required for an authorized party to decrypt the JWE represented by the `dataCid` value within the `descriptor` object.

```json
{
  "descriptor": {
    "method": "PermissionsGrant",
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "permissionGrantId": "f45wve-5b56v5w-5657b4e-56gqf35v",
    "permissionRequestId": "b6464162-84af-4aab-aff5-f1f8438dfc1e",
    "grantedBy": "did:example:bob",
    "grantedTo": "did:example:carol",
    "expiry": 1575606941,
    "delegatedFrom": PARENT_PERMISSION_GRANT,
    "scope": {
      "method": "CollectionsWrite",
      "schema": "https://schema.org/MusicPlaylist",
      "recordId": "f45wve-5b56v5w-5657b4e-56gqf35v"
    },
    "conditions": {
      "delegation": true,
      "publication": true,
      "sharedAccess": true,
      "encryption": "optional",
      "attestation": "prohibited"
    }
  },
  "authorization": {
    "payload": "89f5hw458fhw958fq094j9jdq0943j58jfq09j49j40f5qj30jf",
    "signatures": [{
      "protected": "4d093qj5h3f9j204fq8h5398hf9j24f5q9h83402048h453q",
      "signature": "49jq984h97qh3a49j98cq5h38j09jq9853h409jjq09h5q9j4"
    }]
  },
  "encryptionKey": { 
    "protected": ...,
    "recipients": ...,
    "ciphertext": ...,
    "iv": ...,
    "tag": ... 
  }
}
```

##### Granted Encryption Keys

The `encryptionKey` attribute of a `PermissionsGrant` is a [[spec:rfc7516]] JSON Web Encryption (JWE) object that is composed as follows:

1. The `kid` field of the JWE header ****MUST**** be a DID URL that identifies the public key type designated for encryption in the DID Document of the `PermissionGrant` recipient.
2. The `ciphertext` field ****MUST**** be encrypted with the `X25519` public key designated for encryption in the DID Document of the `PermissionGrant` recipient.
3. The data encrypted in the object's `ciphertext` field ****MUST**** be the JSON Web Key (JWK) object representation of a `AES-256` symmetric encryption key generated by the owner of the DWeb Node that will be used to encrypt the data transacted in relation to the associated `PermissionGrant`.


##### Grantor `PermissionsGrant` Storage

After generating a `PermissionsGrant` the user agent (e.g. wallet app with access to authoritative keys for a given DID) ****MUST**** commit the granted permission object to the Decentralized Web Node of the DID the grant was issued from. This will ensure that the permission is present when addressed in subsequent interface method invocations.

##### Grantee `PermissionsGrant` Delivery

Once a user agent (e.g. wallet app with access to authoritative keys for a given DID) generates a `PermissionsGrant` for an entity to permit access to data and functionality, it is the responsibility of the user agent that generated the `PermissionsGrant` to deliver it to the entity that is the subject. To do this, the user agent ****MUST**** generate a Request that includes the `PermissionsGrant` and send it to the Decentralized Web Node of the subject it has been granted to, in accordance with the [Resolution](#resolution) and [Request Construction](#request-construction) sections of this specification. 


#### Revoke

Revocation of a permission is the act of closing off any additional or invalid invocations of that permission. The Revoke interface method enables revocation of a permission via direct reference to the permission's `nonce`.

```json
{ // Message
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "PermissionsRevoke",
    "permissionRevokeId": "sdfa4162-84af-4aab-aff5-f1f8438dfc1e",
    "permissionGrantId": "b6464162-84af-4aab-aff5-f1f8438dfc1e"
  }
}
```

#### Query

The `PermissionQuery` method exists to facilitate lookup of any retained Permissions objects that exist in a given DID's DWeb Node instance. 

```json
{ // Message
  "descriptor": { // Message Descriptor
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "PermissionsQuery",
    "grantedTo": "did:example:bob"
  }
}
```

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `PermissionsQuery`.
  - The object ****MAY**** contain any of the following properties from the descriptors of `PermissionsRequest`, `PermissionsGrant`, and `PermissionsRevoke` objects:
    - `permissionRequestId`
    - `permissionGrantId`
    - `permissionRevokeId`
    - `grantedBy`
    - `grantedTo`
    - `delegatedFrom`
    - all properties of `scope` objects

### Hooks

Many apps and services require the ability to subscribe to types and subsets of data that enters an individual's DWeb Node to act on it, with the ability to respond to the entity that initiated the write or modification to the data. The most common mechanism known to devs that does the first half this is Web Hooks. Web Hooks are one-way pushes of data to subscribed entities, but do not account for responding to the entities that trigger their invocations.

DWeb Node Hooks aim to not only allow permissioned subscribers to be notified of new data, but also optionally respond to the entity's request that triggers their invocation. This allows a subscribed entity to process the data and send back responses to the entity who may be waiting on results.

#### Write

`HooksWrite` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `HooksWrite`.
  - The object ****MAY**** contain a `hookId` property, and its value ****MUST**** be a [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `previousCid` property, and its value ****MUST**** be a [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the previous `HooksWrite` in the chain.
  - The object ****MUST**** contain a `uri` property, and its value ****MUST**** be a URI string.
  - The object ****MAY**** contain a `filter` property, and if present its value ****MUST**** be an object that ****MAY**** contain the following properties:
    - The object ****MAY**** contain a `recordId` property, and its value ****MUST**** be a [[spec:rfc4122]] UUID Version 4 string.
    - The object ****MAY**** contain a `contextId` property, and its value ****MUST**** be a [[spec:rfc4122]] UUID Version 4 string.
    - The object ****MAY**** contain a `schema` property, and if present its value ****Must**** be a URI string that indicates the schema of the associated data.
    - The object ****MAY**** contain a `protocol` property, and its value ****Must**** be a URI that denotes the Protocol an object is a part of.
      - If the object contains a `protocol` property the object ****MUST**** also contain a `protocolVersion` property, and its value ****Must**** be a [SemVer](https://semver.org/) string that denotes the version of the Protocol the object is a part of.
    - The object ****MAY**** contain a `dataFormat` property, and its value ****MUST**** be a string that indicates the format of the data in accordance with its MIME type designation. The most common format is JSON, which is indicated by setting the value of the `dataFormat` property to `application/json`.

Adding a hook for social media postings:

```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "HooksWrite",
    "hookId": "234452-563658-5563-63546",
    "uri": "https://some-domain.com/dwn-hook",
    "filter": {
      "protocol": "https://example.com/protocols/social-media",
      "schema": "https://schema.org/SocialMediaPosting"
    }
  }
}
```

Updating a previously added hook:

```json
{ // Message
  "descriptor": {
    "previousCid": CID_OF_PREVIOUS_INSTANCE,
    "method": "HooksWrite",
    "hookId": "234452-563658-5563-63546",
    "uri": "https://a-different-domain.com/new/path",
    "filter": {
      "protocol": "https://example.com/protocols/social-media",
      "schema": "https://schema.org/SocialMediaPosting"
    }
  }
}
```

##### `HooksWrite` Ingest Instructions

If the `previousCid` property:
- ****IS NOT**** present, index the CID of the hook for future evaluation and cease processing.
- ****IS**** present, delete the hook referenced by the `previousCid` and index the CID of the new version of the hook for future evaluation and cease processing.

#### Query

`HooksQuery` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `HooksQuery`.
  - The object ****MAY**** contain a `filter` property, and if present its value ****MUST**** be an object that ****MAY**** contains at least one of the following properties:
    - The object ****MAY**** contain a `writer` property, and its value ****MUST**** be the DID string from which hooks were written. Querying by writer can be important in cases where a writer wants to view all the hooks they have set against a target DID's DWeb Nodes.
    - The object ****MAY**** contain a `hookId` property, and its value ****MUST**** be a [[spec:rfc4122]] UUID Version 4 string. This would be used to fetch a specific hook, as one might do to determine whether it exists in the target DWeb Node.
    - The object ****MAY**** contain a `active` property, and its value ****MUST**** be a boolean value, wherein `true` indicates that only active hooks should be returned (the last `HooksWrite`, assuming there is no proceeding `HooksDelete`), and `false` indicates that only inactive hooks records should be returned (the last `HooksDelete`). The omission of this property shall mean that all active and inactive hook records are to be returned (the last `HooksWrite` or `HooksDelete` for each `hookId`).

Get all active hooks Alice has written:

```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "HooksQuery",
    "filter": {
      "writer": "did:example:alice",
      "active": true
    }
  }
}
```

#### Delete

`HooksWrite` messages are JSON objects that include general [Message Descriptor](#message-descriptors) properties and the following additional properties, which ****must**** be composed as follows:

- The message object ****MUST**** contain a `descriptor` property, and its value ****MUST**** be a JSON object composed as follows:
  - The object ****MUST**** contain a `method` property, and its value ****MUST**** be the string `HooksDelete`.
  - The object ****MUST**** contain a `hookId` property, and its value ****MUST**** be a [[spec:rfc4122]] UUID Version 4 string.
  - The object ****MAY**** contain a `previousCid` property, and its value ****MUST**** be a [Version 1 CID](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) of the previous `HooksWrite` in the chain.
 
Deleting a hook:

```json
{ // Message
  "descriptor": {
    "nonce": "9b9c7f1fcabfc471ee2682890b58a427ba2c8db59ddf3c2d5ad16ccc84bb3106",
    "method": "HooksDelete",
    "hookId": "234452-563658-5563-63546",
    "previousCid": CID_OF_HOOK_INSTANCE_TO_DELETE
  }
}
```

 ##### `HooksDelete` Ingest Instructions

1. If the `previousCid` or `hookId` properties are ****IS NOT**** present, discard the object and return a [Message-Level Status Coding](#message-level-status-coding) error response of 400.
2. If the `previousCid` property ****IS**** present and the message indicated by the CID has the same `hookId` property value, delete the hook message referenced by the `previousCid`, and retain the `HooksDelete` message as a tombstone.

### Sync

The Sync interface and its methods allow different Decentralized Web Nodes to communicate and sync on the state of the data they contain, including replication of messages and files.


## Commit Strategies

Collections interface records may operate under the data modification algorithms detailed below. A record may only operate under one commit strategy at a time, as indicated via the value set on the `strategy` property of the current `CollectionsWrite` root.

### Last-Write Wins

Last-Write Wins is the most basic Commit Strategy that allows for the traditional experience of posting an update to a file that fully replaces the data. This strategy is the default and need not be declared. All Writes and Commits replace all of the preceding record entries.

### JSON Patch

To declare a record is operating under the JSON Merge Patch commit strategy, the `strategy` property of the current root `CollectionsWrite` ****MUST**** be set to the value `json-patch`.

[JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902) is an IETF standard [spec:rfc6902] for modifying the content of JSON documents based on a JSON-encoded delta-based operation syntax that, when applied to the target JSON document in accordance with the standard's rules, may add, remove, or modify the target document. To read more about the syntax of patches, consult IETF JSON Patch [spec:rfc6902].

### JSON Merge Patch

To declare that a record is operating under the JSON Merge Patch commit strategy, the `strategy` property of the current root `CollectionsWrite` ****MUST**** be set to the value `json-merge-patch`.

[JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7386) is an IETF standard [spec:rfc7386] for modifying the content of JSON documents based on partial deltas of a target JSON document that add, remove, and modify the target document when applied according to the standard processing rules. To read more about the syntax of patches, consult IETF JSON Merge Patch [spec:rfc7386].

## Configurations

While it is strongly encouraged to implement the full set of Decentralized Web Node features and Interfaces, not all devices and providers may be capable of doing so. To allow for maximum reach and proliferation in the ecosystem, the following are well-recognized configurations of Decentralized Web Node feature sets that tend to serve different purposes.

### Open Data Publication

This Decentralized Web Node configuration is ideal for implementers who seek to expose intentionally public data via the Decentralized Web Node semantic data discovery Interfaces. This implementation is lightweight does not require the implementer to support any of the authentication, permissioning, or ingest mechanisms that other features and Interfaces do.

```json
{
  "type": "FeatureDetection",
  "interfaces": {
    "collections": {
      "CollectionsQuery": true
    }
  }
}
```

## Supported Encryption Schemes

A conforming implementation ****MUST**** be capable of encrypting and decrypting data stored in Decentralized Web Nodes 
using the following combinations of cryptographic schemes. Each scheme is a pair, wherein the symmetric keys are used to 
encrypt the data being protected, then subsequently shared with permitted recipients via encryption of the symmetric 
keys using the asymmetric key of each recipient.

| Asymmetric Key | Symmetric Key        |
| -----          | -----                |
| `X25519`       | `AES-GCM`            |
| `X25519`       | `XChaCha20-Poly1305` |

## Normative References

[[spec]]
