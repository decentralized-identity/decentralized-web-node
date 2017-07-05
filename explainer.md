# Hubs

Hubs let you securely store and share data. A Hub is a datastore containing semantic data objects at well-known locations.  Each object in a Hub is signed by an identity and accessible via a globally recognized API format that explicitly maps to semantic data objects.  Hubs are addressable via a unique identifiers maintained in a global namespace.

## Single Address for Multiple Hub Instances

A single entity may have one or more instances of a Hub, all of which are addressable via a URI routing mechanism linked to the entity’s identifier.  Hub instances sync state changes, ensuring the owner can access data and attestations from anywhere, even when offline.

## Syncing Data to Multiple Hubs

Hub instances must sync data without requiring master-slave relationships or forcing a single implementation for storage or application logic.  This requires a shared replication protocol for broadcasting and resolving changes. [CouchDB](http://docs.couchdb.org/en/2.0.0/replication/protocol.html), an open source Apache project, will be the data syncing protocol Hubs must implement. It features an eventually consistent, master-master replication protocol that can be decoupled from the default storage layer provided by CouchDB.

## Well-Known URIs

Existing web servers need to interact with Hubs.  Similar to the IETF convention for globally defined metadata resources, detailed in [RFC 5785 well-known URIs][13f07ee0], Hubs are accessible via a stable, universally recognizable path: /.identity/:id, wherein the last segment of the path is the target DID or global name for the identity you wish to interact with.

## API Routes

Each Hub has a set of top-level API routes:

  `/.identity/:id/`*`profile`* ➜ The owning entity's primary descriptor object (schema agnostic).

  `/.identity/:id/`*`permissions`* ➜ The access control JSON document

  `/.identity/:id/`*`messages`* ➜ A known endpoint for the relay of messages/actions to the identity owner

  `/.identity/:id/`*`stores`* ➜ Scoped storage space for user-permitted external entities

  `/.identity/:id/`*`collections/:context/:objectType`* ➜ The owning entity's identity collections (access limited)

  `/.identity/:id/`*`extensions`* ➜ any custom, service-based functionality the identity exposes

#### Route Handling

If for whatever reason a Hub implementer decides not to support any endpoints of the top-level API (a rare but possible case), the Hub shall return the HTTP Error Code `501 Not Implemented`, regardless of the path depth of the inbound request.

If the Hub provider wishes, for any reason, to relay the request to a different URI location, they must return the HTTP Status Code `303 See Other`.

#### Hub Profile Objects

Each Hub has a `profile` object that describes the owning entity.  The profile object should use the format of the schema object best represents the entity. Here is an example of using the Schema.org `Person` schema to express that a hub belongs to a person:

```json
{
    "@context": "http://schema.org",
    "@type": "Person",
    "name": "Daniel Buchner",
    "description": "Working on decentralized identity at Microsoft",
    "website": [
      {
        "@type": "WebSite",
        "url": "http://www.backalleycoder.com/"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Los Gatos, CA"
    }
}
```

#### Data Portability
All Hub data associated with the identity must be portable. Transfer of a hub’s contents and settings between environments should be seamless, without loss of data or operational state, including the permissions that govern access to identity data.

#### Permissions

All access and manipulation of identity data is subject to the permissions established by the owning entity. Because the identities are self-sovereign, all data associated with the identity must be portable. Transfer of a identity's contents and settings between environments and hosts should be seamless, without loss of data or operational state, including the permissions that govern access to identity data.

See the [permissions.md](./docs/permissions.md) explainer for details.

#### Messages

The `messages` open endpoint receives objects signed by other identities. Messages are not constrained to the simple exchange of human-to-human communications. Rather, they are intended to be a singular, known endpoint where identities can transact all manner of messaging, notifications, and prompts for action.

The endpoint location for message objects shall be:

  `/.identity/:id/messages/`

The required data format for message payloads shall be:

[http://schema.org/Message](http://schema.org/Message)

If the intent of your message is to prompt the receiving Hub to perform a certain semantic activity, you can pass an [Action](http://schema.org/Action) object via the Message's `potentialAction` property.

Here is a list of examples to show the range of use-cases this endpoint is intended to support:

- Human user contacts another with a textual message (Message with a [ReadAction](http://schema.org/ReadAction))
- Bot identity prompts a human to sign a document (Message with an [EndorseAction](http://schema.org/EndorseAction))
- IoT device sends a notification to one of its Agents (Message with an [UpdateAction](http://schema.org/UpdateAction))

#### Stores

Stores are collections of identity-scoped data storage. Stores are addressable via the `/stores` top-level path, and keyed on the entity's decentralize identifier. Here's an example of the path format:

`/.identity/:id/stores/`*`ENTITY_ID`*

The data shall be a JSON object and should be limited in size, with the option to expand the storage limit based on user or provider discretion. Stores are not unlike a user-sovereign entity-scoped version of the W3C DOM's origin-scoped `window.localStorage` API.

#### Collections

Collections provide a known path for accessing standardized, semantic objects across all hubs, in way that asserts as little opinion as possible. The full scope of an identity's data is accessible via the following path

`/.identity/:id/collections/:context`, wherein the path structure is a 1:1 mirror of the schema context declared in the previous path segment. The names of object types may be cased in various schema ontologies, but hub implementations should always treat these paths as case insensitive. Here are a few examples of actual paths and the type of Schema.org objects they will respond with:

`/.identity/:id/collections/schema.org/Event` ➜ http://schema.org/Event

`/.identity/:id/collections/hl7.org:fhir:v2/Device` ➜ https://www.hl7.org/fhir/device.html

`/.identity/:id/collections/schema.org/Photograph` ➜ http://schema.org/Photograph

#### Extensions

Extensions offer a means to surface custom API endpoints an identity wishes to expose publicly or in an access-limited fashion. Extensions should not require the Hub host to directly execute code the endpoints describe; service descriptions should link to a URI where execution takes place.

Performing a `GET` request to the base `/extensions` endpoint will respond with an object that contains an entry for every service description the requesting entity is permitted to access.

##### Service Descriptions

All definitions shall conform to the [Swagger API descriptor format](http://swagger.io/specification).

## Request/Response

The REST API uses [JSON API's specification](http://jsonapi.org/format/) for request, response, and query formats, and leverages standard schemas for encoding stored data and response objects.  Given the nature of the responses, only the Top Level properties are in scope for this utilization. Requests should be formatted in accordance with the JSON API documentation: http://jsonapi.org/format/#fetching. The `Content-Type` and `Accept` header parameters must be set to `application/vnd.api+json`.  This approach maximizes the use of existing standards and open source projects.

#### Authentication

The process of authenticating requests from the primary user or an agent shall follow the FIDO and Web Authentication specifications (as closely as possible). These specifications may require modifications in order to support challenging globally known IDs with provably linked keys.

#### GET Requests

The REST routes for fetching and manipulating identity data should follow a common path format that maps 1:1 to the schema of data objects being transacted. Here is an example of how to send a `GET` request for an identity's Schema.org formatted music playlists:

`/.identity/jane.id/collections/schema.org:`*`MusicPlaylist`*

Requests will always return an array of all objects - *the user has given you access to* - of the related Schema.org type, via the response object's `collections` property, as shown here:

```json
{
  "links": {
    "self": "/.identity/jane.id/collections/schema.org:MusicPlaylist"
  },
  "data": {
    "payload": [{
      "settings": {
        "id": "4n93v7a4xd67",
        "key": "...",
        "cache-intent": "full"
      },
      "descriptor": {
        "@context": "http://schema.org",
        "@type": "MusicPlaylist",
        "@id": "4n93v7a4xd67",
        "name": "Classic Rock Playlist",
        "numTracks": 2,
        "track": [
          {
            "settings": {
              "id": "23fge3fwg34f",
              "key": "...",
              "cache-intent": "full"
            },
            "descriptor": {
              "@type": "MusicRecording",
              "byArtist": "Lynard Skynyrd",
              "duration": "PT4M45S",
              "inAlbum": "Second Helping",
              "name": "Sweet Home Alabama",
              "permit": "/.identity/jane.id/collections/schema.org:Permit/ced043360b99"
            }
          },
          {
            "settings": {
              "id": "7e2fg36y3c31",
              "key": "...",
              "cache-intent": "full"
            },
            "descriptor": {
              "@type": "MusicRecording",
              "byArtist": "Bob Seger",
              "duration": "PT3M12S",
              "inAlbum": "Stranger In Town",
              "name": "Old Time Rock and Roll",
              "permit": "/.identity/jane.id/collections/schema.org:Permit/aa9f3ac9eb7a"
            }
          }
        ]
      }
    }]
  }
}
```

#### POST Requests

POSTs are verified to ensure two things about the requesting party: 1) They are the decentralized identity they claim to be, and 2) They are authorized (as specified in the ACL JSON document) to write data to a specified route.

Addition of new data objects into a collection must follow a process for handling and insertion into storage:

1. The new objects must be assigned with an `@id` property
2. The Hub instance must wrap the native data object with an object that contains the unique ID and item-specific controls. These control properties include:
- `key`: the symmetrical public key used to encrypt the object, which Hubs and entities use to re-encrypt
- `cache-intent`:
  - `min`: Just the ID and item record for an entry
  - `desc`: The descriptor object for an item, without full source
  - `full`: The descriptor object and full source for an item
3. The object must be encrypted with the symmetrical key of the entities that have read privileges, as specified in the ACL JSON document.
4. The object shall be inserted into the Hub instance that is handling the request.
5. Upon completing the above steps, the change must be synced to the other Hub instances via the Replication Process.

#### Replication Process

...

#### Query Filter Syntax

The Hub spec does not mandate specific storage and search implementations.  For the purposes of interoperability and developer ergonomics hubs must accept a common search and filtering syntax regardless of the underlying implementation choice.

To avoid the introduction of a new syntax, we feel [Apache Lucene's query filtering syntax](http://www.lucenetutorial.com/lucene-query-syntax.html) balances the desire to select an option with broad, existing support, and the flexibility and expressiveness developers demand.

Filters can be applied via the `filter` parameter of your queries. Additionally, filters are used to enable more granular permissioning - see the ACL spec document for more info.


  [13f07ee0]: https://tools.ietf.org/html/rfc5785 "IETF well-know URIs"
  [6cc282d2]: https://www.ietf.org/assignments/well-known-uris/well-known-uris.xml "well-known URI Directory"
  [2773b365]: http://jsonapi.org/format/ "JSON API Spec"
