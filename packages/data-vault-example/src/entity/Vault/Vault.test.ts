import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { Vault } from './Vault';

describe('MongoDB Vault', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      // Typeorm does not allow two connections to have the same name
      // So we use a different name everytime in order to have parallel connections
      name: `${Date.now()}`,
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url: `mongodb://localhost:27017/chunk-tests`,
      entities: [Vault],
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('works', async () => {
    const model = Vault.fromBindingModel({
      sequence: 0,
      controller: 'did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn',
      keyAgreementKey: {
        id:
          'did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn#z6LSn4Wq5XE4FgJ8jyKss1kL5Gqwsn7gVgsKpNEPGHMeCxQq',
        type: 'X25519KeyAgreementKey2019',
      },
      hmac: {
        id: 'urn:multibase:uEqwxeY_UyPYkKFB8PVihJdLlrAQKeAh50Z3ay2QO1wzC',
        type: 'Sha256HmacKey2019',
      },
      referenceId: 'data-model-guide',
    });

    await connection.manager.save(model);
    const models = await connection.manager.find(Vault);
    expect(models.length).toBe(1);
    // console.log(models[0].toExternal());
  });
});
