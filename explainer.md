
# **DIF Identity Hubs**
Deliverable Status: Approved Draft

Hubs let you securely store and share data. A Hub is a datastore containing semantic data objects at well-known locations.  Each object in a Hub is signed by an identity and accessible via a globally recognized API format that explicitly maps to semantic data objects.  Hubs are addressable via unique identifiers maintained in a global namespace.

# One DID to Many Hub Instances

A single entity may have one or more instances of a Hub, all of which are addressable via a URI routing mechanism linked to the entity’s identifier.  Hub instances sync state changes, ensuring the owner can access data and attestations from anywhere, even when offline.

## DID Document Service Endpoint Descriptors

There are two different variations of Hub-specific DID Document Service Endpoint descriptors, one that users associate with their DIDs, and another that Hosts use to direct requests to locations where their Hub infrastructure resides.

Users specify their Hub instances (different Hub Hosts) via the `UserServiceEndpoint` descriptor:
```json
"service": [{
  "type": "IdentityHub",
  "publicKey": "did:foo:123#key-1",
  "serviceEndpoint": {
    "@context": "schema.identity.foundation/hub",
    "@type": "UserServiceEndpoint",
    "instances": ["did:bar:456", "did:zaz:789"]
  }
}]
```

Hosts specify the locations of their Hub offerings via the `HostServiceEndpoint` descriptor:
```json
"service": [{
  "type": "IdentityHub",
  "publicKey": "did:bar:456#key-1",
  "serviceEndpoint": {
    "@context": "schema.identity.foundation/hub",
    "@type": "HostServiceEndpoint",
    "locations": ["https://hub1.bar.com/.identity", "https://hub2.bar.com/blah/.identity"]
  }
}]
```

## Syncing data between Hubs

Hub instances must sync data without requiring master-slave relationships or forcing a single implementation for storage or application logic. This requires a shared replication protocol for broadcasting and resolving changes. The protocol for reproducing Hub state across multiple instances is in the formative phases of definition/selection, but should be relatively straightforward to integrate on top of any NoSQL datastore.

## Hub data serialization and export

All Hubs must support the export of their serialized state. This is to ensure the user retains full control over the portability of their data. A later revision to this document will specify the process for invoking this intent and retrieving the serialized data from a Hub instance.

# Hub Locations & Protocol Schemes

## Well-Known Endpoint

Existing web servers need to interact with Hubs.  Similar to the IETF convention for universally understood resources, detailed in [RFC 5785 well-known URIs][13f07ee0], Hubs are accessible via the path format: `:root/.identity`, wherein the path will reside at the root of the target Hub's root domain.

## Hub URI Scheme

In addition to the URL path convention for individual Hubs instances, it is important that links to an identity owner's data not be encoded with a dependency on a specific Hub instance. To make this possible, we propose the introduction of the following Hub URI scheme:

`hub://did:foo:123abc/`

User Agents that understand this scheme will leverage the Universal Resolver to lookup the Hub instances of the target DID and address the Hub endpoints via the Service Endpoints it finds within. This allows the formation of URIs that are not Hub instance-specific, allowing a more natural way to link to a DID's data, without having to specify a specific instance. This also prevents the circulation of dead links across the Web, given an identity owner can choose to add/remove new Hub instances at any time.

# Authentication

The process of authenticating requests from the primary user or an agent shall follow the DIF/W3C DID Auth schemes.

These standards are in early phases of formation - more info here: https://github.com/WebOfTrustInfo/rebooting-the-web-of-trust-spring2018/blob/master/draft-documents/did_auth_draft.md

# API

Because of the sensitive nature of the data being transmitted between Identity Hubs and User Agents, this API that may look a bit different to developers who are used to a traditional REST service API. Most of the differences are based on the high level of security and privacy decentralized identity inherently demands.

## Interfaces

To facilitate common identity interactions and data storage Hubs provide a set of standard interfaces:

