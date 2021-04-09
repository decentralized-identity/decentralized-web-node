import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { VaultIndex } from './VaultIndex';

describe('MongoDB VaultIndex', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      // Typeorm does not allow two connections to have the same name
      // So we use a different name everytime in order to have parallel connections
      name: `${Date.now()}`,
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url: `mongodb://localhost:27017/vault-index-tests`,
      entities: [VaultIndex],
    });
    await connection.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
  });

  it('works', async () => {
    const model = VaultIndex.fromBindingModel({
      edvId: '42a72dbe-23d4-43b8-8927-f0a4b73568f6',
      hmacId: 'urn:multibase:uEqwxeY_UyPYkKFB8PVihJdLlrAQKeAh50Z3ay2QO1wzC',
      has: {},
      equals: {
        't2O3VgcSqWzpI6PDQybxiAmXUrepFB48PCoyyUafrZk=0hqrgUbgzU6tWpW8Rla4nAuq14IjIwqCbBcJY98apEE': [
          'z1A68DZo3p4mTpSBpd5gd45K3',
        ],
      },
    });

    await connection.manager.save(model);
    const models = await connection.manager.find(VaultIndex);
    expect(models.length).toBe(1);
    // console.log(models);
  });
});
