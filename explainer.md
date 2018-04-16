
# **DIF Identity Hubs**

Hubs let you securely store and share data. A Hub is a datastore containing semantic data objects at well-known locations.  Each object in a Hub is signed by an identity and accessible via a globally recognized API format that explicitly maps to semantic data objects.  Hubs are addressable via unique identifiers maintained in a global namespace.

# One DID to Many Hub Instances

A single entity may have one or more instances of a Hub, all of which are addressable via a URI routing mechanism linked to the entity’s identifier.  Hub instances sync state changes, ensuring the owner can access data and attestations from anywhere, even when offline.

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
- `Extensions` ➜ any custom, service-based functionality the identity exposes

##### Unimplemented Interfaces

If for whatever reason a Hub implementer decides not to support any endpoints of the top-level API (a rare but possible case), the Hub shall return the HTTP Error Code `501 Not Implemented`, regardless of the path depth of the inbound request.

If the Hub provider wishes, for any reason, to relay the request to a different URI location, they must return the HTTP Status Code `303 See Other`.

##### Request Format

Instead of a REST-based scheme where data like the username, object types, and query strings are present in the URL, Identity Hubs requests are self-contained message objects that encapsulate all they need to that shielded from observing entities during transport.

```js
{ 
  // Outer envelope is multi-party encrypted with the keys
  // of all Hubs listed in the User's DDO Services array
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Collections/Add', // read, add, update, remove, execute
  request: {
    schema: 'schema.org/MusicPlaylist'
  },
  payload: [
    {
      // Hubs can see and operate on controls to do the following:
      // 1) Know, via cache-intent, the storage replication priority
      // 2) Request metadata the user/party wishes to expose (for search/indexing)
      // 3) Unencrypted - intended-public data
      meta: {
        cache-intent: 'full',
        title: 'Best of Classic Rock',
        tags: ['classic rock', 'rock', 'rock n roll']
      },
      // The data in the payload can be encrypted in one of 3 ways:
      // 1) Encrypted for only the user (DEFAULT)
      // 2) Encrypted for the user and others they allow
      // 3) Unencrypted - intended-public data
      data: {
        "@context": 'http://schema.org/',
        "@type": "MusicPlaylist",
        "description": 'The best rock of the 60s, 70s, and 80s',
        "tracks": [...]
        ...
      }
    }
  ]
}
```

##### Response Format

```js
{
  '@type': 'Collections/Response',
  response: {
    requestHash: HASH_OF_REQUEST
  },
  payload: [{ ... }]
}
```

##### Paging

- `skip` omits the specified number of returned records from the 0-based index.
- `take` returns the number of results specified (if that many exist).

```js
{ 
  // Outer envelope is multi-party encrypted with the keys
  // of all Hubs listed in the User's DDO Services array
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Collections/Request',
  request: {
    schema: 'schema.org/MusicPlaylist',
    skip: 20, // Skip the first 20 records
    take: 10 // Send back records 20-30
  }
}
```

### Profile

Each Hub has a `profile` object that describes the owning entity. The profile object should use whatever schema and object that best represents the entity.