- `Profile` ➜ The owning entity's primary descriptor object (schema agnostic)
- `Permissions` ➜ The access control JSON document
- `Actions` ➜ A known endpoint for the relay of actions to the identity owner
- `Stores` ➜ Scoped 1:1 storage space that is directly assigned to another, external DID
- `Collections` ➜ The owning entity's identity collections (access limited)
- `Services` ➜ any custom, service-based functionality the identity exposes

##### Unimplemented Interfaces

If for whatever reason a Hub implementer decides not to support any endpoints of the top-level API (a rare but possible case), the Hub shall return the HTTP Error Code `501 Not Implemented`, regardless of the path depth of the inbound request.

If the Hub provider wishes, for any reason, to relay the request to a different URI location, they must return the HTTP Status Code `303 See Other`.

##### Write Request Format

Instead of a REST-based scheme where data like the username, object types, and query strings are present in the URL, Identity Hubs requests are self-contained message objects that encapsulate all they need to be shielded from observing entities during transport.

```javascript
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'WriteRequest',

  commit: {
    // protected is the base64url of:
    // {
    //   // Hubs can see and operate on controls to do the following:
    //   // 1) Know, via cache-intent, the storage replication priority
    //   // 2) Request metadata the user/party wishes to expose (for search/indexing)
    //   // 3) Unencrypted - intended-public dat
    //   "interface": "Collections",
    //   "context": "schema.org",
    //   "type": "MusicPlaylist",
    //   "operation": "create", // update, delete
    //   "committed_at": "2019-01-11T00:00:00.00:00Z",
    //   "commit_strategy": "basic",
    //   "sub": "did:bar:456def",
    //   "kid": "did:foo:123abc",
    //   "meta": {
    //     // Associated commit object for mutable metadata properties about the object
    //     "title": "Best of Classic Rock",
    //     "tags": ["classic rock", "rock", "rock n roll"],
    //     "cache-intent": "full"
    //   }
    // }
    protected: "ewogICJpbnRlcmZhY2UiOiAiQ29sbGVjdGlvbnMiLAogICJjb250ZXh0IjogInNjaGVtYS5vcmciLAogICJ0eXBlIjogIk11c2ljUGxheWxpc3QiLAogICJvcGVyYXRpb24iOiAiY3JlYXRlIiwgLy8gdXBkYXRlLCBkZWxldGUKICAiY29tbWl0dGVkX2F0IjogIjIwMTktMDEtMTFUMDA6MDA6MDAuMDA6MDBaIiwKICAiY29tbWl0X3N0cmF0ZWd5IjogImJhc2ljIiwKICAic3ViIjogImRpZDpiYXI6NDU2ZGVmIiwKICAia2lkIjogImRpZDpmb286MTIzYWJjIiwKICAibWV0YSI6IHsKICAgICJ0aXRsZSI6ICJCZXN0IG9mIENsYXNzaWMgUm9jayIsCiAgICAidGFncyI6IFsiY2xhc3NpYyByb2NrIiwgInJvY2siLCAicm9jayBuIHJvbGwiXSwKICAgICJjYWNoZS1pbnRlbnQiOiAiZnVsbCIKICB9Cn0",
    // Optional metadata information not protected by the signature
    header: {
      "iss": "did:foo:123abc"
    },
      // The data in the payload can be encrypted in one of 3 ways:
      // 1) Encrypted for only the user (DEFAULT)
      // 2) Encrypted for the user and others they allow
      // 3) Unencrypted - intended-public data (used in this example)
      // payload is the base64url of:
      // {
      //   "@context": 'http://schema.org/',
      //   "@type": "MusicPlaylist",
      //   "description": 'The best rock of the 60s, 70s, and 80s',
      //   "tracks": ["..."],
      // }
    payload: "ewogICJAY29udGV4dCI6ICdodHRwOi8vc2NoZW1hLm9yZy8nLAogICJAdHlwZSI6ICJNdXNpY1BsYXlsaXN0IiwKICAiZGVzY3JpcHRpb24iOiAnVGhlIGJlc3Qgcm9jayBvZiB0aGUgNjBzLCA3MHMsIGFuZCA4MHMnLAogICJ0cmFja3MiOiBbIi4uLiJdLAp9",
    signature: "SignatureOfProtectedAndPayload"
  }
}
```

