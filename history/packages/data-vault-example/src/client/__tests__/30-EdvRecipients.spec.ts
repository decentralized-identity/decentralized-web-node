/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
import jsigs from 'jsonld-signatures';

import { CapabilityDelegation } from 'ocapld';

import { getMocks } from '../test-utils/getMocks';

let fastifyServer: any;
let invocationSigner: any;
let keyResolver: any;
let isRecipient: any;
let createRecipient: any;
let EdvClient: any;
let EdvDocument: any;
let mock: any;

beforeAll(async () => {
  ({
    fastifyServer,
    invocationSigner,
    keyResolver,
    isRecipient,
    createRecipient,
    EdvClient,
    EdvDocument,
    mock,
  } = await getMocks());
});

afterAll(async () => {
  fastifyServer.close();
});

const { SECURITY_CONTEXT_V2_URL, sign, suites } = jsigs;
const { Ed25519Signature2018 } = suites;

describe('EDV Recipients', () => {
  // this test should be identical to the insert test
  // except that recipients is passed in
  it('should insert a document with a single recipient', async () => {
    const { keyAgreementKey } = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const recipients = [
      { header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' } },
    ];
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
      recipients,
    });
    expect(inserted).toBeDefined();
    expect(inserted).toBeInstanceOf(Object);
    expect(inserted.id).toBe(testId);
    expect(inserted.sequence).toBe(0);
    expect(inserted.indexed).toBeInstanceOf(Array);
    expect(inserted.indexed.length).toBe(1);
    expect(inserted.indexed[0]).toBeInstanceOf(Object);
    expect(inserted.indexed[0].sequence).toBe(0);
    expect(inserted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(inserted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(inserted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(inserted.jwe).toBeInstanceOf(Object);
    expect(inserted.jwe.protected).toBeDefined();
    expect(inserted.jwe.recipients).toBeInstanceOf(Array);
    expect(inserted.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: inserted.jwe.recipients[0] });
    expect(inserted.jwe.iv).toBeDefined();
    expect(inserted.jwe.ciphertext).toBeDefined();
    expect(inserted.jwe.tag).toBeDefined();
    expect(inserted.content).toEqual({ someKey: 'someValue' });
  });

  it('should insert a document with 5 recipients', async () => {
    const { keyAgreementKey } = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    // create the did keys then the recipients
    const recipients: any = (
      await Promise.all([1, 2, 3, 4].map(() => mock.createKeyAgreementKey()))
    ).map(createRecipient);
    // note: when passing recipients it is important to remember
    // to pass in the document creator. EdvClient will use the
    // EdvOwner by default as a recipient if there are no recipients
    // being passed in, but will not if you explicitly pass in recipients.
    recipients.unshift({
      header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' },
    });
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
      recipients,
    });
    expect(inserted).toBeDefined();
    expect(inserted).toBeInstanceOf(Object);
    expect(inserted.id).toBe(testId);
    expect(inserted.sequence).toBe(0);
    expect(inserted.indexed).toBeInstanceOf(Array);
    expect(inserted.indexed.length).toBe(1);
    expect(inserted.indexed[0]).toBeInstanceOf(Object);
    expect(inserted.indexed[0].sequence).toBe(0);
    expect(inserted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(inserted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(inserted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(inserted.jwe).toBeInstanceOf(Object);
    expect(inserted.jwe.protected).toBeDefined();
    expect(inserted.jwe.recipients).toBeInstanceOf(Array);
    // we should have 5 recipients including the EDV owner.
    expect(inserted.jwe.recipients.length).toBe(5);
    expect(inserted.jwe.iv).toBeDefined();
    expect(inserted.jwe.ciphertext).toBeDefined();
    expect(inserted.jwe.tag).toBeDefined();
    expect(inserted.content).toEqual({ someKey: 'someValue' });
    inserted.jwe.recipients.forEach((recipient: any, index: any) => {
      const expected: any = recipients[index].header;
      // the curve should be a 25519 curve
      expected.crv = 'X25519';
      // key type should be an Octet Key Pair
      expected.kty = 'OKP';
      isRecipient({ recipient, expected });
    });
  });

  it('should enable a capability for a recipient', async () => {
    const { keyAgreementKey } = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const didKeys = [await mock.createKeyAgreementKey()];
    const recipients: any = didKeys.map(createRecipient);
    // note: when passing recipients it is important to remember
    // to pass in the document creator. EdvClient will use the
    // EdvOwner by default as a recipient if there are no recipients
    // being passed in, but will not if you explicitly pass in recipients.
    recipients.unshift({
      header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' },
    });
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
      recipients,
    });
    expect(inserted).toBeDefined();
    expect(inserted).toBeInstanceOf(Object);
    expect(inserted.id).toBe(testId);
    expect(inserted.sequence).toBe(0);
    expect(inserted.indexed).toBeInstanceOf(Array);
    expect(inserted.indexed.length).toBe(1);
    expect(inserted.indexed[0]).toBeInstanceOf(Object);
    expect(inserted.indexed[0].sequence).toBe(0);
    expect(inserted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(inserted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(inserted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(inserted.jwe).toBeInstanceOf(Object);
    expect(inserted.jwe.protected).toBeDefined();
    expect(inserted.jwe.recipients).toBeInstanceOf(Array);
    // we should have 2 recipients including the EDV owner.
    expect(inserted.jwe.recipients.length).toBe(2);
    expect(inserted.jwe.iv).toBeDefined();
    expect(inserted.jwe.ciphertext).toBeDefined();
    expect(inserted.jwe.tag).toBeDefined();
    expect(inserted.content).toEqual({ someKey: 'someValue' });
    inserted.jwe.recipients.forEach((recipient: any, index: any) => {
      const expected: any = recipients[index].header;
      // the curve should a 25519 curve
      expected.crv = 'X25519';
      // key type should be Octet Key Pair
      expected.kty = 'OKP';
      // recipient should be JOSE
      // @see https://tools.ietf.org/html/rfc8037
      isRecipient({ recipient, expected });
    });
    const unsignedCapability = {
      '@context': SECURITY_CONTEXT_V2_URL,
      id: `urn:uuid:${await EdvClient.generateId()}`,
      invocationTarget: `${client.id}/documents/${inserted.id}`,
      // the invoker is not the creator of the document
      invoker: didKeys[0].id,
      // the invoker will only be allowed to read the document
      allowedAction: 'read',
      // this is the zCap of the document
      parentCapability: `${client.id}/zcaps/documents/${inserted.id}`,
    };
    // this is a little confusing but this is the private key
    // of the EDV owner.
    const signer = mock.invocationSigner;
    const { documentLoader } = mock;
    const suite = new Ed25519Signature2018({
      signer,
      verificationMethod: signer.id,
    });
    const purpose = new CapabilityDelegation({
      capabilityChain: [unsignedCapability.parentCapability],
    });
    const capabilityToEnable = await sign(unsignedCapability, {
      documentLoader,
      suite,
      purpose,
    });
    // FIXME: enableCapability is being deprecated.
    await client.enableCapability({
      capabilityToEnable,
      invocationSigner: signer,
    });
  });

  it('should read a document using a delegated capability', async () => {
    const { keyAgreementKey } = mock.keys;
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const { capabilityAgent, didKey } = await mock.createCapabilityAgent();
    const recipients = [
      { header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' } },
      createRecipient(didKey),
    ];
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
      recipients,
    });
    expect(inserted).toBeDefined();
    expect(inserted).toBeInstanceOf(Object);
    expect(inserted.id).toBe(testId);
    expect(inserted.sequence).toBe(0);
    expect(inserted.indexed).toBeInstanceOf(Array);
    expect(inserted.indexed.length).toBe(1);
    expect(inserted.indexed[0]).toBeInstanceOf(Object);
    expect(inserted.indexed[0].sequence).toBe(0);
    expect(inserted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(inserted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(inserted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(inserted.jwe).toBeInstanceOf(Object);
    expect(inserted.jwe.protected).toBeDefined();
    expect(inserted.jwe.recipients).toBeInstanceOf(Array);
    // we should have 2 recipients including the EDV owner.
    expect(inserted.jwe.recipients.length).toBe(2);
    expect(inserted.jwe.iv).toBeDefined();
    expect(inserted.jwe.ciphertext).toBeDefined();
    expect(inserted.jwe.tag).toBeDefined();
    expect(inserted.content).toEqual({ someKey: 'someValue' });
    inserted.jwe.recipients.forEach((recipient: any, index: any) => {
      const expected: any = recipients[index].header;
      // the curve should be a 25519 curve
      expected.crv = 'X25519';
      // key type should be an Octet Key Pair
      expected.kty = 'OKP';
      isRecipient({ recipient, expected });
    });
    const unsignedCapability = {
      '@context': SECURITY_CONTEXT_V2_URL,
      id: `urn:uuid:${await EdvClient.generateId()}`,
      invocationTarget: `${client.id}/documents/${inserted.id}`,
      // the invoker is not the creator of the document
      invoker: capabilityAgent.id,
      // the invoker will only be allowed to read the document
      allowedAction: 'read',
      // this is the zCap of the document
      parentCapability: `${client.id}/zcaps/documents/${inserted.id}`,
    };

    // this is a little confusing but this is the private key
    // of the user that created the document.
    const signer = mock.invocationSigner;
    const { documentLoader } = mock;
    const suite = new Ed25519Signature2018({
      signer,
      verificationMethod: signer.id,
    });
    const purpose = new CapabilityDelegation({
      capabilityChain: [unsignedCapability.parentCapability],
    });
    const capabilityToEnable = await sign(unsignedCapability, {
      documentLoader,
      suite,
      purpose,
    });
    // FIXME: enableCapability is being deprecated.
    await client.enableCapability({
      capabilityToEnable,
      invocationSigner: signer,
    });
    const delegatedDoc = new EdvDocument({
      client,
      // this is the delegated invoker's key
      invocationSigner: capabilityAgent,
      keyResolver: mock.keyResolver,
      // this is the document creator's keyAgreementKey
      keyAgreementKey,
      capability: capabilityToEnable,
    });
    const delegatedEDV = await delegatedDoc.read();
    expect(delegatedEDV).toBeDefined();
    expect(delegatedEDV).toBeInstanceOf(Object);
    expect(delegatedEDV.content).toBeDefined();
    expect(delegatedEDV.content).toEqual(inserted.content);
  });
});
