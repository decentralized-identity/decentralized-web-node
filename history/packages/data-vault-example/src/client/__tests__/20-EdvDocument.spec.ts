import { getMocks } from '../test-utils/getMocks';

let fastifyServer: any;
let invocationSigner: any;
let keyResolver: any;
let EdvClient: any;
let EdvDocument: any;
let mock: any;

beforeAll(async () => {
  ({
    fastifyServer,
    invocationSigner,
    keyResolver,
    EdvClient,
    EdvDocument,
    mock,
  } = await getMocks());
});

afterAll(async () => {
  fastifyServer.close();
});

describe('EdvDocument', () => {
  it('should read a document using EdvDocument', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1Id = await EdvClient.generateId();
    const doc1 = { id: doc1Id, content: { indexedKey: 'value1' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    const doc = new EdvDocument({
      invocationSigner,
      id: doc1.id,
      keyAgreementKey: client.keyAgreementKey,
      capability: {
        '@context': 'https://w3id.org/security/v2',
        id: `${client.id}/zcaps/documents`,
        invocationTarget: `${client.id}/documents/${doc1.id}`,
        invoker: invocationSigner.id,
        allowedAction: 'read',
      },
    });

    const result = await doc.read();
    expect(result).toBeInstanceOf(Object);
    expect(result.content).toEqual({ indexedKey: 'value1' });
  });
  it('should delete a document using EdvDocument', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1Id = await EdvClient.generateId();
    const doc1 = { id: doc1Id, content: { indexedKey: 'value1' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    const doc = new EdvDocument({
      invocationSigner,
      id: doc1.id,
      keyAgreementKey: client.keyAgreementKey,
      capability: {
        '@context': 'https://w3id.org/security/v2',
        id: `${client.id}/zcaps/documents`,
        invocationTarget: `${client.id}/documents/${doc1.id}`,
        invoker: invocationSigner.id,
        allowedAction: ['read', 'write'],
      },
      keyResolver,
    });
    const docResult = await doc.read();
    let err;
    let result;
    try {
      result = await doc.delete({
        doc: docResult,
        invocationSigner,
        keyResolver,
      });
    } catch (e) {
      err = e;
    }
    expect(result).toBeDefined();
    expect(err).toBeFalsy();
    expect(result).toBe(true);
  });
  it('should throw error if creating EdvDocument without id or capability', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1Id = await EdvClient.generateId();
    const doc1 = { id: doc1Id, content: { indexedKey: 'value1' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    let err;
    let doc;
    try {
      doc = new EdvDocument({
        invocationSigner,
        keyAgreementKey: client.keyAgreementKey,
        keyResolver,
      });
    } catch (e) {
      err = e;
    }
    expect(doc).toBeFalsy();
    expect(err).toBeDefined();
    expect(err.name).toBe('TypeError');
    expect(err.message).toBe('"capability" must be an object.');
  });
  it(
    'edvDocument id should be undefined if created using invalid ' +
      'capabilityTarget.',
    async () => {
      const client = await mock.createEdv();
      client.ensureIndex({ attribute: 'content.indexedKey' });
      const doc1Id = await EdvClient.generateId();
      const doc1 = { id: doc1Id, content: { indexedKey: 'value1' } };
      await client.insert({ doc: doc1, invocationSigner, keyResolver });
      let err;
      let doc;
      try {
        doc = new EdvDocument({
          invocationSigner,
          keyAgreementKey: client.keyAgreementKey,
          capability: {
            id: `${client.id}`,
            invocationTarget: `invalid-invocationTarget`,
          },
          keyResolver,
        });
      } catch (e) {
        err = e;
      }
      expect(err).toBeFalsy();
      expect(doc).toBeDefined();
      expect(doc.id).toBeFalsy();
    }
  );
});
