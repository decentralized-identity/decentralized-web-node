# Hub Authentication System

[Back to Explainer](../explainer.md)

## Overview
There are two mechanisms for authentication to a hub:
 - The hub operator (i.e. the identity owner) authenticates by signing each request with a private key associated with one or more of their [Factors](#factor-authentication).
 - Other actors sign requests using the key material required to satisfy the control block from the DDO associated with their [DID](#did-authentication).

## Factor Authentication

`/.identity/:id/factors`*

This route represents the enteries for devices and other auth factors an entity associates with to enable them to sign, authenticate, and manipulate resources.

An example entry for a personal laptop:

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

A dongle-type factor example:

```json
{
  "factor": {
    "@id": "36y3c317e2fg",
    "name": "My Yubikey",
    "key": "fge3f23wg34f..."
  },
  "sig": "65dfjkh32g3..."
}
```

## DID Authentication

// TODO
