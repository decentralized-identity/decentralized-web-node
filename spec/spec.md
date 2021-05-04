Identity Hub
==================

**Specification Status:** Strawman

**Latest Draft:**
  [identity.foundation/identity-hub](https://identity.foundation/identity-hub)
<!-- -->

**Participate:**
~ [GitHub repo](https://github.com/decentralized-identity/identity-hub)
~ [File a bug](https://github.com/decentralized-identity/identity-hub/issues)
~ [Commit history](https://github.com/decentralized-identity/identity-hub/commits/master)

------------------------------------

## Abstract

Most activities between people, organizations, devices, and other entities requires 

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

[[def:Hub Instance]]
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
user-controlled, self-sovereign identifier in a target system (i.e. blockchain,
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
    background: hsl(198deg 100% 87%);
  }
  #protocol-stack-styles ~ table tr:nth-child(2) {
    background: hsl(0deg 100% 87%);
  }
  #protocol-stack-styles ~ table tr:nth-child(3) {
    background: hsl(0deg 100% 82%);
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
Interface Definitions |
DID Authentication |
Access & Authorization |
Interface Processing |
Object Format |
Object Encryption |
File Structure |
IPFS |
Database |

::: todo
Finalize the component stack list - are these correct? Are we missing any?
:::

## File Structures

::: todo
**Needs Decision**

Considerations:
- Files accessible to multiple external parties, in multiple overlapping combinations
- Should files be distributed across separate buckets, a shared tree, or something else?
- What kind of pointers are required, if any?
- Is tombstoning required?
:::


## Sync & Replication

::: todo
IPFS can provide this to some extent, but do we need anything in addition to what native IPFS provides?
:::

## Commit Strategies

### Full Replace

::: todo
How is replace handle? Do we allow switching between Commit Strategies for a given object after creation?
:::

### Delta-based Merge

::: todo
We need to pick a standard delta-based CRDT - which one?
:::

## General Object Format

All objects within an Identity Hub Instance ****MUST**** be constructed using the same 
top-level format, as defined below:

### Secure Wrapper

::: todo
Objects need to use a standard means of encryption. Some considerations are:
- Must account for our multi-recipient access requirements
- Try to minimize need for re-encryption when permissions change
:::

### Payload

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "ProfileWrite", // CollectionsWrite, CollectionsQuery, ActionsWrite, etc.
  "data": { ... }
}
```

## Access & Permissions


## Interfaces

### Profile

The Profile interface provides a simple mechanism for setting and retrieving a JSON object 
with basic profile information that describes the target DID entity.

#### Object Format

A compliant Identity Hub Profile interface ****MUST**** produce an object of the following 
structure, if a Profile has been established by the controller of a DID:

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "Profile",
  "primary_descriptor": {
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
  "auxiliary_descriptors": [
    {...},
    {...}
  ]
}
```

#### Write

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "ProfileWrite",
  "data": {
    "@context": "https://identity.foundation/schemas/hub",
    "@type": "Profile",
    "primary_descriptor": {...},
    "auxiliary_descriptors": [...]
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
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "CollectionsQuery",
  "statements": [
    {
      "uri": "https://schema.org/MusicPlaylist"
    }
  ]
}
```

#### Write

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "CollectionsWrite",
  "entries": [
    {
      "create": "https://schema.org/MusicPlaylist",
      "data": {
        // A new entry of the https://schema.org/MusicPlaylist schema
      }
    },
    {
      "modify": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
      "data": {
        // A delta-based modification targeting an existing object's top-level ID
      }
    },
    {
      "create": "https://schema.org/Event",
      "data": {
        // A new entry of the https://schema.org/Event schema
      }
    },
    {
      "replace": "Qm65765jrn7be64v5q35v6we675br68jr",
      "data": {
        // An entire replacement targeting an existing object's top-level ID
      }
    }
  ]
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "CollectionsDelete",
  "targets": [
    "https://schema.org/MusicPlaylist",
    "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
    "https://schema.org/Event",
    "Qm65765jrn7be64v5q35v6we675br68jr"
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
  "@type": "ActionsQuery",
  "statements": [
    {
      "type": "https://schema.org/LikeAction"
    }
  ]
}
```

#### Write

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "ActionsSend",
  "entries": [
    {
      "type": "https://schema.org/LikeAction",
      "data": {
        // A new entry of the https://schema.org/LikeAction schema
      }
    },
    {
      "type": "https://schema.org/FollowAction",
      "data": {
        // A new entry of the https://schema.org/FollowAction schema
      }
    }
  ]
}
```

#### Delete

```json
{
  "@context": "https://identity.foundation/schemas/hub",
  "@type": "ActionsDelete",
  "targets": [
    "https://schema.org/ReadAction",
    "https://schema.org/BefriendAction",
    "Qmf9w548h8sc54p3584h6ow45aa56fvs5",
    "Qm65765jrn7be64v5q35v6we675br68jr"
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
  "@type": "PermissionRequest",
  "entries": [
    {
      "type": "https://schema.org/MusicPlaylist",
      "tags": ["classic rock", "rock", "rock and roll"]
    },
    {
      "id": "Qm09myn76rvs5e4ce4eb57h5bd6sv55v6e",
    },
    {
      "type": "https://schema.org/Event",
      "tags": ["concerts"]
    },
    {
      "id": "Qm65765jrn7be64v5q35v6we675br68jr",
    }
  ]
}
```
