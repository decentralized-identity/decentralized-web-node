/*!
 * Copyright (c) 2018-2020 Digital Bazaar, Inc. All rights reserved.
 */

import { ReadableStream } from 'web-streams-polyfill/ponyfill';

import { getMocks } from '../test-utils/getMocks';

let fastifyServer: any;
let invocationSigner: any;
let keyResolver: any;
let isRecipient: any;
let isNewEDV: any;
let EdvClient: any;
let EdvDocument: any;
let mock: any;

beforeAll(async () => {
  ({
    fastifyServer,
    invocationSigner,
    keyResolver,
    isRecipient,
    isRecipient,
    isNewEDV,
    EdvClient,
    EdvDocument,
    mock,
  } = await getMocks());
});

afterAll(async () => {
  fastifyServer.close();
});

jest.setTimeout(40 * 1000);

function getRandomUint8({ size = 50 } = {}) {
  return new Uint8Array(size).map(() => Math.floor(Math.random() * 255));
}

describe('EDV Stream Tests', () => {
  it('should insert a document with a stream', async () => {
    const client = await mock.createEdv();
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
    const hmac = {
      id: client.hmac.id,
      type: client.hmac.type,
    };

    // Streams are added in an update
    // after the initial document has been written
    // hence the sequence is 1 and not 0.
    isNewEDV({ hmac, inserted, testId, sequence: 1 });
    isRecipient({ recipient: inserted.jwe.recipients[0] });
    expect(inserted.content).toEqual({ someKey: 'someValue' });
    expect(inserted.stream).toBeDefined();
    expect(inserted.stream).toEqual({ chunks: 1, sequence: 0 });
  });

  it('should be able to decrypt a stream from an EdvDocument', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { indexedKey: 'value1' } };
    const data = getRandomUint8();
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
    await client.insert({ doc, stream, invocationSigner, keyResolver });
    const edvDoc = new EdvDocument({
      invocationSigner,
      id: doc.id,
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
    expect(result).toBeInstanceOf(Object);
    expect(result.content).toEqual({ indexedKey: 'value1' });
    expect(result.stream).toBeDefined();
    expect(result.stream).toBeInstanceOf(Object);
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
  });
  it('should be able to write a stream to an EdvDocument', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const docId = await EdvClient.generateId();
    const doc = { id: docId, content: { indexedKey: 'value2' } };
    await client.insert({ doc, invocationSigner, keyResolver });
    const edvDoc = new EdvDocument({
      invocationSigner,
      id: doc.id,
      keyAgreementKey: client.keyAgreementKey,
      capability: {
        '@context': 'https://w3id.org/security/v2',
        id: `${client.id}/zcaps/documents`,
        invocationTarget: `${client.id}/documents/${doc.id}`,
        invoker: invocationSigner.id,
        allowedAction: ['read', 'write'],
      },
    });
    const data = getRandomUint8();
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
    const result = await edvDoc.write({
      doc,
      stream,
      invocationSigner,
      keyResolver,
    });
    expect(result).toBeInstanceOf(Object);
    expect(result.content).toEqual({ indexedKey: 'value2' });
    expect(result.stream).toBeDefined();
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
  });
  // failing due to https://github.com/digitalbazaar/edv-client/issues/82
  it.skip('should throw error if document chunk does not exist', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const docId = await EdvClient.generateId();
    const doc = { id: docId, content: { indexedKey: 'value3' } };
    const data = getRandomUint8();
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
    await client.insert({ doc, invocationSigner, keyResolver, stream });
    const edvDoc = new EdvDocument({
      invocationSigner,
      id: doc.id,
      keyAgreementKey: client.keyAgreementKey,
      capability: {
        id: `${client.id}`,
        invocationTarget: `${client.id}/documents/${doc.id}`,
      },
    });
    const result = await edvDoc.read();

    expect(result).toBeInstanceOf(Object);
    expect(result.content).toEqual({ indexedKey: 'value3' });
    expect(result.stream).toBeDefined();
    expect(result.stream).toBeInstanceOf(Object);
    const expectedStream = await edvDoc.getStream({ doc: result });
    const reader = expectedStream.getReader();
    // intentionally clear the database for chunks
    fastifyServer.storage.chunks.clear();
    // console.log(edvStorage.chunks);
    // console.log(result);

    // console.log(reader);
    // let streamData = new Uint8Array(0);

    let err;
    try {
      await reader.read();
    } catch (e) {
      console.log('stuck', e);
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('NotFoundError');
    expect(err.message).toBe('Document chunk not found.');
  });
});
