/*!
 * Copyright (c) 2018-2020 Digital Bazaar, Inc. All rights reserved.
 */
import jsigs from 'jsonld-signatures';

import { CapabilityDelegation } from 'ocapld';

import { getMocks } from '../test-utils/getMocks';

const {
  SECURITY_CONTEXT_V2_URL,
  sign,
  suites: { Ed25519Signature2018 },
} = jsigs;

let fastifyServer: any;
let invocationSigner: any;
let keyResolver: any;
let createRecipient: any;
let EdvClient: any;
let mock: any;

beforeAll(async () => {
  ({
    fastifyServer,
    invocationSigner,
    keyResolver,
    EdvClient,
    mock,
    createRecipient,
  } = await getMocks());
});

afterAll(async () => {
  fastifyServer.close();
});

let capabilityToRead: any;
let edvClient: any;

describe('EdvClient revokeCapability API', () => {
  // create a delegated capability to read a document
  beforeAll(async () => {
    const { keyAgreementKey } = mock.keys;
    edvClient = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const didKeys = [await mock.createKeyAgreementKey()];
    const recipients = didKeys.map(createRecipient);
    recipients.unshift({
      header: { kid: keyAgreementKey.id, alg: 'ECDH-ES+A256KW' },
    });

    const inserted = await edvClient.insert({
      keyResolver,
      invocationSigner,
      doc,
      recipients,
    });

    capabilityToRead = {
      '@context': SECURITY_CONTEXT_V2_URL,
      id: `urn:uuid:${await EdvClient.generateId()}`,
      invocationTarget: `${edvClient.id}/documents/${inserted.id}`,
      // the invoker is not the creator of the document
      invoker: didKeys[0].id,
      // the invoker will only be allowed to read the document
      allowedAction: 'read',
      // this is the zCap of the document
      parentCapability: `${edvClient.id}/zcaps/documents/${inserted.id}`,
    };
    // this is the private key of the EDV owner.
    const signer = mock.invocationSigner;
    const { documentLoader } = mock;
    const suite = new Ed25519Signature2018({
      signer,
      verificationMethod: signer.id,
    });
    const purpose = new CapabilityDelegation({
      capabilityChain: [capabilityToRead.parentCapability],
    });
    // sign adds a proof to capabilityToRead
    await sign(capabilityToRead, { documentLoader, suite, purpose });
  });

  it('returns TypeError on missing capabilityToRevoke param', async () => {
    let err;
    let result;
    try {
      result = await edvClient.revokeCapability({});
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(result).toBeFalsy();
    expect(err.name).toBe('TypeError');
    expect(err.message).toEqual('capabilityToRevoke');
  });
  it('returns TypeError on missing invocationSigner param', async () => {
    let err;
    let result;
    try {
      result = await edvClient.revokeCapability({
        capabilityToRevoke: capabilityToRead,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(result).toBeFalsy();
    expect(err.name).toBe('TypeError');
    expect(err.message).toEqual('invocationSigner');
  });
  it('should revoke a delegated capability', async () => {
    let err;
    let result;
    try {
      result = await edvClient.revokeCapability({
        capabilityToRevoke: capabilityToRead,
        invocationSigner: mock.invocationSigner,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeFalsy();
    expect(result).toBeFalsy();
  });
});
