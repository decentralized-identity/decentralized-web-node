const base64url = require('base64url');

const ed25519 = require('@transmute/did-key-ed25519');

const {
  CapabilityInvoker,
  KeyAgreementKey,
  Sha256HmacKey2019,
  fixtures,
} = require('../dist');

const { EdvClient } = require('edv-client');

const baseUrl = 'http://localhost:8080/edvs';

const getKeys = async () => {
  const key1 = await ed25519.Ed25519KeyPair.generate({
    secureRandom: () => {
      return base64url.toBuffer(fixtures.client[0].seed);
    },
  });
  key1.id = key1.controller + key1.id;

  const key2 = await key1.toX25519KeyPair(true);
  key2.id = key2.controller + key2.id;

  // create KAK and HMAC keys for creating edvs
  // the creates the same hmac for each test.
  const hmac = await Sha256HmacKey2019.create(fixtures.client[0].seed);

  // this creates the same keyAgreementKey for each test.
  const keyAgreementKey = new KeyAgreementKey(key2);
  const invocationSigner = new CapabilityInvoker(key1);

  // key resolvers are confusing, and it would be better to use a
  // "did resolver" to avoid injecting more terminology
  const keyResolver = async ({ id }) => {
    const { didDocument } = await ed25519.driver.resolve(id, {
      accept: 'application/did+ld+json',
    });
    // beware of relative refs, in did methods that use them.
    // key resolver cannot return relatice refs, or verification will fail.
    const key = didDocument.verificationMethod[1];
    key.id = key.controller + key.id;
    return key;
  };
  return { key1, key2, hmac, keyAgreementKey, invocationSigner, keyResolver };
};
const getClient = async () => {
  const { key1, keyAgreementKey, hmac } = await getKeys();
  try {
    let config = {
      sequence: 0,
      controller: key1.controller,
      keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
      hmac: { id: hmac.id, type: hmac.type },
      referenceId: 'edv-cli',
    };
    config = await EdvClient.createEdv({
      config,
      url: baseUrl,
    });
    // console.log(config);
    return new EdvClient({ id: config.id, keyAgreementKey, hmac });
  } catch (e) {
    if (e.status === 409) {
      const config = await EdvClient.findConfig({
        controller: key1.controller,
        referenceId: 'edv-cli',
        url: baseUrl,
      });
      // console.log(config);
      return new EdvClient({ id: config.id, keyAgreementKey, hmac });
    }
  }
};

const createDocument = async client => {
  const { invocationSigner, keyResolver } = await getKeys();
  const testId = await EdvClient.generateId();
  const doc = { id: testId, content: { someKey: 'someValue' } };

  const inserted = await client.insert({
    keyResolver,
    invocationSigner,
    doc,
  });
  return inserted;
};

module.exports = { getClient, createDocument };
