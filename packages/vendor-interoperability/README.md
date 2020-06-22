# Vendor Interoperability Report

![Vendor Interoperability](https://github.com/decentralized-identity/secure-data-store/workflows/Vendor%20Interoperability/badge.svg)

### Development

```
npm i
npm run test
```

### License Details

The mock interface was adapted for typescript based on [edv-cliient](https://github.com/digitalbazaar/edv-client).

This test suite relies on [edv-client](https://github.com/digitalbazaar/edv-client) for testing the compatibility of vendor implementations of encrypted data vaults.

In the future, it may be desirable to create an independent http test suite, that does not require the use of `edv-client`.
