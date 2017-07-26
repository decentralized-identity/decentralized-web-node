# Hub Asset Access Control System

[Back to Explainer](../explainer.md)

## Motivation
Per the hub specification, there is a need for a flexible, expressive, and simple permissioning system to represent authority over files stored by a hub.
The goal of this proposal is to present an access control system which:
- Allows permissions to be delegated to DIDs
- Supports multiple permission levels for differential access
- Allows independent permissioning of core endpoints and individual extensions


## Permission Levels
Hubs support basic data manipulation operations which follow RESTful design principles as well as extensions which can expose a REST or RPC-style interface. To handle both styles, this proposal recommends the CRUDX permission set:
- C: Create
- R: Read
- U: Update
- D: Delete
- X: Execute

The goal is to provide intuitive permission levels for common operations (`CRUD` for RESTful interfaces) as well as flexible permissioning for complex or aberrant operations (`X` for extensions that manage their own access controls or expose an RPC interface, e.g. via an `action` body parameter).

### CRUDX Specification
The CRUDX specification string follows the UNIX file system model: each specification is a bit-array of length 5 where each element of the array represents the corresponding permission level and can be set to `1` (allowed), `0` (not allowed). This can be displayed as a 5-character string where each character is either the first letter of the permission level's name (allowed) or a hyphen (not allowed); hyphens can optionally be omitted (e.g. ```C--DX == CDX```. Since the representation is an ordered list, a permission can also be specified as an unsigned, 5-bit integer (e.g. ```C--DX == 25```).

#### Examples
| Description | String | Integer |
|-------------|--------|---------|
| Full Permissions | `CRUDX` | `31` |
| Null Permissions | `-----` | `0` |
| Read Only | `-R---` | `2` |
| Read & Execute | `-R--X` | `18` |

NOTE: this proposal could be confusing because the integer values of each permission level do NOT match the UNIX levels; they are not even ordered from least to most dangerous.


## DID (Permission Recipients/Grantees)
Following the higher-level architecture of Hubs, the permission system uses DIDs as the primary mechanism for identifying recipients.
It might also support raw cryptographic keys, but a better idea would be to allow embedded DDOs which can represent raw keys for whatever cryptosystems are supported by the DID spec. Below is a json array of valid identifiers:

> TODO: I'm not sure if there's a simple and valid DDO that just exposes a key without addl rigmarole

```json
[
  "did:sov:dan.id",
  { "@context": "https://example.org/did/v1",
    "owner": [
      { "type": ["CryptographicKey", "EdDsaPublicKey"],
        "curve": "ed25519",
        "publicKeyBase64": "lji9qTtkCydxtez/bt1zdLxVMMbz4SzWvlqgOBmURoM=" } ]
  }
]
```


