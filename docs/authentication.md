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
    "key": "23fge3fwg34f..."
  },
  "sig": "g34df2hgjh5..."
}
```

Yubi Key factor that requires a second factor, a smart watch:

```json
{
  "factor": {
    "@id": "7e2fg36y3c31",
    "name": "Yubi Key",
    "key": "23fge3fwg34f...",
    "requiredFactors": [
      {
        "@id": "7e2fg36y3c31",
        "name": "Smart Watch",
        "key": "57fta3fwgsd456ferf..."
      {
    ]
  },
  "sig": "g34df2hgjh5..."
}
```

## DID Authentication

// TODO
