Identity Hub
==================

**Specification Status:** Draft

**Latest Draft:**
  [identity.foundation/identity-hub](https://identity.foundation/identity-hub)
<!-- -->

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

Identity Hub is a _STRAWMAN_ specification under development within
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
Object Encryption |
File Structure |
IPFS |

::: todo
Finalize the component stack list - are these correct? Are we missing any?
:::

## Addressing

A user's logical Identity Hub (their collection of Hub Instances) can be addressed in many ways, 
but the mechanisms below ****MUST**** be supported by a compliant Identity Hub implementation:

### DID-Relative URLs

The following DID URL constructions are used to address [[ref: Hub Instances]] found to be associated 
with a given DID, as located via the DID resolution process.

::: note
For example purposes, the parameters above are not URL encoded, but should be when using Identity Hub URLs in practice.
:::

#### Fetch-type URLs

*DID-Relative URL addressing a single file:*

```json
did:example:123?service=IdentityHub&relativeRef=/Resources?id=Qm3fw45v46w45vw54wgwv78jbdse4w
```

*DID-Relative URL addressing a Collection of one resource type:*

```json
did:example:123?service=IdentityHub&relativeRef=/CollectionsQuery?uri=https://schema.org/MusicPlaylist
```

*DID-Relative URL addressing multiple Collections of different resource types:*

```json
did:example:123?service=IdentityHub&relativeRef=/CollectionsQuery?uri=https://schema.org/MusicPlaylist&uri=https://schema.org/Event
```

#### Submit-type URLs

*DID-Relative URL for submitting a single file:*

```json
did:example:123?service=IdentityHub&relativeRef=/CollectionsCreate
```

*Payload of submission:*

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsCreate",
  "schema": "https://schema.org/MusicPlaylist",
  "data": { ... }
}
```

#### DID-Relative URL Resolution

The following process defines how a DID-Relative URL addressing an Identity Hub is resolved:

1. Resolve the DID in the authority portion of the URL in accordance with the [W3C Decentralized Identifier Resolution](https://w3c.github.io/did-core/#resolution) process, which returns the DID Document for the resolved DID.
2. As indicated by the presence of the `service` parameter, locate the `IdentityHub` entry in the DID Document's [Service Endpoint](https://w3c.github.io/did-core/#services) entries.
3. Parse the `IdentityHub` Service Endpoint entry and compose a URL as follows:
    1. Let the first located `IdentityHub` Service Endpoint URI be the base of the new URL. NOTE: there may be multiple Hub URIs within the `IdentityHub` Service Endpoint entry, and it is ****recommended**** that implementers address them in index order. 
    2. Following standard URL formatting, append the Hub-specific URL parameters of the DID-Relative URL to the base of the URL
    3. Ensure the output reflects the following: `https://<hub-uri>?<hub-url-parameters>`

## Data Structures

::: todo
**Needs Decision**

Considerations:
- Objects accessible to multiple external parties, in multiple overlapping combinations
- Should objects be distributed across separate buckets, a shared tree, or something else?
- What kind of pointers are required, if any?
- Is tombstoning required?
:::

## Sync & Replication

::: todo
IPFS can provide this to some extent, but do we need anything in addition to what native IPFS provides?
:::

## Commit Strategies

### Last-Write Replace

The most basic Commit Strategy an Identity Hub implements should allow for the same traditional experience of posting an update to a file, wherein the new data replaces the old. The following defines how this Commit Strategy ****MUST**** be handled by compliant implementations:

1. The writer of the file ****MUST**** include a `timestamp` field in the unencrypted header of the file's DAG-JOSE object, and its value ****MUST**** be a valid UNIX timestamp.
2. The Hub Instance ****MUST**** evaluate whether the submission is valid, as determined via the permission and access evaluation rules defined in this specification.
3. Upon submission, the Hub Instance ****MUST**** compare the current file metadata stored in relation to the object (if any exists) and retain whichever data contains the latest UNIX timestamp.

### Delta-based Merge

::: todo
We need to pick a delta-based CRDT - which one?
:::

## General Object Format

All objects within an Identity Hub Instance ****MUST**** be constructed using the same 
top-level format, as defined below:

### Secure Wrapper

The identity hub data structure uses DagJOSE as the security wrapper for both signatures and encryption. JOSE is very flexible when it comes to the specific algorithm to use. Furthermore it also supports multiple signatories and multiple recipients when dealing with signed and encrypted data respectively.