## PermissionSpecification
Permissions are represented via a series of `PermissionSpecification` objects. A root PermissionSpecification is stored at: `/.well-known/identity/:id/permissions`. See [Inheritance](#Inheritance) for more on

All `PermissionSpecifications` adhere to the following schema:

| Field | Type | Description | Required | Examples |
|-------|------|-------------|----------|---------|
| did | DID \| DDO \| glob | This field specifies the entity who is granted the permissions specified by this PermissionSpecification object | TRUE     | <pre> "did:sov:dan.id"</pre><pre>  {"@context": "https://example.org/did/v1",<br>   "owner": [{<br>     "type": ["CryptographicKey", "EdDsaPublicKey"],<br>     "curve": "ed25519",<br>     "publicKeyBase64": "lji9qTtkCydxtez/bt1zdLxVMMbz4SzWvlqgOBmURoM="}]}</pre> |
| path | DID-reference \| glob | The `path` field contains an absolute or relative [DID reference](https://docs.google.com/document/d/1Z-9jX4PEWtyRFD5fEyyzEnWK_0ir0no1JJLuRu8O9Gs/edit#heading=h.q2ajgt4zoqlc) that identifies a path, data asset, or endpoint. Pattern matching is supported per the [Patterns](###Patterns) section | TRUE | `*`, `./stores`, `did:sov:dan.id/collections/photos` |
| object_filters | object | The `object_filters` field allows for the selection of data assets using the metadata in the control object which wraps each path and asset. This is (currently) a flat key-value mapping with no pattern-matching support. | FALSE | To allow access to objects _created_ by a given identity: <br> <pre> { "author": "did:btcr:123" } </pre> |
| argument_filters | object | The `argument_filters` field allows for selection of data assets using the properties of the incoming request which initiated the permission validation. | FALSE | To allow access to execution of an extension's `invokeRPC` method: <br> <pre> { "action": "invokeRPC" } </pre> |
| allow | [CRUDX specification](#CRUDX-specification) | The permissions granted to the identities specified in `identifiers` | TRUE | `CR--X`, `CRUDX`, `19 (CR--X)`, `31 (CRUDX)` |
| _deny_ | [CRUDX specification](#CRUDX-specification) | The permissions denied to the identities specified in `identifiers`. NOTE: this is field is not yet part of the specification and is being reserved for possible future inclusion.  | FALSE | `CR--X`, `CRUDX`, `19 (CR--X)`, `31 (CRUDX)` |
| ext | object | The `ext` field is reserved for additional fields that are use to configure specific routes or extensions. | FALSE | The `/stores` endpoint supports `min_size` and `max_size` to configure how much storage an identity is permitted to keep in its store: <br> <pre> { "min_size": 1, "max_size": 100 } </pre> |

### Example
`GET /.identity/:id_owner_did/permissions?path=collections`
```json
[{
  "did": "did:btcr:123",
  "path": "hl7.org:fhir/*",
  "object_filters": {
    "author": "did:btcr:123"
  },
  "argument_filters": {
    "action": "create"
  },
  "allow": "CR---",
  "ext": {
    "callbacks": [
      {
        "event": "created",
        "uri": URI,
        "headers": { "X-MY-DOPE-HEADER": 44 }
      }
    ]
  }
}, ...]
```

## Paths
The path is the main unit of granularity for permissions. Each `PermissionSpecification` has a `path` field which supports glob pattern matching, and an optional parent path query parameter can be specified in the the get request to the `/permissions` endpoint.

Paths in the body of a `PermissionSpecification` may be either full DID-references or relative [DID-paths](https://docs.google.com/document/d/1Z-9jX4PEWtyRFD5fEyyzEnWK_0ir0no1JJLuRu8O9Gs/edit#heading=h.8rl8lput6gnv). Relative paths are relative to the location of the `PermissionSpecification` in which they are used, e.g.

`GET /.identity/:id_owner_did/permissions`
```json
[{
  "did": "did:btcr:123",
  "path": "collections/hl7.org:fhir/*",
  "allow": "CRU--"
}]
```

Paths in the query parameter are always relative to the root of the identity owner's DID are being requested, e.g.

`GET /.identity/:id_owner_did/permissions?path=stores&did=btcr:123`
```json
[{
  "did": "did:btcr:123",
  "path": "did:btcr:123/*",
  "allow": "CRUD-"
}]
```
If no path is specified in the query string, the implied path is also the root of the identity owner's DID.

### Patterns
There is a clear need to support specifications that apply to a set of resources, rather than a single path (directory) or resource (data asset). To support this behavior we have to choose a solution that balances expressiveness, comprehensibility, and safety.

The naive solution is to employ regular expressions. While regex are extremely powerful, they are also error prone and difficult to audit, so instead we elect to use the less powerful solution, but safer solution: UNIX-like glob matching, which provides a subset of regex functionality, particularly `?` (single-character wildcard) and `*` (many-character wildcard).

Patterns (currently) may only be used in the `path` field of the `PermissionSpecification` object.

## Inheritance / Field-level Permissions
The `deny` field of the `PermissionSpecification` is reserved for future use to implement field-level permissioning, i.e. allowing access to a data asset, but resistrictng access to specific fields. This concept is only sensible in the mode where the hub has access to the data asset itself (where it is not encrypted with a client-side encryption key).

This example will grant `did:btrc:123` access to read the identity owner's profile document, _with the `github-handle` field omitted_:
```json
[{
  "did": "did:btcr:123",
  "path": "profile",
  "allow": "-R---"
}, {
  "did": "did:btcr:123",
  "path": "profile#github-handle",
  "deny": "-R---"
}]
```

## Content-Type Selection (Tags/Querying)
It is useful to be able to select resources based on metadata apart from their path. Examples include selecting all resources:
- created by a certain identity
- updated at a certain time
- adhering to a certain schema, or
- tagged with a certain label

To achieve this, all data assets are wrapped with a control object that contains a finite set (**TODO: define the set**). These fields are exposed via the `object_filters` field in the `PermissionSpecification` which does not support any pattern matching, only direct comparison.

This example will grant `did:btcr:123` access to only the assets in the `hl7.org:fhir` collection _that were created by `did:btcr:123`_:
```json
[{
  "did": "did:btcr:123",
  "path": "hl7.org:fhir/*",
  "object_filters": {
    "author": "did:btcr:123"
  }
}]
```

## Callbacks
In order for applications to operate with hubs reactively, there is a need to expose a mechanism for requesting notifications from the hub when data assets are created/updated/executed/etc. Since this mechanism would essentially enable autonomous operation of the hub, it must be explicitly permissioned. We leverage the `ext` block to add support for callback permissioning.

### CallbackSpecification
Callback permissions are represented via a series of `CallbackSpecification` objects, which adhere to the following schema: **WIP!**

| Field | Type | Description | Required | Examples |
|-------|------|-------------|----------|----------|
| events | array\<CRUDX operation> | The event field specifies when a callback should be launched. (Should this just be a normal CRUDX value?) | TRUE | `["created", "read", "updated", "deleted", "executed"]` |
| uri | URI | The uri field specifies who should receive the callback notification. This field and the did field are mutually exclusive. | FALSE | `https://someuri.co/callback_endpoint` |
| did | DID or DDO | The did field specifies who should received. A hub for the receiving DID will be resolved and that will receive the notification. This field and the URI field are mutually exclusive. | FALSE | `did:btcr:123` |
| headers | object | The headers field contains any custom headers the receiver wants to be included on outgoing callback notification requests. | FALSE | `{ "Content-Type": "application/Person.json" }` |

```json
[{
  "did": "did:btcr:123",
  "path": "hl7.org:fhir/*",
  "ext": {
    "callbacks": [{
      "events": ["created"],
      "uri": URI,
      "headers": {"X-MY-DOPE-HEADER": 44}
    }]
  }
}]
```

TODO: define the callback request interface.
