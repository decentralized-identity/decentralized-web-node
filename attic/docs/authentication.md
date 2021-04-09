# Hub Authentication

[Back to Explainer](../explainer.md)

The current Identity Hub authentication scheme seeks to accomplish two tasks:

- mutually authenticate the client and the Hub using each's respective DID and associated keys.
- encrypt all Hub requests and responses such that their contents are only available to the holders of the DID keys involved in the message exchange.

The current authentication scheme is an implementation of DID Auth, [as described here](https://gitHub.com/WebOfTrustInfo/rwot6-santabarbara/blob/master/final-documents/did-auth.md). This document will outline how to authenticate Hub requests and responses. For full details on the authentication protocol used, and for a reference implementation of the protocol, please refer to the [`did-auth-jose` library](https://gitHub.com/decentralized-identity/did-auth-jose/blob/master/docs/Authentication.md). 

## Authenticating a Hub request

Identity Hub requests and responses are signed and encrypted using the DID keys of the sender and the recipient. This protects the message over any transportation medium. All encrypted requests and responses follow the [JSON Web Encryption (JWE) standard](https://tools.ietf.org/html/rfc7516).

The steps to construct a JWE are as follows. First, construct a JWT. This JWT will be signed by the sender of the Hub request; the `iss`. This JWT must have the following form:

```json
// JWT headers
{
  "alg": "RS256",
  "kid": "did:example:abc123#key-abc",
  "did-requester-nonce": "randomized-string",
  "did-access-token": "eyJhbGciOiJSUzI1N...",
}

// JWT body
{
  "@context": "https://schema.identity.foundation/0.1",
  "@type": "WriteRequest",
  "iss": "did:example:abc123",
  ...
}

// JWT signature
uQRqsaky-SeP3m9QPZmTGtRtMoKzyg6wwWF...
```

The JWT body is just the request whose format is outlined in the [explainer document](../explainer.md). The header values must be the following:

| Header | Description |
| ------ | ----------- |
| `alg`    | Standard JWT header. Indicates the algorithm used to sign the JWT. |
| `kid`    | Standard JWT header. The value should take the form `{did}#{key-id}`. Another app can take this value, resolve the DID, and find the indicated public key that can be used for signature validation of the commit. Here we have used `did:example:abc123`, because the request is signed with the user's private key. |
| `did-requester-nonce` | A randomly generated string that must be cached on the client side. This string will be used to verify the response from the Hub in the sections below. |
| `did-access-token` | A token that should be cached on the client side and included in each request sent to the Hub. Since we do not have an access token yet, leave this property out on the initial request. Sections below explain how to get an access token. |

This JWT must use the typical JWT compact serialization format.

We can now use this JWT as the plaintext used to construct our JWE. The JWE must have the following format. 

```json
// JWE protected header
{
  "alg": "RSA-OAEP-256",
  "kid": "did:example:abc456#abc-123",
  "enc": "A128GCM",
}

// JWE encrypted content encryption key
OKOawDo13gRp2ojaHV7LFpZcgV7T6DVZKTyKOM...

// JWE initialization vector
48V1_ALb6US04U3b...

// JWE plaintext (the JWT from above)
eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3R...

// JWE authentication tag
XFBoMYUZodetZdv...
```

We strongly reccommend using a JWT library to produce the above JWE. Using a library, you should only need to provide the protected headers and the plaintext. The plaintext value should be the JWT constructed above. The header values are:

| Header | Description |
| ------ | ----------- |
| `alg`    | Standard JWT header. Indicates the algorithm used to encrypt the JWE content encryption key. |
| `kid`    | Standard JWT header. The value should take the form `{did}#{key-id}`. Indicates the Hub's key that is used to encrypt the JWE content encryption key. Here we have used `did:example:abc456`, since that is the DID used by the Hub. The DID used here should match the `aud` value in the Hub `WriteRequest`. |
| `enc` | Standard JWT header. Indicates the algorithm used to encrypt the plaintext using the content encryption key to produce the ciphertext and authentication tag. |

Finally, you have a signed and encrypted Hub request that can be transmitted to the user's Identity Hub for secure storage. 

## Caching the access token

To send a successful request to an Identity Hub, you need to include an access token in the `did-access-token` header of the JWE. The access token is a short-lived JWT that can be used across many Hub requests until it expires.

On an initial request to an Identity Hub, you should exclude the `did-access-token` header. When a Hub request does not include this header, the Hub will reject the request. Instead, the Hub will return a JWE response (as described in the next section) whose payload is an access token. You should extract the access token from the response and cache it somewhere safe. The access token can be used for subsequent requests.

Once you've cached the access token, include it in each request in the `did-access-token` JWE header as described above. 

Eventually, the access token will expire. Its expiry time can be found in the `exp` claim inside the access token. If you attempt to use an expired access token, the Identity Hub will return an error indicating a new access token is required. To get a new access token, send another hub request without the `did-access-token` header.

## Receiving a hub response

When possible, a hub will respond with a JWE encrypted with the client's DID keys:

```
eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...
```

This JWE can be decrypted with the client's private key following the JWE standard to reproduce the response's plaintext.

The contents of the JWE will either be a valid hub response or a new access token. A new access token will only be included if the `did-access-token` header was omitted in the request. The Hub response format is described in the [explainer document](../explainer.md).