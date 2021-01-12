import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import { Revocation } from './Revocation';

describe('MongoDB Revocation', () => {
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
      entities: [Revocation],
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('works', async () => {
    const chunk = Revocation.fromBindingModel({
      '@context': 'https://w3id.org/security/v2',
      id: 'urn:uuid:0a827d20-693e-4691-988b-113bad9d379d',
      invocationTarget:
        'http://localhost:9876/edvs/79031cb6-5596-4b2c-9d17-d1185b08972e/documents/z19saUhqbzoGAAQVCLYGSPyCX',
      invoker:
        'did:key:z6MknrGVjFYMhQYetuYiVxB5TuYucLaM3xuVn7XeDw4EGoLm#z6LSqdxcPj7r7yVkRD3iRPYuydBwS2JYu4xfFKNfhic8BsUr',
      allowedAction: 'read',
      parentCapability:
        'http://localhost:9876/edvs/79031cb6-5596-4b2c-9d17-d1185b08972e/zcaps/documents/z19saUhqbzoGAAQVCLYGSPyCX',
      proof: {
        type: 'Ed25519Signature2018',
        created: '2021-01-01T18:49:34Z',
        capabilityChain: [
          'http://localhost:9876/edvs/79031cb6-5596-4b2c-9d17-d1185b08972e/zcaps/documents/z19saUhqbzoGAAQVCLYGSPyCX',
        ],
        jws:
          'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XuTl_3WlwfVANnakWNAlaAxWDi1bogMJkNACjbfuy2VghAAcqMm1BTg5Lh3LcJDdy7ncL1WPoU-mP80yqzOvDA',
        proofPurpose: 'capabilityDelegation',
        verificationMethod:
          'did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn#z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn',
      },
    });

    await connection.manager.save(chunk);
    const chunks = await connection.manager.find(Revocation);
    expect(chunks.length).toBe(1);
    // console.log(chunks);
  });
});