##### *Request*

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Profile/Request'
}
```

##### *Response*

Here is an example of using the Schema.org `Person` schema to express that a hub belongs to a person:

```js
{ 
  '@type': 'Profile/Response',
  response: {
    requestHash: HASH_OF_REQUEST
  },
  payload: [{
    "@context": "http://schema.org",
    "@type": "Person",
    "name": "The Dude",
    "description": "That's just, like, your opinion, man.",
    "website": [
      {
        "@type": "WebSite",
        "url": "http://www.thedudelovesbowling.com/"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5227 Santa Monica Boulevard",
      "addressLocality": "Los Angeles",
      "addressRegion": "CA"
    }
  }]
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
- Voting agency prompts a user to submit a vote ([UpdateAction](http://schema.org/VoteAction))

##### *Request*

```js
{ 
  // Outer envelope is multi-party encrypted with the keys
  // of all Hubs listed in the User's DDO Services array
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def', 
  '@type': 'Actions/Add',
  request: {
    schema: 'schema.org/ReadAction'
  },
  payload: {
    meta: {
      title: 'Please read this sensitive document',
      tags: ['document', 'pdf']
    },
    {  // Data encrypted for the DID owner and the bank
      "@context": 'http://schema.org/',
      "@type": "ReadAction",
      "name": "Acme Bank - March 2018 Statement",
      "description": "Your Acme Bank statement for account #1734765",
      "object": PDF_SOURCE
    }
  }
}
```

##### Attestations

A frequent activity users will engage in is the exchange of attestations. Attestations are claims that one or more users sign with their DID-linked keys to create assertions of proof. These proofs can be for just about anything you can imagine: diplomas, driver's licenses, property deeds, etc. In order to make discovery, request, and transmission of attestations possible, users and organizations need a way to send attestation requests to users and get back the proofs they're looking for.

Requesting parties need a means to ask for attestations in a standard, interoperable way across different instances of Hubs. To send a request that is recognized by User Agents as a request for an attestation, the requesting party must use semantic actions the represent the various stages of negotiation, such as `RequestAttestationAction` and others, as shown in the diagram below:

![Attestation Request](/diagrams/alice-attestation-request.png)

### Stores

The best way to describe Stores is as a 1:1 DID-scoped variant of the W3C DOM's origin-scoped `window.localStorage` API. The key difference being that this form of persistent, pairwise object storage transcends providers, platforms, and devices. For each storage relationship between the DID owner and external DIDs, the Hub shall create a key-value document-based storage area. The DID owner or external DID can store unstructured JSON data to the document, in relation to the keys they specify. The Hub implementer may choose to limit the available space of the storage document, with the option to expand the storage limit based on criteria the implementer defines. . Here's an example of what Stores requests look like:

##### *Request*

Write to a Store:

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Stores/Add',
  request: {
    key: 'u6ef54344w67h5'
  },
  payload: [{
    foo: 'bar'
  }]
}
```

General read of a Store:

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Stores/Request',
  request: {
    skip: 20, // Skip the first 20 keys
    take: 10 // Send back values for keys 20-30
  }
}
```

Request of a specific Store key:

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Stores/Request',
  request: {
    key: 'u6ef54344w67h5'
  }
}
```

##### *Response*

```js
{
  '@type': 'Stores/Response',
  response: {
    requestHash: HASH_OF_REQUEST
  },
  payload: [{
    foo: 'bar'
  }]
}
```

### Collections

Data discovery has been a problem since the inception of the Web. Most previous attempts to solve this begin with the premise that discovery is about individual entities providing a mapping of their own service-specific API and data schemas. While you can certainly create a common format for expressing different APIs and data schemas, you are left with the same basic issue: a sea of services that can't efficiently interoperate without specific review, effort, and integration. Hubs avoid this issue entirely by recognizing that the problem with *data discovery* is that it relies on *discovery*. Instead, Hubs assert the position that locating and retrieving data should be an *implicitly knowable* process.

Collections provide an interface for accessing data objects across all Hubs, regardless of their implementation. This interface exerts almost no opinion on what data schemas entities use. To do this, the Hub Collection interface allows objects from any schema to be stored, indexed, and accessed in a unified manner.

With Collections, you store, query, and retrieve data based on the very schema and type of data you seek. Here are a few examples data objects from a variety of common schemas that entities may write and access via a user's Hub:

**Locate any offers a user might want to share with apps** (http://schema.org/Offer)

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Collections/Request',
  request: {
    schema: 'schema.org/Offer'
  }
}
```

**Manufacturer creates a new product entry supply chain partners can access**  (https://www.gs1.org/voc/Product)

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Collections/Request',
  request: {
    schema: 'gs1.org/voc/Product'
  },
  payload: {
    meta: {
      title: "Folgers Coffee",
      tags: ['coffee', 'ground coffee']
    },
    {
      "@context": 'https://www.gs1.org/voc',
      "@type": "product",
      "gtin": 00025500101163,
      "productName": "Aroma Roasted Coffee",
      "manufacturer": "The Folger Coffee Company"
      ...
    }
  }
}
```

**Medical provider updates a user's patient record** (https://www.hl7.org/fhir/patient)

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Collections/Update',
  request: {
    schema: 'hl7.org/fhir/patient',
    id: '34bj452vvg443l'
  },
  payload: {
    meta: {
      title: 'Patent Record',
      tags: ['medical', 'patient', 'record']
    },
    { // Data encrypted for the DID owner and their doctors
      "@context": 'https://www.hl7.org/fhir',
      "@type": "patient",
      "name": "Jeff",
      "family": "Lebowski"
      ...
    }
  }
}
```

### Services

Services offer a means to surface custom service calls an identity wishes to expose publicly or in an access-limited fashion. Extensions should not require the Hub host to directly execute code the service calls describe; service descriptions should link to a URI where execution takes place.

Performing a `Request` request to the base `Services` interface will respond with an object that contains an entry for every service description the requesting entity is permitted to access.

##### *Request*

```js
{ 
  iss: 'did:foo:123abc',
  aud: 'did:bar:456def',
  '@type': 'Services/Request'
}
```

##### *Response*

Here is an example of a request for all 

```js
{ 
  '@type': 'Services/Response'
  response: {
    requestHash: HASH_OF_REQUEST
  },
  payload: [{
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
