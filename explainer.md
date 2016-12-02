# Identity Hubs

In order to maximize data interoperability and accessibility between identity hubs, and other systems that will interact with identity data (crawlers, apps, etc.), it is important to create a globally recognized API based on a recognized query format that explicitly maps to semantic, expected data objects.

Thought the term Identity Hub is a singular, an entity may have multiple instances of their identity hub active across different devices and cloud providers. These instances sync identity state changes amongst each other, ensuring that the owning entity has access to vital identity data and attestations everywhere they go, even when offline.

## Syncing Data to Multiple Hubs

Goal: and implementation agnostic protocol for syncing changes in data and settings to all of an identity's active hubs.

Suggestions?

## Well-Known URI

To enable both identity hubs and existing severs of Web content to interact with the world of identity via the Identity Hub APIs, we are using the IETF convention for globally defined resources that predictably reside at well known locations, as detailed in [RFC 5785 well-known URIs][13f07ee0] and the [well-known URI directory][6cc282d2]. The `well-known` URI suffix shall be `identity`, thus identity hubs are accessible via the path: `/.well-known/identity/:id`, wherein the last segment of the path is the target ID for the identity you wish to interact with. 

## API Routes

There are a handful of default, top-level endpoints that have defined meaning within the system, those are:

  `/.well-known/identity/:id/`*`profile`* ➜ The owning entity's primary descriptor object (schema agnostic).

  `/.well-known/identity/:id/`*`permissions`* ➜ The access control JSON document

  `/.well-known/identity/:id/`*`stores`* ➜ Scoped storage space for user-permitted external entities

  `/.well-known/identity/:id/`*`collections/:context`* ➜ The owning entity's identity collections (access limited)

#### The Profile Object

One universal object you can expect nearly every hub to have is a `profile`. This is the owning entity's primary descriptor object. The object should be encoded in the format of whatever schema object best represents the entity. Here is an example of using the Schema.org `Person` schema to express that an identity belongs to a human being:

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

#### Permissions

All access and manipulation of identity data is subject to the permissions established by the owning entity. Because the identities are self-sovereign, all data associated with the identity must be portable. Transfer of a identity's contents and settings between environments and hosts should be seamless, without loss of data or operational state, including the permissions that govern access to identity data.

These permissions are declared in a TBD, which you can read more about in the documentation here: TBD. This access control document dictates what data the owning entity publicly exposes, as well as the permissions for Connections the entity creates with other entities across the web of identity, whether they are humans, apps, services, devices, etc.

#### Stores

Stores are areas of per-entity, scoped data storage in an identity hub provided to any entity the user wishes to allow. Stores are addressable via the `/stores` top-level path, and keyed on the entity's decentralize identifier. Here's an example of the path format:

`/.well-known/identity/:id/stores/`*`ENTITY_ID`*

The data shall be a JSON object and should be limited in size, with the option to expand the storage limit based on user discretion. Stores are not unlike a user-sovereign, entity-scoped version of the W3C DOM's origin-scoped `window.localStorage` API.

#### Collections

The full scope of an identity's data is accessible via the following path `/.well-known/identity/:id/collections/:context`, wherein the path structure is a 1:1 mirror of the schema context declared in the previous path segment. The intent is to provide a known path for accessing standardized, semantic objects reliably across all hubs, but do so in way that asserts as little opinion as possible. The names of object types may be cased in various schema ontologies, but hub implementations should always treat these paths as *case insensitive*. Here are a few examples of actual paths and the type of Schema.org objects they will respond with:

`/.well-known/identity/:id/collections/schema.org:Event` ➜ http://schema.org/Event

`/.well-known/identity/:id/collections/schema.org:Invoice` ➜ http://schema.org/Invoice

`/.well-known/identity/:id/collections/schema.org:Photograph` ➜ http://schema.org/Photograph

## Request/Response

To maximize reuse of existing standards and open source projects, The REST API uses [JSON API's specification][2773b365] for request, response, and query formats, and leverages standard schemas for encoding stored data and response objects. Requests should be formatted in accordance with the JSON API documentation: http://jsonapi.org/format/#fetching. The `Accept` header parameter for requests should be set to `application/vnd.api+json`.

#### Authentication

The process of authenticating requests from the primary user or an agent shall follow the FIDO and Web Authentication specifications. These specifications may require modifications in order to support challenging globally known IDs with provably linked keys.

#### Example Request

The REST routes for fetching and manipulating identity data should follow a common path format that maps 1:1 to the schema of data objects being transacted. Here is an example of how to send a `GET` request for an identity's Schema.org formatted music playlists:

`/.well-known/identity/jane.id/collections/schema.org:`*`MusicPlaylist`*

Requests will always return an array of all objects - *the user has given you access to* - of the related Schema.org type, via the response object's `collections` property, as shown here:

```json
{
  "links": {
    "self": "/.well-known/identity/jane.id/collections/schema.org:MusicPlaylist"
  },
  "collections": [{
  "@context": "http://schema.org",
  "@type": "MusicPlaylist",
  "name": "Classic Rock Playlist",
  "numTracks": 2,
  "track": [{
      "@type": "MusicRecording",
      "byArtist": "Lynard Skynyrd",
      "duration": "PT4M45S",
      "inAlbum": "Second Helping",
      "name": "Sweet Home Alabama",
      "permit": "/.well-known/identity/jane.id/collections/schema.org:Permit/ced043360b99"
    },
    {
      "@type": "MusicRecording",
      "byArtist": "Bob Seger",
      "duration": "PT3M12S",
      "inAlbum": "Stranger In Town",
      "name": "Old Time Rock and Roll",
      "permit": "/.well-known/identity/jane.id/collections/schema.org:Permit/aa9f3ac9eb7a"
    }]
  }]
}
```

#### Query Filter Syntax

The Identity Hub spec does not mandate specific storage and search implementations, but for the purposes of interoperability and developer ergonomics hubs must accept a common search and filtering syntax regardless of the underlying implementation choice.

To avoid the introduction of a new syntax, we feel [Apache Lucene's query filtering syntax](http://www.lucenetutorial.com/lucene-query-syntax.html) balances the desire to select an option with broad, existing support, and the flexibility and expressiveness developers demand.

Filters can be applied via the `filter` parameter of your queries. Additionally, filters are used to enable more granular permissioning - see the ACL spec document for more info.


  [13f07ee0]: https://tools.ietf.org/html/rfc5785 "IETF well-know URIs"
  [6cc282d2]: https://www.ietf.org/assignments/well-known-uris/well-known-uris.xml "well-known URI Directory"
  [2773b365]: http://jsonapi.org/format/ "JSON API Spec"
