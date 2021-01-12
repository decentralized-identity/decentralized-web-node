import { getMocks } from '../test-utils/getMocks';

let fastifyServer: any;
let invocationSigner: any;
let keyResolver: any;
let isRecipient: any;
let EdvClient: any;
let mock: any;

beforeAll(async () => {
  ({
    fastifyServer,
    invocationSigner,
    keyResolver,
    isRecipient,
    EdvClient,
    mock,
  } = await getMocks());
});

afterAll(async () => {
  fastifyServer.close();
});

describe('EdvClient', () => {
  it('should throw an error when config is invalid', async () => {
    let result;
    let err;
    try {
      result = await EdvClient.createEdv({
        url: 'http://localhost:9876/edvs',
        config: {
          sequence: 0,
          controller: mock.accountId,
          // intentionally adding an invalid property to the config.
          invalid: 'invalid',
        },
      });
    } catch (e) {
      err = e;
    }
    expect(result).toBeFalsy();
    expect(err).toBeDefined();
    expect(err.message).toBe('Validation error.');
  });

  it('should find document by index after updates', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = {
      id: testId,
      content: { someKey: '111111', indexedKey: 'value1' },
    };
    let version1 = await client.insert({
      doc,
      invocationSigner,
      keyResolver,
    });
    version1 = await client.get({ id: doc.id, invocationSigner });

    await client.update({
      doc: {
        ...version1,
        content: {
          ...version1.content,
          someKey: '22222',
        },
      },
      invocationSigner,
      keyResolver,
    });
    const version2 = await client.get({ id: doc.id, invocationSigner });
    await client.update({
      doc: {
        ...version2,
        content: {
          ...version2.content,
          someKey: '33333',
        },
      },
      invocationSigner,
      keyResolver,
    });

    const { documents: docs } = await client.find({
      has: 'content.indexedKey',
      invocationSigner,
    });

    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(1);
  });

  it('find a document using a multi property query', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.someKey' });

    const testId = await EdvClient.generateId();
    const doc = {
      id: testId,
      content: {
        someKey: {
          b: 5,
          a: 4,
        },
      },
    };

    await client.insert({
      doc,
      invocationSigner,
      keyResolver,
    });

    // it should find the document when property keys are in same order.
    const { documents: docs } = await client.find({
      equals: {
        'content.someKey': {
          b: 5,
          a: 4,
        },
      },
      invocationSigner,
    });

    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(1);

    // it should find the document when property keys are in a different order.
    const { documents: docs2 } = await client.find({
      equals: {
        'content.someKey': {
          a: 4,
          b: 5,
        },
      },
      invocationSigner,
    });

    expect(docs2).toBeInstanceOf(Array);
    expect(docs2.length).toBe(1);

    // no results when attempting to find a document when
    // property keys have values that do not match the stored document.
    const { documents: docs3 } = await client.find({
      equals: {
        'content.someKey': {
          b: 11111,
          a: 22222,
        },
      },
      invocationSigner,
    });

    expect(docs3).toBeInstanceOf(Array);
    expect(docs3.length).toBe(0);
  });

  it('should not find document by index after update', async () => {
    const { keyAgreementKey, hmac } = mock.keys;
    const config = await EdvClient.createEdv({
      url: 'http://localhost:9876/edvs',
      config: {
        sequence: 0,
        controller: mock.accountId,
        keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
        hmac: { id: hmac.id, type: hmac.type },
        referenceId: 'web',
      },
    });
    const client = new EdvClient({ id: config.id, keyAgreementKey, hmac });
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = {
      id: testId,
      content: { someKey: 'someValue', indexedKey: 'value1' },
    };
    const version1 = await client.insert({
      doc,
      invocationSigner,
      keyResolver,
    });
    // the content no longer has the indexed property.
    version1.content = { someKey: 'aNewValue' };
    await client.update({ doc: version1, invocationSigner, keyResolver });
    const { documents: docs } = await client.find({
      has: 'content.indexedKey',
      invocationSigner,
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(0);
  });

  it('should create a new encrypted data vault', async () => {
    const { keyAgreementKey, hmac } = mock.keys;
    const config = await EdvClient.createEdv({
      url: 'http://localhost:9876/edvs',
      config: {
        sequence: 0,
        controller: mock.accountId,
        keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
        hmac: { id: hmac.id, type: hmac.type },
      },
    });
    expect(config).toBeInstanceOf(Object);
    expect(config.id).toBeDefined();
    expect(config.controller).toBe(mock.accountId);
    expect(config.keyAgreementKey).toBeInstanceOf(Object);
    expect(config.hmac).toBeInstanceOf(Object);
  });

  it('should get an encrypted data vault config', async () => {
    const { keyAgreementKey, hmac } = mock.keys;
    const { id } = await EdvClient.createEdv({
      url: 'http://localhost:9876/edvs',
      config: {
        sequence: 0,
        controller: mock.accountId,
        keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
        hmac: { id: hmac.id, type: hmac.type },
      },
    });
    const config = await EdvClient.getConfig({ id });
    expect(config).toBeInstanceOf(Object);
    expect(config.id).toBeDefined();
    expect(config.controller).toBe(mock.accountId);
    expect(config.keyAgreementKey).toBeInstanceOf(Object);
    expect(config.hmac).toBeInstanceOf(Object);
  });

  it('should create "primary" encrypted data vault', async () => {
    const { keyAgreementKey, hmac } = mock.keys;
    const config = await EdvClient.createEdv({
      url: 'http://localhost:9876/edvs',
      config: {
        sequence: 0,
        controller: mock.accountId,
        keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
        hmac: { id: hmac.id, type: hmac.type },
        referenceId: 'primary',
      },
    });
    expect(config).toBeInstanceOf(Object);
    expect(config.id).toBeDefined();
    expect(config.controller).toBe(mock.accountId);
    expect(config.keyAgreementKey).toBeInstanceOf(Object);
    expect(config.hmac).toBeInstanceOf(Object);
  });

  it('should get "primary" encrypted data vault', async () => {
    const { keyAgreementKey, hmac } = mock.keys;
    // note: Tests should run in isolation however this will return 409
    // DuplicateError when running in a suite.
    try {
      await EdvClient.createEdv({
        url: 'http://localhost:9876/edvs',
        config: {
          sequence: 0,
          controller: invocationSigner.id,
          keyAgreementKey: {
            id: keyAgreementKey.id,
            type: keyAgreementKey.type,
          },
          hmac: { id: hmac.id, type: hmac.type },
          referenceId: 'primary',
        },
      });
    } catch (e) {
      // do nothing we just need to ensure that primary edv was created.
    }
    const config = await EdvClient.findConfig({
      controller: mock.accountId,
      referenceId: 'primary',
      url: 'http://localhost:9876/edvs',
    });
    expect(config).toBeInstanceOf(Object);
    expect(config.id).toBeDefined();
    expect(config.controller).toBe(mock.accountId);
    expect(config.keyAgreementKey).toBeInstanceOf(Object);
    expect(config.hmac).toBeInstanceOf(Object);
  });

  // TODO: add more tests: getAll, update, setStatus

  it('should ensure two new indexes', async () => {
    const client = await mock.createEdv();
    const { indexHelper } = client;
    const indexCount = indexHelper.indexes.size;
    client.ensureIndex({ attribute: ['content', 'content.index1'] });
    expect(indexHelper.indexes).toBeDefined();
    expect(indexHelper.indexes.size).toBe(indexCount + 2);
    expect(indexHelper.indexes.has('content')).toBe(true);
    expect(indexHelper.indexes.has('content.index1')).toBe(true);
  });

  it('should insert a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const docCopy = { ...doc };
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
    });
    expect(inserted).toBeDefined();
    expect(docCopy).toEqual(doc);
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

  it('should not mutate a doc when config does not include id', async () => {
    const client = await mock.createEdv();
    const doc = { content: { someKey: 'someValue' } };
    const docCopy = { ...doc };
    const inserted = await client.insert({
      keyResolver,
      invocationSigner,
      doc,
    });
    expect(inserted).toBeDefined();
    expect(docCopy).toEqual(doc);
    expect(inserted).toBeInstanceOf(Object);
    expect(inserted).toHaveProperty('id');
    expect(inserted.id).toBeDefined();
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

  it('should get a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    await client.insert({ doc, invocationSigner, keyResolver });
    const expected = {
      id: testId,
      meta: {},
      content: { someKey: 'someValue' },
    };
    const decrypted = await client.get({ id: expected.id, invocationSigner });
    expect(decrypted).toBeInstanceOf(Object);
    expect(decrypted.id).toBe(testId);
    expect(decrypted.sequence).toBe(0);
    expect(decrypted.indexed).toBeInstanceOf(Array);
    expect(decrypted.indexed.length).toBe(1);
    expect(decrypted.indexed[0]).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].sequence).toBe(0);
    expect(decrypted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(decrypted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(decrypted.jwe).toBeInstanceOf(Object);
    expect(decrypted.jwe.protected).toBeDefined();
    expect(decrypted.jwe.recipients).toBeInstanceOf(Array);
    expect(decrypted.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: decrypted.jwe.recipients[0] });
    expect(decrypted.jwe.iv).toBeDefined();
    expect(decrypted.jwe.ciphertext).toBeDefined();
    expect(decrypted.jwe.tag).toBeDefined();
    expect(decrypted.content).toEqual(expected.content);
  });

  it('should fail to get a non-existent document', async () => {
    const client = await mock.createEdv();
    let err;
    try {
      await client.get({ id: 'doesNotExist', invocationSigner });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('NotFoundError');
  });

  it('should fail to insert a duplicate document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    await client.insert({ doc, invocationSigner, keyResolver });

    let err;
    try {
      await client.insert({ doc, invocationSigner, keyResolver });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('DuplicateError');
  });

  it('should upsert a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const updated = await client.update({ doc, invocationSigner, keyResolver });
    expect(updated).toBeDefined();
    expect(updated).toBeInstanceOf(Object);
    expect(updated.id).toBe(testId);
    expect(updated.sequence).toBe(0);
    expect(updated.indexed).toBeInstanceOf(Array);
    expect(updated.indexed.length).toBe(1);
    expect(updated.indexed[0]).toBeInstanceOf(Object);
    expect(updated.indexed[0].sequence).toBe(0);
    expect(updated.indexed[0].hmac).toBeInstanceOf(Object);
    expect(updated.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(updated.indexed[0].attributes).toBeInstanceOf(Array);
    expect(updated.jwe).toBeInstanceOf(Object);
    expect(updated.jwe.protected).toBeDefined();
    expect(updated.jwe.recipients).toBeInstanceOf(Array);
    expect(updated.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: updated.jwe.recipients[0] });
    expect(updated.jwe.iv).toBeDefined();
    expect(updated.jwe.ciphertext).toBeDefined();
    expect(updated.jwe.tag).toBeDefined();
    expect(updated.content).toEqual({ someKey: 'someValue' });
  });

  it('should update an existing document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const version1 = await client.insert({
      doc,
      invocationSigner,
      keyResolver,
    });
    version1.content = { someKey: 'aNewValue' };
    await client.update({ doc: version1, invocationSigner, keyResolver });
    const version2 = await client.get({ id: doc.id, invocationSigner });
    expect(version2).toBeDefined();
    expect(version2).toBeInstanceOf(Object);
    expect(version2.id).toBe(testId);
    expect(version2.sequence).toBe(1);
    expect(version2.indexed).toBeInstanceOf(Array);
    expect(version2.indexed.length).toBe(1);
    expect(version2.indexed[0]).toBeInstanceOf(Object);
    expect(version2.indexed[0].sequence).toBe(1);
    expect(version2.indexed[0].hmac).toBeInstanceOf(Object);
    expect(version2.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(version2.indexed[0].attributes).toBeInstanceOf(Array);
    expect(version2.jwe).toBeInstanceOf(Object);
    expect(version2.jwe.protected).toBeDefined();
    expect(version2.jwe.recipients).toBeInstanceOf(Array);
    expect(version2.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: version2.jwe.recipients[0] });
    expect(version2.jwe.iv).toBeDefined();
    expect(version2.jwe.ciphertext).toBeDefined();
    expect(version2.jwe.tag).toBeDefined();
    expect(version2.content).toEqual({ someKey: 'aNewValue' });
  });

  it('should delete an existing document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    await client.insert({ doc, invocationSigner, keyResolver });
    const decrypted = await client.get({ id: doc.id, invocationSigner });
    expect(decrypted).toBeInstanceOf(Object);
    const result = await client.delete({
      doc: decrypted,
      invocationSigner,
      keyResolver,
    });
    expect(result).toBe(true);
    let err;
    let deletedResult;
    try {
      deletedResult = await client.get({ id: doc.id, invocationSigner });
    } catch (e) {
      err = e;
    }
    expect(err).toBeFalsy();
    expect(deletedResult).toBeDefined();
    expect(deletedResult.meta.deleted).toBe(true);
  });

  it('should increase sequence when updating a deleted document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    await client.insert({ doc, invocationSigner, keyResolver });
    const decrypted = await client.get({ id: doc.id, invocationSigner });
    expect(decrypted).toBeInstanceOf(Object);
    await client.delete({ doc: decrypted, invocationSigner, keyResolver });
    const deletedResult = await client.get({ id: doc.id, invocationSigner });
    expect(deletedResult.sequence).toBe(1);
  });

  it('should insert a document with attributes', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({ keyResolver, invocationSigner, doc });
    const decrypted = await client.get({ id: doc.id, invocationSigner });
    expect(decrypted).toBeDefined();
    expect(decrypted).toBeInstanceOf(Object);
    expect(decrypted.id).toBe(testId);
    expect(decrypted.sequence).toBe(0);
    expect(decrypted.indexed).toBeInstanceOf(Array);
    expect(decrypted.indexed.length).toBe(1);
    expect(decrypted.indexed[0]).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].sequence).toBe(0);
    expect(decrypted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(decrypted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(decrypted.indexed[0].attributes.length).toBe(1);
    expect(decrypted.indexed[0].attributes[0]).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].attributes[0].name).toBeDefined();
    expect(decrypted.indexed[0].attributes[0].value).toBeDefined();
    expect(decrypted.jwe).toBeInstanceOf(Object);
    expect(decrypted.jwe.protected).toBeDefined();
    expect(decrypted.jwe.recipients).toBeInstanceOf(Array);
    expect(decrypted.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: decrypted.jwe.recipients[0] });
    expect(decrypted.jwe.iv).toBeDefined();
    expect(decrypted.jwe.ciphertext).toBeDefined();
    expect(decrypted.jwe.tag).toBeDefined();
    expect(decrypted.content).toEqual({ indexedKey: 'value1' });
  });

  it('should reject two documents with same unique attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.uniqueKey', unique: true });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { uniqueKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { uniqueKey: 'value1' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    let err;
    try {
      await client.insert({ doc: doc2, invocationSigner, keyResolver });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('DuplicateError');
  });

  it('should find a document that has an attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({ doc, invocationSigner, keyResolver });
    const { documents: docs } = await client.find({
      has: 'content.indexedKey',
      invocationSigner,
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(1);
    const decrypted = docs[0];
    expect(decrypted).toBeInstanceOf(Object);
    expect(decrypted.id).toBe(testId);
    expect(decrypted.sequence).toBe(0);
    expect(decrypted.indexed).toBeInstanceOf(Array);
    expect(decrypted.indexed.length).toBe(1);
    expect(decrypted.indexed[0]).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].sequence).toBe(0);
    expect(decrypted.indexed[0].hmac).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(decrypted.indexed[0].attributes).toBeInstanceOf(Array);
    expect(decrypted.indexed[0].attributes.length).toBe(1);
    expect(decrypted.indexed[0].attributes[0]).toBeInstanceOf(Object);
    expect(decrypted.indexed[0].attributes[0].name).toBeDefined();
    expect(decrypted.indexed[0].attributes[0].value).toBeDefined();
    expect(decrypted.jwe).toBeInstanceOf(Object);
    expect(decrypted.jwe.protected).toBeDefined();
    expect(decrypted.jwe.recipients).toBeInstanceOf(Array);
    expect(decrypted.jwe.recipients.length).toBe(1);
    isRecipient({ recipient: decrypted.jwe.recipients[0] });
    expect(decrypted.jwe.iv).toBeDefined();
    expect(decrypted.jwe.ciphertext).toBeDefined();
    expect(decrypted.jwe.tag).toBeDefined();
    expect(decrypted.content).toEqual({ indexedKey: 'value1' });
  });

  it('should find two documents with an attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { indexedKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { indexedKey: 'value2' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    await client.insert({ doc: doc2, invocationSigner, keyResolver });
    const { documents: docs } = await client.find({
      invocationSigner,
      has: 'content.indexedKey',
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(2);
    expect(docs[0]).toBeInstanceOf(Object);
    expect(docs[1]).toBeInstanceOf(Object);
    expect(docs[0].content).toEqual({ indexedKey: 'value1' });
    expect(docs[1].content).toEqual({ indexedKey: 'value2' });
  });

  it('should count two documents with an attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { indexedKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { indexedKey: 'value2' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    await client.insert({ doc: doc2, invocationSigner, keyResolver });
    const count = await client.count({
      invocationSigner,
      has: 'content.indexedKey',
    });
    expect(count).toBeDefined();

    expect(count).toBe(2);
  });

  it('should find a document that equals an attribute value', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const expected = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({ doc: expected, invocationSigner, keyResolver });
    const { documents: docs } = await client.find({
      invocationSigner,
      equals: { 'content.indexedKey': 'value1' },
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(1);
    expect(docs[0]).toBeInstanceOf(Object);
    expect(docs[0].content).toEqual(expected.content);
  });

  it(
    'should find a document that equals the value of a' + ' URL attribute',
    async () => {
      const client = await mock.createEdv();
      client.ensureIndex({ attribute: 'content.https://schema\\.org/' });
      const testId = await EdvClient.generateId();
      const expected = {
        id: testId,
        content: {
          'https://schema.org/': 'value1',
        },
      };
      await client.insert({ doc: expected, invocationSigner, keyResolver });
      const { documents: docs } = await client.find({
        invocationSigner,
        equals: {
          'content.https://schema\\.org/': 'value1',
        },
      });
      expect(docs).toBeInstanceOf(Array);
      expect(docs.length).toBe(1);
      expect(docs[0]).toBeInstanceOf(Object);
      expect(docs[0].content).toEqual(expected.content);
    }
  );

  it('should find a document with a deep index on an array', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.nested.array.foo' });
    const testId = await EdvClient.generateId();
    const expected = {
      id: testId,
      content: {
        nested: {
          array: [
            {
              foo: 'bar',
            },
            {
              foo: 'baz',
            },
          ],
        },
      },
    };
    await client.insert({ doc: expected, keyResolver, invocationSigner });

    // find with first value
    const { documents: docs } = await client.find({
      invocationSigner,
      equals: {
        'content.nested.array.foo': 'bar',
      },
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(1);
    expect(docs[0]).toBeInstanceOf(Object);
    expect(docs[0].content).toEqual(expected.content);

    // find with second value
    const { documents: docs2 } = await client.find({
      invocationSigner,
      equals: {
        'content.nested.array.foo': 'baz',
      },
    });
    expect(docs2).toBeInstanceOf(Array);
    expect(docs2.length).toBe(1);
    expect(docs2[0]).toBeInstanceOf(Object);
    expect(docs2[0].content).toEqual(expected.content);
  });

  it('should find two documents with attribute values', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { indexedKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { indexedKey: 'value2' } };
    await client.insert({ doc: doc1, invocationSigner, keyResolver });
    await client.insert({ doc: doc2, invocationSigner, keyResolver });
    const { documents: docs } = await client.find({
      invocationSigner,
      equals: [
        { 'content.indexedKey': 'value1' },
        { 'content.indexedKey': 'value2' },
      ],
    });
    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toBe(2);
    expect(docs[0]).toBeInstanceOf(Object);
    expect(docs[1]).toBeInstanceOf(Object);
    expect(docs[0].content).toEqual({ indexedKey: 'value1' });
    expect(docs[1].content).toEqual({ indexedKey: 'value2' });
  });
});