##### Response Format

```js
{
  // Outer envelope is signed with the key
  // of the hub DID, and encrypted with the issuer's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "WriteResponse",
  "developer_message": "completely optional message from the hub",
  "revisions": ["aHashOfTheCommitSubmitted"]
}
```

##### Object Read Request Format

Objects follow one logical object across multiple commits. Object reads do not contain the literal object data, only metadata associated. Objects may be queried for using the following request format:

```javascript
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "query": {
      "interface": "Collections",
      "context": "http://schema.org",
      "type": "MusicPlaylist",
      
      // Optional object_id filters
      "object_id": ["3a9de008f526d239..", "a8f3e7..."]
  }
}
```

##### Response Format

```js
{
  // Outer envelope is signed with the key
  // of the hub DID, and encrypted with the issuer's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryResponse",
  "developer_message": "completely optional",
  "objects": [
    {
      // object metadata
      "interface": "Collections",
      "context": "http://schema.org",
      "type": "MusicPlaylist",
      "id": "3a9de008f526d239...",
      "created_by": "did:foo:123abc",
      "created_at": "2018-10-24T18:39:10.10:00Z",
      "sub": "did:foo:123abc",
      "commit_strategy": "basic",
      "meta": {
        // the final state of the "meta" object may be included if the hub knows how to resolve the commit strategy. 
      }
    },
    // ...more objects
  ]
}
```

##### Commit Read Request Format

To read one or many commits, use the following request format:

```javascript
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "CommitQueryRequest",
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "query": {
      "object_id": ["3a9de008f526d239..."],
      "revision": ["abc", "def", ...]
  },
}
```

##### Response Format

```js
{
  // Outer envelope is signed with the key
  // of the hub DID, and encrypted with the issuer's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "CommitQueryResponse",
  "developer_message": "completely optional",
  "commits": [
    {
      protected: "ewogICJpbnRlcmZhY2UiOiAiQ29sbGVjdGlvbnMiLAogICJjb250ZXh0IjogInNjaGVtYS5vcmciLAogICJ0eXBlIjogIk11c2ljUGxheWxpc3QiLAogICJvcGVyYXRpb24iOiAiY3JlYXRlIiwgLy8gdXBkYXRlLCBkZWxldGUKICAiY29tbWl0dGVkX2F0IjogIjIwMTktMDEtMTFUMDA6MDA6MDAuMDA6MDBaIiwKICAiY29tbWl0X3N0cmF0ZWd5IjogImJhc2ljIiwKICAic3ViIjogImRpZDpiYXI6NDU2ZGVmIiwKICAia2lkIjogImRpZDpmb286MTIzYWJjIiwKICAibWV0YSI6IHsKICAgICJ0aXRsZSI6ICJCZXN0IG9mIENsYXNzaWMgUm9jayIsCiAgICAidGFncyI6IFsiY2xhc3NpYyByb2NrIiwgInJvY2siLCAicm9jayBuIHJvbGwiXSwKICAgICJjYWNoZS1pbnRlbnQiOiAiZnVsbCIKICB9Cn0",
      header: {
        "iss": "did:foo:123abc",
        // Hubs may add additional information to the unprotected headers for convenience
        "rev": "aHashOfTheCommit",
      },
      payload: "ewogICJAY29udGV4dCI6ICdodHRwOi8vc2NoZW1hLm9yZy8nLAogICJAdHlwZSI6ICJNdXNpY1BsYXlsaXN0IiwKICAiZGVzY3JpcHRpb24iOiAnVGhlIGJlc3Qgcm9jayBvZiB0aGUgNjBzLCA3MHMsIGFuZCA4MHMnLAogICJ0cmFja3MiOiBbIi4uLiJdLAp9",
      signature: "SignatureOfProtectedAndPayload"
    },
    // ...
  ],
  // potential pagination token
  "skip_token": "ajfl43241nnn1p;u9390",
}
```

