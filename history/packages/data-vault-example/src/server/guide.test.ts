import * as ed25519 from '@transmute/did-key-ed25519';
// import * as x25519 from '@transmute/did-key-x25519';
import base64url from 'base64url';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

import { getRandomValues } from 'isomorphic-webcrypto';

import path from 'path';
import jsigs from 'jsonld-signatures';

import { CapabilityDelegation } from 'ocapld';

import { documentLoader } from '../client/__fixtures__/documentLoader';
import { getFastify } from './server';
import {
  fixtures,
  CapabilityInvoker,
  KeyAgreementKey,
  Sha256HmacKey2019,
} from '../client';
const {
  sign,
  suites: { Ed25519Signature2018 },
} = jsigs;

const { EdvClient, EdvDocument } = require('edv-client');

let key1: ed25519.Ed25519KeyPair;
let key2: any;
let fastifyServer: any;
let hmac: Sha256HmacKey2019;
let invocationSigner: CapabilityInvoker;
let keyAgreementKey: KeyAgreementKey;
let vault: any;
let keyResolver: any;
let doc1: any;
let doc2: any;
let doc3: any;

function getRandomUint8({ size = 50 } = {}) {
  return new Uint8Array(size).map(() => Math.floor(Math.random() * 255));
}

beforeAll(async () => {
  fastifyServer = await getFastify();
  await fastifyServer.store.resetDatabase();
  await fastifyServer.listen(9876);
  key1 = await ed25519.Ed25519KeyPair.generate({
    secureRandom: () => {
      return base64url.toBuffer(fixtures.client[0].seed);
    },
  });
  key1.id = key1.controller + key1.id;
  invocationSigner = new CapabilityInvoker(key1);
  key2 = await key1.toX25519KeyPair(true);
  key2.id = key2.controller + key2.id;
  keyAgreementKey = new KeyAgreementKey(key2);
  hmac = await Sha256HmacKey2019.create(fixtures.client[0].seed);
  // key resolvers are confusing, and it would be better to use a
  // "did resolver" to avoid injecting more terminology
  keyResolver = async ({ id }: any) => {
    const { document } = await documentLoader(id);
    // beware of relative refs, in did methods that use them.
    // key resolver cannot return relatice refs, or verification will fail.
    const key = document.verificationMethod[1];
    key.id = key.controller + key.id;
    return key;
  };
});

afterAll(async () => {
  fastifyServer.close();
});

it('can create vault', async () => {
  vault = await EdvClient.createEdv({
    url: 'http://localhost:9876/edvs',
    config: {
      sequence: 0,
      controller: key1.controller,
      keyAgreementKey: {
        id: key2.id,
        type: key2.type,
      },
      hmac: { id: hmac.id, type: hmac.type },
      referenceId: 'data-model-guide',
    },
  });
  expect(vault.id).toBeDefined();
});

it('can create documents with indexes', async () => {
  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });
  doc1 = {
    id: await EdvClient.generateId(),
    content: { someKey: 'someValue', indexedKey: 'value1' },
  };
  await client.insert({ doc: doc1, invocationSigner, keyResolver });
  doc2 = {
    id: await EdvClient.generateId(),
    content: { someKey: 'someValue2', indexedKey: 'value1' },
  };
  await client.insert({ doc: doc2, invocationSigner, keyResolver });
  doc3 = {
    id: await EdvClient.generateId(),
    content: { someKey: 'someValue', indexedKey: 'value2' },
  };
  await client.insert({ doc: doc3, invocationSigner, keyResolver });
});

it('can get documents by indexes', async () => {
  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });
  let res = await client.find({
    equals: {
      'content.indexedKey': 'value1',
    },
    invocationSigner,
  });
  expect(res.documents.length).toBe(2);

  res = await client.find({
    equals: {
      'content.indexedKey': 'value2',
    },
    invocationSigner,
  });
  expect(res.documents.length).toBe(1);
});

it('can update doc', async () => {
  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });
  const doc1Updated: any = { id: doc1.id, content: { someKey: 'doc1Updated' } }; //this will destroy the index

  await client.update({ doc: doc1Updated, invocationSigner, keyResolver });
  const decrypted = await client.get({ id: doc1Updated.id, invocationSigner });
  expect(decrypted.content.someKey).toBe('doc1Updated');
});

it('can get documents by indexes but they are destroyed by the previous update', async () => {
  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });
  let res = await client.find({
    equals: {
      'content.indexedKey': 'value1',
    },
    invocationSigner,
  });
  expect(res.documents.length).toBe(0);

  res = await client.find({
    equals: {
      'content.indexedKey': 'value2',
    },
    invocationSigner,
  });
  expect(res.documents.length).toBe(1);
});

