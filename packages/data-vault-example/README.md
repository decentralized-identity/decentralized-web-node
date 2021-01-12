# data-vault-example

An encrypted data vault server (NOT FOR PRODUCTION) implementation.

This code has been optimized for comprehension, not performance.

Indexing is handled inefficiently, intentionally to make it easier to explain without discussing specific databases like mongodb.

### Getting Started

Start the server:

```
npm run docker:start:dev
```

Use the cli to create a document

```
npm run edv documents create
```

### Development

```
npm i
npm run test
```
