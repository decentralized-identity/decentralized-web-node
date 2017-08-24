# Hub Authentication System

[Back to Explainer](../explainer.md)

## Overview
There are two mechanisms for authentication to a hub:
 - The hub operator (i.e. the identity owner) authenticates by signing each request with a private key associated with one or more of their [Factors](#factor-authentication).
 - Other actors sign requests using the key material required to satisfy the control block from the DDO associated with their [DID](#did-authentication).

## Factors

`/.identity/:id/factors`

Factors are connected devices, dongles, and other items that are granted sudo-esque permission to act as an extension of the owning entity, via an association payload signed by the owning identity.

### Examples

Personal laptop factor:

```json
{
  "factor": {
    "@id": "7e2fg36y3c31",
    "name": "Home Laptop",
    "key": "23fge3fwg34fwe..."
  },
  "sig": "g34df2hgjh5fd..."
}
```

Laptop as a factor that requires a second factor, either a smart watch or a Yubi Key:

```json

{
  "factor": {
    "@id": "7e2fg36y3c31",
    "sign": true,
    "name": "Home Laptop",
    "key": "23fge3fwg34fwe...",
    "multiFactor": {
      "require": 1,
      "factors": ["w2v34n5436nkl5", "8sd7fabh3q23b4"]
    }
  },
  "sig": "g34df2hgjh5fd..."
},
{
  "factor": {
    "@id": "w2v34n5436nkl5",
    "name": "Smart Watch",
    "key": "57ffwgsd46ferf..."
  },
  "sig": "34n5l34nj5vv7l..."
},
{
  "factor": {
    "@id": "8sd7fabh3q23b4",
    "name": "Yubi Key",
    "key": "m3er87nv4d3n12..."
  },
  "sig": "3sdf4n76bj5vgl..."
}

```

## DID Authentication

// TODO