#### Signature envelope
Signed objects are encoded using DagJWS, which requires the payload to be encoded as a CID. The payload itself is stored separately using DagCBOR, or some other IPLD codec. The JWS protected header should include a `kid` property with the value being the DIDUrl of the key that signed the JWS.

#### Encryption envelope
Encrypted objects are encoded using DagJWE. To properly encrypt data with DagJWE, the data first needs to be encoded as an *inline CID* (details below). JSON Web Encryption objects (JWEs) [[spec:rfc7516]] can be used for both symmetric and asymmetric encryption; at the wrapper layer, this specification does not make any prescriptions about this. JWEs can also use various different ciphers. We recommend the use of `XChaCha20Poly1305`, of which there are multiple implementations, as it is one of the most performant ciphers.

##### Encoding an *inline CID*
In order to encode an object as an *inline CID* the following algorithm is used:

1. Encode the object using some IPLD codec (e.g., DagCBOR)
2. Encode the IPLD bytes from Step 1 as an _"identity multihash"_, which is 
constructed as `<hash multicodec><size><bytes>`, composed as follows:
   - `hash multicodec` is `00` for "identity"
   - `size` is the varint byte length
   - `bytes` is the bytes from Step 1
3. Create an *inline CID* using the codec, which is encoded as:

    ```html
    <multibase prefix><multicodec cidv1><multicodec content type><multihash>
    ```
    Details of *inline CID* composition:
    - `multicodec content type` is the IPLD codec used (e.g., `DagCBOR`)
    - `multihash` is the bytes from Step 2

### Payload

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ProfileWrite", // CollectionsWrite, CollectionsQuery, ActionsWrite, etc.
  "data": { ... }
}
```

## Access & Permissions


## Interfaces

### Feature Detection

The Identity Hub specification defines well-recognized Hub configurations to maximize 
interoperability (see Hub Configurations), but implementers may wish to support a custom 
subset of the Interfaces and features. The Feature Detection interface is the means by 
which a Hub expresses support for the Interfaces and features it implements.

#### Object Definition

A compliant Identity Hub Profile interface ****MUST**** produce a Feature Detection object 
defined as follows:

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "FeatureDetection",
  "interfaces": { ... }
}
```

All compliant Hubs ****MUST**** respond with a valid Feature Detection object when receiving 
the following request object:

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "FeatureDetectionRead"
}
```

##### Properties & Values

The following properties and values are defined for the Feature Detection object:
- The value of the `interfaces` property ****MUST**** be an object, composed of the following 
  optional properties: 
    - The object ****MAY**** contain a `profile` property. If the property is not present, 
    it indicates the Hub implementation does not support any aspects of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    capability, while a boolean `false` value or omission of the property indicates the interface 
    capability is not supported:
      - `ProfileRead`
      - `ProfileWrite`
      - `ProfileDelete`
    - The object ****MAY**** contain a `collections` property. If the property is not present, 
    it indicates the Hub implementation does not support any aspects of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    capability, while a boolean `false` value or omission of the property indicates the interface 
    capability is not supported:
      - `CollectionsQuery`
      - `CollectionsCreate`
      - `CollectionsUpdate`
      - `CollectionsReplace`
      - `CollectionsDelete`
      - `CollectionsBatch`
    - The object ****MAY**** contain a `actions` property. If the property is not present, 
    it indicates the Hub implementation does not support any aspects of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    capability, while a boolean `false` value or omission of the property indicates the interface 
    capability is not supported:
      - `ActionsQuery`
      - `ActionsCreate`
      - `ActionsUpdate`
      - `ActionsDelete`
      - `ActionsBatch`
    - The object ****MAY**** contain a `permissions` property. If the property is not present, 
    it indicates the Hub implementation does not support any aspects of the interface. If the 
    property is present, its value ****MUST**** be an object that ****MAY**** include any of the 
    following properties, wherein a boolean `true` value indicates support for the interface 
    capability, while a boolean `false` value or omission of the property indicates the interface 
    capability is not supported:
      - `PermissionsRequest`
      - `PermissionsQuery`
      - `PermissionsCreate`
      - `PermissionsUpdate`
      - `PermissionsDelete`
      - `PermissionsBatch`

### Profile

The Profile interface provides a simple mechanism for setting and retrieving a JSON object 
with basic profile information that describes the target DID entity.

#### Object Format

A compliant Identity Hub Profile interface ****MUST**** produce an object of the following 
structure, if a Profile has been established by the controller of a DID:

```json
{
  "@context": "https://identity.foundation/schemas/hub",
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
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ProfileRead"
}
```

#### Write

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ProfileWrite",
  "data": {
    "@context": "https://identity.foundation/schemas/hub",
    "type": "Profile",
    "descriptors": [...]
  }
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ProfileDelete",
  "id": "Qmsd78fagsf7vah87rgvaoh98sdhca97sdga"
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
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsQuery",
  "statements": [
    {
      "uri": "https://schema.org/MusicPlaylist"
    }
  ]
}
```