##### Paging

- `skip_token` is an opaque token to be used for continuation of a request.

They may be returned on responses with multiple results:

```js
{
  // Outer envelope is signed with the key
  // of the hub DID, and encrypted with the issuer's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryResponse", # multiple results return pagination
  "developer_message": "completely optional",
  "objects": [
    {
      // object metadata
      "context": "http://schema.org",
      "type": "MusicPlaylist",
      "id": "3a9de008f526d239...",
      "created_at": "2018-10-24T18:39:10.10:00Z",
      // "[other metadata fields]": "from storage specification",
      "sub": "did:bar:456def",
      "commit_strategy": "basic",
    },
    ...
  ],
  "skip_token": "ajfl43241nnn1p;u9390",
}
```

And are added to the initial request's `query` object:

```js
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'ObjectQueryRequest',
  interface: "Collections",
  query: {
    "context": "schema.org",
    "type": "MusicPlaylist",
    "skip_token": "ajfl43241nnn1p;u9390"
  }
}
```


### Profile

Each Hub has a `profile` object that describes the owning entity. The profile object should use whatever schema and object that best represents the entity.

##### *Request*

```js
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "query": {
      "interface": "Profile",
  }
}
```

### Permissions

All access and manipulation of identity data is subject to the permissions established by the owning entity. Because the identities are self-sovereign, all data associated with the identity must be portable. Transfer of a identity's contents and settings between environments and hosts should be seamless, without loss of data or operational state, including the permissions that govern access to identity data.

See the [permissions.md](./docs/permissions.md) explainer for details.

### Actions

The `actions` interface is for sending a target identity semantically meaningful objects that convey an intent to the sender, which often involves the data payload of the object. The `actions` interface is not constrained to simple human-centric communications. Rather, it is intended as a universal conduit through which identities can transact all manner of activities, exchanges, and notifications.

The base data format for conveying an action shall be:

