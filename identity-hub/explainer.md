
DIF Identity Hubs
============================
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

# Hub Protocol Schemes

## Hub URI Scheme

In addition to the URL path convention for individual Hubs instances, it is important that links to an identity owner's data not be encoded with a dependency on a specific Hub instance. To make this possible, we propose the introduction of the following Hub URI scheme:

`hub://did:foo:123abc/`

User Agents that understand this scheme will leverage the Universal Resolver to lookup the Hub instances of the target DID and address the Hub endpoints via the Service Endpoints it finds within. This allows the formation of URIs that are not Hub instance-specific, allowing a more natural way to link to a DID's data, without having to specify a specific instance. This also prevents the circulation of dead links across the Web, given an identity owner can choose to add/remove new Hub instances at any time.

# Authentication

The process of authenticating requests to identity hubs will follow the DIF/W3C DID Auth schemes. These standards are in early phases of formation - [more info is available here](https://github.com/WebOfTrustInfo/rebooting-the-web-of-trust-spring2018/blob/master/draft-documents/did_auth_draft.md). A draft implementation of DID auth for Identity Hubs is explained in the [authentication explainer](./docs/authentication.md).

# Authorization

Access control for data stored in Hubs is currently implemented via a bare bones permission layer. Access to data can be granted by a Hub owner, and can be restricted to certain types of data. A draft implementation for Hub authoirization is explained in the [permissions explainer](./docs/permissions.md). More features to improve control over data access will be added in the future.

# API

Because of the sensitive nature of the data being transmitted to Identity Hubs, the Identity Hub request and response API may look a bit different to developers who are used to a traditional REST service API. Most of the differences are based on the high level of security and privacy decentralized identity inherently demands.

## Commits

All data in identity hubs is represented as a series of "commits". A commit is similar to a git commit; it represents a change to an object. To write data to an identity hub, you need to construct and send a new commit to the hub. To read data from an identity hub, you need to fetch all commits from the hub. An object's current value can be constructed by applying all its commits in order.

The use of commits to represent data in identity hubs offers a few distinct advantages:

- it facilitates the hub's replication protocol, enabling multiple hub instances to sync data.
- it creates an auditable history of changes to an object, especially when each commit is signed by a DID.
- it eases implementation for use cases that need offline data modification and require conflict resolution.

Each commit in a hub is a [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) whose body contains the data to be written to the hub. Here's an example of a deserialized & decoded JWT:

```json
// JWT headers
{
  "alg": "RS256",
  "kid": "did:foo:123abc#key-abc",
  "interface": "Collections",
  "context": "https://schema.org",
  "type": "MusicPlaylist",
  "operation": "create",
  "committed_at": "2018-10-24T18:39:10.10:00Z",
  "commit_strategy": "basic",
  "sub": "did:bar:456def",

  // Example metadata about the object that is intended to be "public"
  "meta": {
    "tags": ["classic rock", "rock", "rock n roll"],
    "cache-intent": "full"
  }
}

// JWT body
{
  "@context": "http://schema.org/",
  "@type": "MusicPlaylist",
  "description": "The best rock of the 60s, 70s, and 80s",
  "tracks": ["..."],
}

// JWT signature
uQRqsaky-SeP3m9QPZmTGtRtMoKzyg6wwWF...
```

The commit is signed by the committer writing the data, in this case `did:foo:123abc`. To write the commit into a hub, the committer must send a Hub write request.

## Write Request & Response Format

Instead of a REST-based scheme where data like the username, object types, and query strings are present in the URL, Identity Hubs requests are self-contained message objects that encapsulate all they need to be shielded from observing entities during transport. 

Each Hub request is a JSON object which is then signed and encrypted as outlined in the authentication section. The outer envelope is signed with the key of the "iss" DID, and encrypted with the Hub's DID key(s).

```javascript
{
  iss: 'did:foo:123abc',
  sub: 'did:bar:456def',
  aud: 'did:baz:789ghi',
  "@context": "https://schema.identity.foundation/0.1",
  '@type': 'WriteRequest',

 
  // The commit in JSON Serialization Format
  // See: https://tools.ietf.org/html/rfc7515#section-3.1
  commit: {
    protected: "ewogICJpbnRlcmZhY2...",
    
    // Optional metadata information not protected by the JWT signature
    header: {
      "iss": "did:foo:123abc"
    },

    payload: "ewogICJAY29udGV4dCI6...",
    signature: "b7V2UpDPytr-kMnM_YjiQ3E0J2..."
  }
}
```

Each response is also a JSON object, signed and encrypted in the same way as the request. Its contents are:

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "WriteResponse",
  "developer_message": "completely optional message from the hub",
  "revisions": ["aHashOfTheCommitSubmitted"]
}
```

## Object Read Request & Response Format

Objects follow one logical object across multiple commits. Object reads do not contain the literal object data, only metadata associated. Objects may be queried for using the following request format:

```javascript
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "query": {
      "interface": "Collections",
      "context": "http://schema.org",
      "type": "MusicPlaylist",
      
      // Optional object_id filters
      "object_id": ["3a9de008f526d239..", "a8f3e7..."]
  }
}
```

The response to a query for objects returns a list of object IDs along with the object metadata. The format is:

```js
{
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
        "tags": ["classic rock", "rock", "rock n roll"],
        "cache-intent": "full"
      }
    },
    // ...more objects
  ]

  // potential pagination token
  "skip_token": "ajfl43241nnn1p;u9390",
}
```

## Commit Read Request & Response Format

To get the actual data in an object, you must read the commits from the Identity Hub:

```javascript
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "CommitQueryRequest",
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "query": {
    "object_id": ["3a9de008f526d239..."],
    "revision": ["abc", "def", ...]
  },
}
```

A response to a query for commits contains a list of commit JWTs:

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "CommitQueryResponse",
  "developer_message": "completely optional",
  "commits": [
    {
      protected: "ewogICJpbnRlcmZhY2UiO...",
      header: {
        "iss": "did:foo:123abc",
        // Hubs may add additional information to the unprotected headers for convenience
        "rev": "aHashOfTheCommit",
      },
      payload: "ewogICJAY29udGV4dCI6ICdo...",
      signature: "b7V2UpDPytr-kMnM_YjiQ3E0J2..."
    },
    // ...
  ],

  // potential pagination token
  "skip_token": "ajfl43241nnn1p;u9390",
}
```