#### Create

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsCreate",
  "schema": "https://schema.org/MusicPlaylist",
  "data": { ... }
}
```

#### Update

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsUpdate",
  "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
  "data": { ... }
}
```

#### Replace

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsReplace",
  "id": "Qmsd78fagsf7vah87rgvaoh98sdhca97sdga",
  "data": { ... }
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsDelete",
  "id": "Qm65765jrn7be64v5q35v6we675br68jr"
}
```

#### Batch

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsBatch",
  "entries": [
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "CollectionsCreate",
      "schema": "https://schema.org/Event",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "CollectionsUpdate",
      "schema": "https://schema.org/MusicPlaylist",
      "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "CollectionsDelete",
      "id": "Qm65765jrn7be64v5q35v6we675br68jr"
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "CollectionsReplace",
      "id": "Qmsd78fagsf7vah87rgvaoh98sdhca97sdga",
      "data": { ... }
    }
  ]
}
```

### Actions

Actions are notifications that are based on some form of directed action the Sender 
wants to convey to the [[ref:Hub User]]. All Actions ****MUST**** be of a type defined 
under the `schema.org/Action` family of objects.

#### Query

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ActionsQuery",
  "statements": [
    {
      "type": "https://schema.org/LikeAction"
    }
  ]
}
```

#### Create

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ActionCreate",
  "schema": "https://schema.org/LikeAction",
  "data": { ... }
}
```

#### Update

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ActionUpdate",
  "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
  "data": { ... }
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "CollectionsDelete",
  "id": "Qm65765jrn7be64v5q35v6we675br68jr"
}
```

#### Batch

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "ActionsBatch",
  "entries": [
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "ActionCreate",
      "schema": "https://schema.org/LikeAction",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "ActionUpdate",
      "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "CollectionsDelete",
      "id": "Qm65765jrn7be64v5q35v6we675br68jr"
    }
  ]
}
```

### Permissions

The Permissions interface provides a mechanism for external entities to request access 
to a Hub User's non-public data.

#### Request

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionRequest",
  "data": {
    "schema": "https://schema.org/MusicPlaylist",
    "tags": ["classic rock", "rock", "rock and roll"]
  }
}
```

#### Query

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionsQuery",
  "statements": [
    {
      "type": "https://schema.org/LikeAction"
    }
  ]
}
```

#### Create

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionCreate",
  "data": { ... }
}
```

#### Update

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionUpdate",
  "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
  "data": { ... }
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionDelete",
  "id": "Qm65765jrn7be64v5q35v6we675br68jr"
}
```

#### Batch

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "type": "PermissionBatch",
  "entries": [
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "PermissionCreate",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "PermissionUpdate",
      "parent": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
      "data": { ... }
    },
    {
      "@context": "https://identity.foundation/schemas/hub",
      "type": "PermissionDelete",
      "id": "Qm65765jrn7be64v5q35v6we675br68jr"
    }
  ]
}
```

## Hub Configurations

While it is strongly encouraged to implement the full set of Identity Hub features and Interfaces, not all devices and providers may be capable of doing so. To allow for maximum reach and proliferation in the ecosystem, the following are well-recognized configurations of Identity Hub feature sets that tend to serve different purposes.

### Open Data Publication

This Hub configuration is ideal for implementers who seek to expose intentionally public data via the Identity Hub semantic data discovery Interfaces. This implementation is lightweight does not require the implementer to support any of the authentication, permissioning, or ingest mechanisms that other features and Interfaces do.

```json
{
  "@context": "https://identity.foundation/schemas/hub",
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