it('should insert a document with a stream', async () => {
  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });
  const testId = await EdvClient.generateId();
  const doc = { id: testId, content: { someKey: 'someValue' } };
  const data = getRandomUint8();
  const stream = new ReadableStream({
    pull(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  const inserted = await client.insert({
    keyResolver,
    invocationSigner,
    doc,
    stream,
  });

  const edvDoc = new EdvDocument({
    invocationSigner,
    id: inserted.id,
    keyAgreementKey: client.keyAgreementKey,
    capability: {
      '@context': 'https://w3id.org/security/v2',
      id: `${client.id}/zcaps/documents`,
      invocationTarget: `${client.id}/documents/${doc.id}`,
      invoker: invocationSigner.id,
      allowedAction: ['read', 'write'],
    },
  });
  const result = await edvDoc.read();

  const expectedStream = await edvDoc.getStream({ doc: result });
  const reader = expectedStream.getReader();
  let streamData = new Uint8Array(0);
  let done = false;
  while (!done) {
    // value is either undefined or a Uint8Array
    const { value, done: _done } = await reader.read();
    // if there is a chunk then we need to update the streamData
    if (value) {
      // create a new array with the new length
      const next = new Uint8Array(streamData.length + value.length);
      // set the first values to the existing chunk
      next.set(streamData);
      // set the chunk's values to the rest of the array
      next.set(value, streamData.length);
      // update the streamData
      streamData = next;
    }
    done = _done;
  }
  expect(streamData).toEqual(data);
});

it('can create capability', async () => {
  // create keys for "bob"
  const bobInvocationKey = await ed25519.Ed25519KeyPair.generate({
    secureRandom: () => {
      return Buffer.from(getRandomValues(new Uint8Array(32)));
    },
  });
  const bobKeyAgreementKey = await bobInvocationKey.toX25519KeyPair(true);

  // ensure key id is a full URI.
  bobInvocationKey.id = bobInvocationKey.controller + bobInvocationKey.id;
  bobKeyAgreementKey.id = bobKeyAgreementKey.controller + bobKeyAgreementKey.id;

  const testId = await EdvClient.generateId();
  const doc = { id: testId, content: { someKey: 'someValue' } };

  const recipients = [
    {
      // alice
      header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' },
    },
    {
      header: { kid: bobKeyAgreementKey.id, alg: 'ECDH-ES+A256KW' },
    },
  ];

  const client = new EdvClient({ id: vault.id, keyAgreementKey, hmac });
  client.ensureIndex({ attribute: 'content.indexedKey' });

  // alice saves a document with bob as a recipient.
  const inserted = await client.insert({
    keyResolver,
    invocationSigner,
    doc,
    recipients,
  });

  const aliceGrantsBobCapabilityToRead = {
    '@context': 'https://w3id.org/security/v2',
    id: `urn:uuid:${await EdvClient.generateId()}`,
    invocationTarget: `${client.id}/documents/${inserted.id}`,
    // the invoker is not the creator of the document
    invoker: bobInvocationKey.id,
    // the invoker will only be allowed to read the document
    allowedAction: 'read',
    // this is the zCap of the document
    parentCapability: `${client.id}/zcaps/documents/${inserted.id}`,
  };
  // this is the private key of the EDV owner.
  const signer = invocationSigner;

  const suite = new Ed25519Signature2018({
    signer,
    verificationMethod: signer.id,
  });
  const purpose = new CapabilityDelegation({
    capabilityChain: [aliceGrantsBobCapabilityToRead.parentCapability],
  });
  // sign adds a proof to capabilityToRead
  // mutating function arguments... yuck.
  await sign(aliceGrantsBobCapabilityToRead, {
    documentLoader,
    suite,
    purpose,
  });

  // console.log(aliceGrantsBobCapabilityToRead);

  // FIXME: enableCapability is being deprecated.
  // bob uses delegated capability to read
  await client.enableCapability({
    capabilityToEnable: aliceGrantsBobCapabilityToRead,
    invocationSigner: signer,
  });

  const delegatedDoc = new EdvDocument({
    client,
    // this is the delegated invoker's key
    invocationSigner: new CapabilityInvoker(bobInvocationKey),
    keyResolver,
    // this is the document creator's keyAgreementKey
    keyAgreementKey,
    capability: aliceGrantsBobCapabilityToRead,
  });
  const resultOfDelegatedRead = await delegatedDoc.read();

  expect(resultOfDelegatedRead.content).toEqual(doc.content);

  // expect vault to know about capability because of
  // enableCapability but no way to test.

  // alice revokes delegated capability (that the edv has never seen)
  await client.revokeCapability({
    capabilityToRevoke: aliceGrantsBobCapabilityToRead,
    invocationSigner: invocationSigner,
  });

  // bob tries againt but is rejected because his delegated capability was revoked.
  const delegatedDoc2 = new EdvDocument({
    client,
    // this is the delegated invoker's key
    invocationSigner: new CapabilityInvoker(bobInvocationKey),
    keyResolver,
    // this is the document creator's keyAgreementKey
    keyAgreementKey,
    capability: aliceGrantsBobCapabilityToRead,
  });
  await expect(delegatedDoc2.read()).rejects.toThrowError(
    'capability invocation verification failed'
  );
});

// this is for the sake of exploring the data model
it('can save database to filesystem', async () => {
  const rootDirectory = path.join(__dirname, '../../../..');
  await fastifyServer.storeToFs(
    fastifyServer.store,
    rootDirectory,
    'https://identity.foundation/confidential-storage/'
  );
});
