import { EdvClient } from 'edv-client';

let config;

export const testServer = (mock: any) => {
  // https: github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L19
  it('should create a new encrypted data vault', async () => {
    config = await EdvClient.createEdv({
      url: mock.vault_endpoint,
      config: {
        sequence: 0,
        controller: mock.account_controller,
        keyAgreementKey: {
          id: mock.keys.keyAgreementKey.id,
          type: mock.keys.keyAgreementKey.type,
        },
        hmac: { id: mock.keys.hmac.id, type: mock.keys.hmac.type },
      },
    });
    expect(config.id).toBeDefined();
    expect(config.controller).toBe(mock.account_controller);
    expect(config.keyAgreementKey).toBeDefined();
    expect(config.hmac).toBeDefined();
  });
  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L36
  it('should get an encrypted data vault config', async () => {
    config = await EdvClient.createEdv({
      url: mock.vault_endpoint,
      config: {
        sequence: 0,
        controller: mock.account_controller,
        keyAgreementKey: {
          id: mock.keys.keyAgreementKey.id,
          type: mock.keys.keyAgreementKey.type,
        },
        hmac: { id: mock.keys.hmac.id, type: mock.keys.hmac.type },
      },
    });

    const config2 = await EdvClient.getConfig({
      id: mock.vault_endpoint + '/' + config.id,
    });

    expect(config2.controller).toBe(mock.account_controller);
    expect(config2.id).toBe(config.id);
    expect(config2.keyAgreementKey).toBeDefined();
    expect(config2.hmac).toBeDefined();
  });
  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L54
  it('should create "primary" encrypted data vault', async () => {
    config = await EdvClient.createEdv({
      url: mock.vault_endpoint,
      config: {
        sequence: 0,
        controller: mock.account_controller,
        keyAgreementKey: {
          id: mock.keys.keyAgreementKey.id,
          type: mock.keys.keyAgreementKey.type,
        },
        hmac: { id: mock.keys.hmac.id, type: mock.keys.hmac.type },
        referenceId: mock.account_controller + '#primary',
      },
    });
    expect(config.controller).toBe(mock.account_controller);
    expect(config.id).toBeDefined();
    expect(config.keyAgreementKey).toBeDefined();
    expect(config.hmac).toBeDefined();
    expect(config.referenceId).toBe(mock.account_controller + '#primary');
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L72
  it('should get "secondary" encrypted data vault', async () => {
    config = await EdvClient.createEdv({
      url: mock.vault_endpoint,
      config: {
        sequence: 0,
        controller: mock.account_controller,
        keyAgreementKey: {
          id: mock.keys.keyAgreementKey.id,
          type: mock.keys.keyAgreementKey.type,
        },
        hmac: { id: mock.keys.hmac.id, type: mock.keys.hmac.type },
        referenceId: mock.account_controller + '#secondary',
      },
    });
    const config2 = await EdvClient.findConfig({
      url: mock.vault_endpoint,
      controller: mock.account_controller,
      referenceId: mock.account_controller + '#secondary',
    });
    expect(config2.controller).toBe(mock.account_controller);
    expect(config2.id).toBe(config.id);
    expect(config2.keyAgreementKey).toBeDefined();
    expect(config2.hmac).toBeDefined();
    expect(config2.referenceId).toBe(mock.account_controller + '#secondary');
  });
  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L98
  // TODO: add more tests: getAll, update, setStatus
  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L100
  it('should ensure two new indexes', async () => {
    const client = await mock.createEdv();
    const { indexHelper } = client;
    const indexCount = indexHelper.indexes.size;
    client.ensureIndex({ attribute: ['content', 'content.index1'] });
    expect(indexHelper.indexes.size).toBe(indexCount + 2);
    expect(indexHelper.indexes.has('content')).toBe(true);
    expect(indexHelper.indexes.has('content.index1')).toBe(true);
  });

  //https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L111
  it('should insert a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue' } };
    const inserted = await client.insert({
      keyResolver: mock.keyResolver,
      invocationSigner: mock.invocationSigner,
      doc,
    });
    expect(inserted).toBeDefined();
    expect(inserted.id).toBe(testId);
    expect(inserted.sequence).toBe(0);
    expect(inserted.indexed.length).toBe(1);
    expect(inserted.indexed[0].sequence).toBe(0);
    expect(inserted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(inserted.indexed[0].attributes).toBeDefined();
    expect(inserted.jwe).toBeDefined();
    // TODO: better JWE tests..
    expect(inserted.content).toEqual({ someKey: 'someValue' });
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L141
  it('should get a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue2' } };
    await client.insert({
      keyResolver: mock.keyResolver,
      invocationSigner: mock.invocationSigner,
      doc,
    });
    const decrypted = await client.get({
      id: testId,
      invocationSigner: mock.invocationSigner,
    });
    expect(decrypted.id).toBe(testId);
    expect(decrypted.content).toEqual({ someKey: 'someValue2' });
    // TODO:  add more tests
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L172
  it('should fail to get a non-existent document', async () => {
    expect.assertions(1);
    const client = await mock.createEdv();
    try {
      await client.get({
        id: 'doesNotExist',
        invocationSigner: mock.invocationSigner,
      });
    } catch (e) {
      expect(e.name).toBe('NotFoundError');
    }
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L184
  it('should fail to insert a duplicate document', async () => {
    expect.assertions(1);
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue2' } };
    await client.insert({
      doc,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });

    try {
      await client.insert({
        doc,
        invocationSigner: mock.invocationSigner,
        keyResolver: mock.keyResolver,
      });
    } catch (e) {
      expect(e.name).toBe('DuplicateError');
    }
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L200
  it('should upsert a document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue3' } };
    const updated = await client.update({
      keyResolver: mock.keyResolver,
      invocationSigner: mock.invocationSigner,
      doc,
    });
    expect(updated).toBeDefined();
    expect(updated.id).toBe(testId);
    expect(updated.sequence).toBe(0);
    expect(updated.indexed.length).toBe(1);
    expect(updated.indexed[0].sequence).toBe(0);
    expect(updated.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(updated.indexed[0].attributes).toBeDefined();
    expect(updated.jwe).toBeDefined();
    // TODO: better JWE tests..
    expect(updated.content).toEqual({ someKey: 'someValue3' });
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L230
  it('should update an existing document', async () => {
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue3' } };
    const version1 = await client.insert({
      doc,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    version1.content = { someKey: 'aNewValue' };
    await client.update({
      doc: version1,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const version2 = await client.get({
      id: doc.id,
      invocationSigner: mock.invocationSigner,
    });
    expect(version2.id).toEqual(testId);
    expect(version2.sequence).toBe(1);
    expect(version2.content).toEqual({ someKey: 'aNewValue' });
    // TODO: more tests, especially around crypto after update...
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L263
  it('should delete an existing document', async () => {
    expect.assertions(2);
    const client = await mock.createEdv();
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { someKey: 'someValue3' } };
    const version1 = await client.insert({
      doc,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const result = await client.delete({
      id: testId,
      invocationSigner: mock.invocationSigner,
    });
    expect(result).toBe(true);
    try {
      await client.get({
        id: version1.id,
        invocationSigner: mock.invocationSigner,
      });
    } catch (e) {
      expect(e.name).toBe('NotFoundError');
    }
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L282
  it('should fail to delete a non-existent document', async () => {
    const client = await mock.createEdv();
    const result = await client.delete({
      id: 'foo',
      invocationSigner: mock.invocationSigner,
    });
    expect(result).toBe(false);
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L288
  it('should insert a document with attributes', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({
      keyResolver: mock.keyResolver,
      invocationSigner: mock.invocationSigner,
      doc,
    });
    const decrypted = await client.get({
      id: doc.id,
      invocationSigner: mock.invocationSigner,
    });
    expect(decrypted.id).toBe(testId);
    expect(decrypted.sequence).toBe(0);
    expect(decrypted.indexed[0].sequence).toBe(0);
    expect(decrypted.indexed[0].hmac).toEqual({
      id: client.hmac.id,
      type: client.hmac.type,
    });
    expect(decrypted.indexed[0].attributes.length).toBe(1);
    expect(decrypted.indexed[0].attributes[0].name).toBeDefined();
    expect(decrypted.indexed[0].attributes[0].value).toBeDefined();
    expect(decrypted.jwe).toBeDefined();
    // TODO: more JWE tests
    expect(decrypted.content).toEqual({ indexedKey: 'value1' });
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L324
  it('should reject two documents with same unique attribute', async () => {
    expect.assertions(1);
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.uniqueKey', unique: true });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { uniqueKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { uniqueKey: 'value1' } };
    await client.insert({
      doc: doc1,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    try {
      await client.insert({
        doc: doc2,
        invocationSigner: mock.invocationSigner,
        keyResolver: mock.keyResolver,
      });
    } catch (e) {
      expect(e.name).toBe('DuplicateError');
    }
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L342
  it('should find a document that has an attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const doc = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({
      doc,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const docs = await client.find({
      has: 'content.indexedKey',
      invocationSigner: mock.invocationSigner,
    });
    expect(docs.length).toBe(1);
    const decrypted = docs[0];
    expect(decrypted.id).toBe(testId);
    expect(decrypted.content).toEqual({ indexedKey: 'value1' });
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L381
  it('should find two documents with an attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { indexedKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { indexedKey: 'value2' } };
    await client.insert({
      doc: doc1,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    await client.insert({
      doc: doc2,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const docs = await client.find({
      invocationSigner: mock.invocationSigner,
      has: 'content.indexedKey',
    });
    expect(docs.length).toBe(2);
    expect(docs[0].content).toEqual({ indexedKey: 'value1' });
    expect(docs[1].content).toEqual({ indexedKey: 'value2' });
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L402
  it('should find a document that equals an attribute value', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const testId = await EdvClient.generateId();
    const expected = { id: testId, content: { indexedKey: 'value1' } };
    await client.insert({
      doc: expected,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const docs = await client.find({
      invocationSigner: mock.invocationSigner,
      equals: { 'content.indexedKey': 'value1' },
    });
    expect(docs[0].content).toEqual(expected.content);
    // docs.should.be.an("array");
    // docs.length.should.equal(1);
    // docs[0].should.be.an("object");
    // docs[0].content.should.deep.equal(expected.content);
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L418
  it('should find a document that equals the value of a URL attribute', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.https://schema\\.org/' });
    const testId = await EdvClient.generateId();
    const expected = {
      id: testId,
      content: {
        'https://schema.org/': 'value1',
      },
    };
    await client.insert({
      doc: expected,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const docs = await client.find({
      invocationSigner: mock.invocationSigner,
      equals: {
        'content.https://schema\\.org/': 'value1',
      },
    });
    expect(docs[0].content).toEqual(expected.content);
    // docs.should.be.an("array");
    // docs.length.should.equal(1);
    // docs[0].should.be.an("object");
    // docs[0].content.should.deep.equal(expected.content);
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L442
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
    await client.insert({
      doc: expected,
      keyResolver: mock.keyResolver,
      invocationSigner: mock.invocationSigner,
    });

    // find with first value
    let docs = await client.find({
      invocationSigner: mock.invocationSigner,
      equals: {
        'content.nested.array.foo': 'bar',
      },
    });
    expect(docs[0].content).toEqual(expected.content);
    // docs.should.be.an("array");
    // docs.length.should.equal(1);
    // docs[0].should.be.an("object");
    // docs[0].content.should.deep.equal(expected.content);

    // find with second value
    docs = await client.find({
      invocationSigner: mock.invocationSigner,
      equals: {
        'content.nested.array.foo': 'baz',
      },
    });
    expect(docs[0].content).toEqual(expected.content);
    // docs.should.be.an("array");
    // docs.length.should.equal(1);
    // docs[0].should.be.an("object");
    // docs[0].content.should.deep.equal(expected.content);
  });

  // https://github.com/digitalbazaar/edv-client/blob/master/tests/10-EdvClient.spec.js#L485
  it('should find two documents with attribute values', async () => {
    const client = await mock.createEdv();
    client.ensureIndex({ attribute: 'content.indexedKey' });
    const doc1ID = await EdvClient.generateId();
    const doc2ID = await EdvClient.generateId();
    const doc1 = { id: doc1ID, content: { indexedKey: 'value1' } };
    const doc2 = { id: doc2ID, content: { indexedKey: 'value2' } };
    await client.insert({
      doc: doc1,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    await client.insert({
      doc: doc2,
      invocationSigner: mock.invocationSigner,
      keyResolver: mock.keyResolver,
    });
    const docs = await client.find({
      invocationSigner: mock.invocationSigner,
      equals: [
        { 'content.indexedKey': 'value1' },
        { 'content.indexedKey': 'value2' },
      ],
    });
    // docs.should.be.an("array");
    // docs.length.should.equal(2);
    // docs[0].should.be.an("object");
    // docs[1].should.be.an("object");
    expect(docs[0].content).toEqual({ indexedKey: 'value1' });
    expect(docs[1].content).toEqual({ indexedKey: 'value2' });
    // docs[0].content.should.deep.equal({ indexedKey: "value1" });
    // docs[1].content.should.deep.equal({ indexedKey: "value2" });
  });
};