## Paging

- `skip_token` is an opaque token to be used for continuation of a request.

They may be returned on responses with multiple results, and added to the initial request's `query` object:

```js
{
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  "interface": "Collections",
  "query": {
    "context": "schema.org",
    "type": "MusicPlaylist",
    "skip_token": "ajfl43241nnn1p;u9390"
  }
}
```

# Interfaces

To facilitate common interactions and data storage, Hubs provide a set of standard interfaces that can be written to:

- `Profile` ➜ The owning entity's primary descriptor object (schema agnostic)
- `Permissions` ➜ The access control JSON document
- `Actions` ➜ A known endpoint for the relay of actions to the identity owner
- `Stores` ➜ Scoped 1:1 storage space that is directly assigned to another, external DID
- `Collections` ➜ The owning entity's identity collections (access limited)
- `Services` ➜ any custom, service-based functionality the identity exposes

## Profile

Each Hub has a `profile` object that describes the owning entity. The profile object should use whatever schema and object that best represents the entity. To ge the profile for a DID, send an object query to the `Profile` interface: 

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "query": {
      "interface": "Profile",
  }
}
```

## Permissions

All access and manipulation of identity data is subject to the permissions established by the owning entity. See the [permissions.md](./docs/permissions.md) explainer for details.

## Actions

The `Actions` interface is for sending a target identity semantically meaningful objects that convey an intent to the sender, which often involves the data payload of the object. The `Actions` interface is not constrained to simple human-centric communications. Rather, it is intended as a universal conduit through which identities can transact all manner of activities, exchanges, and notifications.

The base data format for conveying an action shall be:

[http://schema.org/Action](http://schema.org/Action)

Here is a list of examples to show the range of use-cases this interface is intended to support:

- Human user contacts another with a textual message ([ReadAction](http://schema.org/ReadAction))
- Event app sends a request to RSVP for an event ([RsvpAction](http://schema.org/RsvpAction))
- Voting agency prompts a user to submit a vote ([VoteAction](http://schema.org/VoteAction))

```json
{  
  "@context": "http://schema.org/",
  "@type": "ReadAction",
  "name": "Acme Bank - March 2018 Statement",
  "description": "Your Acme Bank statement for account #1734765",
  "object": PDF_SOURCE
}
```

## Stores

The best way to describe Stores is as a 1:1 DID-scoped variant of the W3C DOM's origin-scoped `window.localStorage` API. The key difference being that this form of persistent, pairwise object storage transcends providers, platforms, and devices. For each storage relationship between the DID owner and external DIDs, the Hub shall create a key-value document-based storage area. The DID owner or external DID can store unstructured JSON data to the document, in relation to the keys they specify. The Hub implementer may choose to limit the available space of the storage document, with the option to expand the storage limit based on criteria the implementer defines.

## Collections

Data discovery has been a problem since the inception of the Web. Most previous attempts to solve this begin with the premise that discovery is about individual entities providing a mapping of their own service-specific API and data schemas. While you can certainly create a common format for expressing different APIs and data schemas, you are left with the same basic issue: a sea of services that can't efficiently interoperate without specific review, effort, and integration. Hubs avoid this issue entirely by recognizing that the problem with *data discovery* is that it relies on *discovery*. Instead, Hubs assert the position that locating and retrieving data should be an *implicitly knowable* process.

Collections provide an interface for accessing data objects across all Hubs, regardless of their implementation. This interface exerts almost no opinion on what data schemas entities use. To do this, the Hub Collection interface allows objects from any schema to be stored, indexed, and accessed in a unified manner.

With Collections, you store, query, and retrieve data based on the very schema and type of data you seek. Here are a few example data objects from a variety of common schemas that entities may write and access via a user's Hub:

**Locate any offers a user might want to share with apps** (http://schema.org/Offer)

```js
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ObjectQueryRequest",
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "query": {
      "interface": "Collections",
      "context": "http://schema.org",
      "type": "Offer",
  }
}
```

## Services

Services offer a means to surface custom service calls an identity wishes to expose publicly or in an access-limited fashion. Services should not require the Hub host to directly execute code the service calls describe; service descriptions should link to a URI where execution takes place.

Performing a `Request` request to the base `Services` interface will respond with an object that contains an entry for every service description the requesting entity is permitted to access.

```js
// request
{
  "iss": "did:foo:123abc",
  "sub": "did:bar:456def",
  "aud": "did:baz:789ghi",
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ServicesRequest",
}

// response
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "ServicesResponse",
  developer_message: "optional message",
  services: [{
    // Open API service descriptors
  }]
}
```

All definitions shall conform to the [Open API descriptor format](https://github.com/OAI/OpenAPI-Specification).

  [13f07ee0]: https://tools.ietf.org/html/rfc5785 "IETF well-know URIs"
  [6cc282d2]: https://www.ietf.org/assignments/well-known-uris/well-known-uris.xml "well-known URI Directory"
  [2773b365]: http://jsonapi.org/format/ "JSON API Spec"
