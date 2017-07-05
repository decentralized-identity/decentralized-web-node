# Hub Asset Access Control System

[Back to Explainer](../explainer.md)

## Motivation
Per the hub specification, there is a need for a flexible, expressive, and simple permissioning system to represent authority over files stored by a hub.
The goal of this proposal is to present an access control system which:
- Allows permissions to be delegated to DIDs
- Supports multiple permission levels for differential access
- Allows indepdendent permissioning of core endpoints and individual extensions


## Permission Levels
Hubs support basic data manipulation operations which follow RESTful design principles as well as extensions which can expose a REST or RPC-style interface. To handle both styles, this proposal recommends the CRUDX permission set:
- C: Create
- R: Read
- U: Update
- D: Delete
- X: Execute

The goal is to provide intuitive permission levels for common operations (`CRUD` for RESTful interfaces) as well as flexible permissioning for complex or aberrant operations (`X` for extensions that manage their own access controls or expose an RPC interface).

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


## Identifiers (Permission Recipients/Grantees)
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

| Field | Type | Description | Required | Example |
|-------|------|-------------|----------|---------|
| identifiers | array\<DID or DDO> \| glob | This field specifies the entities who are granted the permissions specified by this PermissionSpecification object | TRUE     | <pre>[ "did:sov:dan.id",<br>  {"@context": "https://example.org/did/v1",<br>   "owner": [{<br>     "type": ["CryptographicKey", "EdDsaPublicKey"],<br>     "curve": "ed25519",<br>     "publicKeyBase64": "lji9qTtkCydxtez/bt1zdLxVMMbz4SzWvlqgOBmURoM="}]}]</pre> |
| path | DID-reference \| glob | The `path` field contains an absolute or relative [DID reference](https://docs.google.com/document/d/1Z-9jX4PEWtyRFD5fEyyzEnWK_0ir0no1JJLuRu8O9Gs/edit#heading=h.q2ajgt4zoqlc) that identifies a directory, data asset, or endpoint. Pattern matching is supported per the [Patterns](###Patterns) section | TRUE | `*`, `./stores`, `did:sov:dan.id/collections/photos` |
| allowed | [CRUDX specification](#CRUDX-specification) | The permissions granted to the identities specified in `identifiers` | FALSE | `CR--X`, `CRUDX`, `19 (CR--X)`, `31 (CRUDX)` |
| denied | [CRUDX specification](#CRUDX-specification) | The permissions denied to the identities specified in `identifiers`. NOTE: this field and `allowed` can be merged into a single `permissions` field if we choose a model with no inheritance support | FALSE | `CR--X`, `CRUDX`, `19 (CR--X)`, `31 (CRUDX)` |

### Example
```json
{
  "identifiers": [ "did:sov:dan.id" ],
  "path": "stores/*",
  "permission": "C----"
}
```

## Paths
Paths are specified as either full DID-references or relative [DID-paths](https://docs.google.com/document/d/1Z-9jX4PEWtyRFD5fEyyzEnWK_0ir0no1JJLuRu8O9Gs/edit#heading=h.8rl8lput6gnv). Relative paths are relative to the location of the `PermissionSpecification` in which they are used.

### Patterns
There is a clear need to support specifications that apply to a set of resources, rather than a single path (directory) or resource (data asset). To support this behavior we have to choose a solution that balances expressiveness, comprehensibility, and safety.

#### Options
- Regex: The obvious solution is to employ regular expressions. While regex are extremely powerful, they are also error prone and difficult to audit.
- Globs: A less powerful solution but safer solution is UNIX-like glob matching, which provides a subset of regex functionality, particularly `?` (single-character wildcards) and `*` (many-character wildcards).

## Inheritance
I'd like to see a model where a permission spec can be assigned to any object at any level in the URI. e.g.
- `/.well-known/identity/:id/permissions`
- `/.well-known/identity/:id/collections/permissions`
- `/.well-known/identity/:id/collections/photos/permissions`
- `/.well-known/identity/:id/extensions/business_hours/permissions`

### Benefits
- `PermissionSpecification` files stay small and easy to edit
- Allows for easy-to-understand logical scoping (assuming an easy-to-use hub mgmt GUI)

### Problems
- This does introduce a lot of complexity around how hierarchical permissions are merged
- The obvious path structure in the examples above would require a reserved keyword (e.g. `permissions`) in the hub path/filename specification, which is undesirable


## Content-Type Selection (Tags/Querying)
It is useful to be able to select resources based on metadata apart from their path. Examples include selecting all resources:
- created by a certain identity
- updated at a certain time
- adhering to a certain schema, or
- tagged with a certain label

There are several solutions to address this, ranging from a purpose-built `tags` selector to a full query language. The performance and implementation of those solutions all depend heavily on the way resources are stored and indexed, and at time of writing I'm unsure of how to weigh the solutions' marginal utility against those perf/impl costs.

> i.e. OPEN QUESTION: **How queryable will/should hubs be?**

## Addl Notes
- I think callbacks are (or should be) outside the scope of the permissioning system, so they haven't been mentioned here.
