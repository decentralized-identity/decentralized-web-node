import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { Chunk } from './Chunk';

describe('MongoDB Chunk', () => {
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
      entities: [Chunk],
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('works', async () => {
    const chunk = Chunk.fromBindingModel({
      sequence: 0,
      index: 0,
      offset: 50,
      jwe: {
        protected: 'eyJlbmMiOiJYQzIwUCJ9',
        recipients: [
          {
            header: {
              kid: 'urn:123',
              alg: 'ECDH-ES+A256KW',
              epk: {
                kty: 'OKP',
                crv: 'X25519',
                x: 'XaSPFbSFAeKbdW5RbeYJlnHvehXm_Yyf4yUdt5DkbzY',
              },
              apu: 'XaSPFbSFAeKbdW5RbeYJlnHvehXm_Yyf4yUdt5DkbzY',
              apv: 'dXJuOjEyMw',
            },
            encrypted_key:
              'T2tR300rekMbHHR_7AzloxwZ3owMhT4AGt2y6QSPBj0h3b2MLZsriA',
          },
        ],
        iv: 'StSbp6DVyQWPF52-y7fuZx0ZsFKN5kgj',
        ciphertext:
          'Jfa_DJrvIKeeAYInQ51xYw14n8nyWkuXqlsgnatHcTxIPosAOEbSCa_ul1CP1_ff6lM',
        tag: 'ms4il3i05a3CAKUb8qWC8w',
      },
    });

    chunk.edvId = '123';
    chunk.docId = '456';

    await connection.manager.save(chunk);
    const chunks = await connection.manager.find(Chunk);
    expect(chunks.length).toBe(1);
    // console.log(chunks);
  });
});