[http://schema.org/Action](http://schema.org/Action)

Here is a list of examples to show the range of use-cases this interface is intended to support:

- Human user contacts another with a textual message ([ReadAction](http://schema.org/ReadAction))
- Event app sends a request to RSVP for an event ([RsvpAction](http://schema.org/RsvpAction))
- Voting agency prompts a user to submit a vote ([VoteAction](http://schema.org/VoteAction))

##### *Request*

```js
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'WriteRequest',
  commit: {
      // protected: {
      //   "interface": "Actions",
      //   "context": "schema.org",
      //   "type": "ReadAction",
      //   "operation": "create",
      //   "committed_at": "2019-01-11T00:00:00.00:00Z",
      //   "commit_strategy": "basic",
      //   "sub": "did:bar:456def",
      //   "kid": "did:foo:123abc",
      //   "meta": {
      //     "title": "Please read this sensitive document",
      //     "tags": ["document", "pdf"]
      //   }
      // }
    protected: "ewogICJpbnRlcmZhY2UiOiAiQWN0aW9ucyIsCiAgImNvbnRleHQiOiAic2NoZW1hLm9yZyIsCiAgInR5cGUiOiAiUmVhZEFjdGlvbiIsCiAgIm9wZXJhdGlvbiI6ICJjcmVhdGUiLAogICJjb21taXR0ZWRfYXQiOiAiMjAxOS0wMS0xMVQwMDowMDowMC4wMDowMFoiLAogICJjb21taXRfc3RyYXRlZ3kiOiAiYmFzaWMiLAogICJzdWIiOiAiZGlkOmJhcjo0NTZkZWYiLAogICJraWQiOiAiZGlkOmZvbzoxMjNhYmMiLAogICJtZXRhIjogewogICAgInRpdGxlIjogIlBsZWFzZSByZWFkIHRoaXMgc2Vuc2l0aXZlIGRvY3VtZW50IiwKICAgICJ0YWdzIjogWyJkb2N1bWVudCIsICJwZGYiXQogIH0KfQ",
      // payload: {  // Data encrypted for the DID owner and the bank
      //  "@context": 'http://schema.org/',
      //   "@type": "ReadAction",
      //   "name": "Acme Bank - March 2018 Statement",
      //   "description": "Your Acme Bank statement for account #1734765",
      //   "object": PDF_SOURCE
      // }
    payload: "eyAgLy8gRGF0YSBlbmNyeXB0ZWQgZm9yIHRoZSBESUQgb3duZXIgYW5kIHRoZSBiYW5rCiAiQGNvbnRleHQiOiAnaHR0cDovL3NjaGVtYS5vcmcvJywKICAiQHR5cGUiOiAiUmVhZEFjdGlvbiIsCiAgIm5hbWUiOiAiQWNtZSBCYW5rIC0gTWFyY2ggMjAxOCBTdGF0ZW1lbnQiLAogICJkZXNjcmlwdGlvbiI6ICJZb3VyIEFjbWUgQmFuayBzdGF0ZW1lbnQgZm9yIGFjY291bnQgIzE3MzQ3NjUiLAogICJvYmplY3QiOiBQREZfU09VUkNFCn0",
    signature: "SignatureOfProtectedAndPayload"
  }
}
```

##### Attestations

A frequent activity users will engage in is the exchange of attestations. Attestations are claims that one or more users sign with their DID-linked keys to create assertions of proof. These proofs can be for just about anything you can imagine: diplomas, driver's licenses, property deeds, etc. In order to make discovery, request, and transmission of attestations possible, users and organizations need a way to send attestation requests to users and get back the proofs they're looking for.

Requesting parties need a means to ask for attestations in a standard, interoperable way across different instances of Hubs. To send a request that is recognized by User Agents as a request for an attestation, the requesting party must use semantic actions that represent the various stages of negotiation, such as `RequestAttestationAction` and others, as shown in the diagram below:

![Attestation Request](/diagrams/alice-attestation-request.png)

### Stores

The best way to describe Stores is as a 1:1 DID-scoped variant of the W3C DOM's origin-scoped `window.localStorage` API. The key difference being that this form of persistent, pairwise object storage transcends providers, platforms, and devices. For each storage relationship between the DID owner and external DIDs, the Hub shall create a key-value document-based storage area. The DID owner or external DID can store unstructured JSON data to the document, in relation to the keys they specify. The Hub implementer may choose to limit the available space of the storage document, with the option to expand the storage limit based on criteria the implementer defines.

### Collections

Data discovery has been a problem since the inception of the Web. Most previous attempts to solve this begin with the premise that discovery is about individual entities providing a mapping of their own service-specific API and data schemas. While you can certainly create a common format for expressing different APIs and data schemas, you are left with the same basic issue: a sea of services that can't efficiently interoperate without specific review, effort, and integration. Hubs avoid this issue entirely by recognizing that the problem with *data discovery* is that it relies on *discovery*. Instead, Hubs assert the position that locating and retrieving data should be an *implicitly knowable* process.

Collections provide an interface for accessing data objects across all Hubs, regardless of their implementation. This interface exerts almost no opinion on what data schemas entities use. To do this, the Hub Collection interface allows objects from any schema to be stored, indexed, and accessed in a unified manner.

With Collections, you store, query, and retrieve data based on the very schema and type of data you seek. Here are a few example data objects from a variety of common schemas that entities may write and access via a user's Hub:

**Locate any offers a user might want to share with apps** (http://schema.org/Offer)

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "query": {
      "interface": "Collections",
      "context": "http://schema.org",
      "type": "Offer",
  }
}
```

**Manufacturer creates a new product entry supply chain partners can access**  (https://www.gs1.org/voc/Product)

```js
{
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'WriteRequest',

  commit: {
      // {
      //   "interface": "Collections",
      //   "context": "gs1.org/voc",
      //   "type": "product",
      //   "operation": "create",
      //   "committed_at": "2019-01-11T00:00:00.00:00Z",
      //   "commit_strategy": "basic",
      //   "sub": "did:bar:456def",
      //   "kid": "did:foo:123abc",
      //   "meta": {
      //     "title": "Folgers Coffee",
      //     "tags": ["coffee", "ground coffee"]
      //   }
      // }
    protected: "ewogICJpbnRlcmZhY2UiOiAiQ29sbGVjdGlvbnMiLAogICJjb250ZXh0IjogImdzMS5vcmcvdm9jIiwKICAidHlwZSI6ICJwcm9kdWN0IiwKICAib3BlcmF0aW9uIjogImNyZWF0ZSIsCiAgImNvbW1pdHRlZF9hdCI6ICIyMDE5LTAxLTExVDAwOjAwOjAwLjAwOjAwWiIsCiAgImNvbW1pdF9zdHJhdGVneSI6ICJiYXNpYyIsCiAgInN1YiI6ICJkaWQ6YmFyOjQ1NmRlZiIsCiAgImtpZCI6ICJkaWQ6Zm9vOjEyM2FiYyIsCiAgIm1ldGEiOiB7CiAgICAidGl0bGUiOiAiRm9sZ2VycyBDb2ZmZWUiLAogICAgInRhZ3MiOiBbImNvZmZlZSIsICJncm91bmQgY29mZmVlIl0KICB9Cn0",
      // {
      //   "@context": 'https://www.gs1.org/voc',
      //   "@type": "product",
      //   "gtin": 00025500101163,
      //   "productName": "Aroma Roasted Coffee",
      //   "manufacturer": "The Folger Coffee Company"
      //   ...
      // }
    payload: "ewogICJAY29udGV4dCI6ICdodHRwczovL3d3dy5nczEub3JnL3ZvYycsCiAgIkB0eXBlIjogInByb2R1Y3QiLAogICJndGluIjogMDAwMjU1MDAxMDExNjMsCiAgInByb2R1Y3ROYW1lIjogIkFyb21hIFJvYXN0ZWQgQ29mZmVlIiwKICAibWFudWZhY3R1cmVyIjogIlRoZSBGb2xnZXIgQ29mZmVlIENvbXBhbnkiCiAgLi4uCn0",
    signature: "SignatureOfProtectedAndPayload"
  }
}
```

**Medical provider updates a user's patient record** (https://www.hl7.org/fhir/patient)

```js
{
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'WriteRequest',

  commit: {
      // {
      //   "interface": "Collections",
      //   "context": "hl7.org/fhir",
      //   "type": "patient",
      //   "operation": "update",
      //   "committed_at": "2019-01-11T00:00:00.00:00Z",
      //   "commit_strategy": "basic",
      //   "sub": "did:bar:456def",
      //   "kid": "did:foo:123abc",
      //   "object_id": "34bj452vvg443l...",
      //   "meta": {
      //     "title": "Patent Record",
      //     "tags": ["medical", "patient", "record"]
      //   }
      // }
    protected: "ewogICJpbnRlcmZhY2UiOiAiQ29sbGVjdGlvbnMiLAogICJjb250ZXh0IjogImhsNy5vcmcvZmhpciIsCiAgInR5cGUiOiAicGF0aWVudCIsCiAgIm9wZXJhdGlvbiI6ICJ1cGRhdGUiLAogICJjb21taXR0ZWRfYXQiOiAiMjAxOS0wMS0xMVQwMDowMDowMC4wMDowMFoiLAogICJjb21taXRfc3RyYXRlZ3kiOiAiYmFzaWMiLAogICJzdWIiOiAiZGlkOmJhcjo0NTZkZWYiLAogICJraWQiOiAiZGlkOmZvbzoxMjNhYmMiLAogICJvYmplY3RfaWQiOiAiMzRiajQ1MnZ2ZzQ0M2wuLi4iLAogICJtZXRhIjogewogICAgInRpdGxlIjogIlBhdGVudCBSZWNvcmQiLAogICAgInRhZ3MiOiBbIm1lZGljYWwiLCAicGF0aWVudCIsICJyZWNvcmQiXQogIH0KfQ"
      // { // Data encrypted for the DID owner and their doctors
      //   "@context": 'https://www.hl7.org/fhir',
      //   "@type": "patient",
      //   "name": "Jeff",
      //   "family": "Lebowski"
      // }
    payload: "eyAvLyBEYXRhIGVuY3J5cHRlZCBmb3IgdGhlIERJRCBvd25lciBhbmQgdGhlaXIgZG9jdG9ycwogICJAY29udGV4dCI6ICdodHRwczovL3d3dy5obDcub3JnL2ZoaXInLAogICJAdHlwZSI6ICJwYXRpZW50IiwKICAibmFtZSI6ICJKZWZmIiwKICAiZmFtaWx5IjogIkxlYm93c2tpIgp9",
    signature: "SignatureOfProtectedAndPayload"
  }
}
```

### Services

Services offer a means to surface custom service calls an identity wishes to expose publicly or in an access-limited fashion. Services should not require the Hub host to directly execute code the service calls describe; service descriptions should link to a URI where execution takes place.

Performing a `Request` request to the base `Services` interface will respond with an object that contains an entry for every service description the requesting entity is permitted to access.

##### *Request*

```js
{
  // Outer envelope is signed with the key
  // of the "iss" DID, and encrypted with the Hub's DID key
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'ServicesRequest',
}
```

##### *Response*

Here is an example of a request for all

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ServicesResponse",
  developer_message: "optional message",
  services: [{
    // Open API service descriptors
  }]
}
```

##### Service Descriptions

All definitions shall conform to the [Open API descriptor format](https://github.com/OAI/OpenAPI-Specification).


# Parking Lot

#### Adding or Manipulating Collections Data

POSTs are verified to ensure two things about the requesting party: 1) They are the decentralized identity they claim to be, and 2) They are authorized (as specified in the ACL JSON document) to write data to a specified route.

Addition of new data objects into a collection must follow a process for handling and insertion into storage:

1. The new objects must be assigned with an `@id` property
2. The Hub instance must wrap the native data object with an object that contains the unique ID and item-specific controls. These control properties include:
- `key`: the encrypted symmetrical public key the requesting party can use to decrypt the payload (if the requestor is in possession of the correct key)
- `cache-intent`:
  - `min`: Just the ID and item record for an entry
  - `attr`: The descriptor object for an item, without full source
  - `full`: The descriptor object and full source - including any binary or blob data - for an item
3. The object must be encrypted with the symmetrical key of the entities that have read privileges, as specified in the ACL JSON document.
4. The object shall be inserted into the Hub instance that is handling the request.
5. Upon completing the above steps, the change must be synced to the other Hub instances via the Replication Process.

#### Query Filter Syntax

> WARNING: all query-related parts of the spec shall be considered strawman ideas, and everything pertaining to it is subject to change.

The Hub spec does not mandate specific storage and search implementations.  For the purposes of interoperability and developer ergonomics hubs must accept a common search and filtering syntax regardless of the underlying implementation choice.

To avoid the introduction of a new syntax, we feel [Apache Lucene's query filtering syntax](http://www.lucenetutorial.com/lucene-query-syntax.html) balances the desire to select an option with broad, existing support, and the flexibility and expressiveness developers demand.

Filters can be applied via the `filter` parameter of your queries. Additionally, filters are used to enable more granular permissioning - see the ACL spec document for more info.


  [13f07ee0]: https://tools.ietf.org/html/rfc5785 "IETF well-know URIs"
  [6cc282d2]: https://www.ietf.org/assignments/well-known-uris/well-known-uris.xml "well-known URI Directory"
  [2773b365]: http://jsonapi.org/format/ "JSON API Spec"
