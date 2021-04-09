import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { Document } from './Document';

describe('MongoDB Document', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      // Typeorm does not allow two connections to have the same name
      // So we use a different name everytime in order to have parallel connections
      name: `${Date.now()}`,
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url: `mongodb://localhost:27017/doc-tests`,
      entities: [Document],
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('works', async () => {
    const model = Document.fromBindingModel({
      id: 'z1ACWi9kcBY86ntmxoiCpxHCn',
      sequence: 0,
      indexed: [
        {
          hmac: {
            id: 'urn:multibase:uEqwxeY_UyPYkKFB8PVihJdLlrAQKeAh50Z3ay2QO1wzC',
            type: 'Sha256HmacKey2019',
          },
          sequence: 0,
          attributes: [
            {
              name: 't2O3VgcSqWzpI6PDQybxiAmXUrepFB48PCoyyUafrZk',
              value: '0hqrgUbgzU6tWpW8Rla4nAuq14IjIwqCbBcJY98apEE',
              unique: false,
            },
          ],
        },
      ],
      jwe: {
        protected: 'eyJlbmMiOiJYQzIwUCJ9',
        recipients: [
          {
            header: {
              kid:
                'did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn#z6LSn4Wq5XE4FgJ8jyKss1kL5Gqwsn7gVgsKpNEPGHMeCxQq',
              alg: 'ECDH-ES+A256KW',
              epk: {
                kty: 'OKP',
                crv: 'X25519',
                x: '3qz-Oq19jsO-SZGgKsj-kjlwL6H4v4G-e78Vj7qH2XU',
              },
              apu: '3qz-Oq19jsO-SZGgKsj-kjlwL6H4v4G-e78Vj7qH2XU',
              apv:
                'ZGlkOmtleTp6Nk1rdENpMjlpQXdVaVZEYWV3U1N0SFZXNXFoQnhaVEdYQkZYTTlZRDlSaXNiRm4jejZMU240V3E1WEU0RmdKOGp5S3NzMWtMNUdxd3NuN2dWZ3NLcE5FUEdITWVDeFFx',
            },
            encrypted_key:
              'mCWt24TSxzvk_t6RncJO-WNygvq_IunDI5qSvQz_dIHtHVexDPWPUg',
          },
        ],
        iv: 'KLhKkGBYvewpbsy4SIXo0GL1JjJWWlpQ',
        ciphertext:
          'WJHKI1MqzlTteGuSrifcK0uoUM7JYf54lWSE8xWXUv7ifX5AoeEOCP7_4h29bDMBLR0yzm5wkJjC',
        tag: 'K7A_0giLHY6LvpfTylxnYA',
      },
    });
    model.edvId = '123';

    await connection.manager.save(model);
    const models = await connection.manager.find(Document);
    expect(models.length).toBe(1);
    // console.log(models[0].toExternal());
  });
});
