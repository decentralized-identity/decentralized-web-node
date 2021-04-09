import { EdvClient } from 'edv-client';
import base64url from 'base64url';

import * as ed25519 from '@transmute/did-key-ed25519';

import {
  fixtures,
  Sha256HmacKey2019,
  CapabilityInvoker,
  KeyAgreementKey,
} from '../client';

import { getRandomValues } from 'isomorphic-webcrypto';

import { documentLoader } from './__fixtures__/documentLoader';

export class TestMock {
  public keyStorage: any;
  public keys?: any;
  public invocationSigner?: CapabilityInvoker;
  public keyResolver?: any;
  public documentLoader: any = documentLoader;
  public accountId = 'did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn';

  constructor() {
    // create mock server

    // this is used to store recipient keys
    this.keyStorage = new Map();
  }
  async init() {
    const key1 = await ed25519.Ed25519KeyPair.generate({
      secureRandom: () => {
        return base64url.toBuffer(fixtures.client[0].seed);
      },
    });
    key1.id = key1.controller + key1.id;

    const key2 = await key1.toX25519KeyPair(true);
    key2.id = key2.controller + key2.id;

    // only init keys once
    // this is used for the edv controller's keys in the tests
    if (!this.keys) {
      // create mock keys
      this.keys = {};
      // this creates the same invocationSigner for each test.
      this.invocationSigner = new CapabilityInvoker(key1);

      // create KAK and HMAC keys for creating edvs
      // the creates the same hmac for each test.
      this.keys.hmac = await Sha256HmacKey2019.create(fixtures.client[0].seed);

      // this creates the same keyAgreementKey for each test.
      this.keys.keyAgreementKey = new KeyAgreementKey(key2);

      this.keys.keyAgreementKey.id = 'urn:123';

      // only store the KaK in the recipients' keyStorage.
      this.keyStorage.set(
        this.keys.keyAgreementKey.id,
        this.keys.keyAgreementKey
      );
      this.keyResolver = ({ id }: any) => {
        const key = this.keyStorage.get(id);
        if (key) {
          return key;
        }
        throw new Error(`Key ${id} not found`);
      };
    }
  }
  async createEdv({ controller, referenceId }: any = {}) {
    const { keyAgreementKey, hmac } = this.keys;
    let config: any = {
      sequence: 0,
      controller: controller || this.accountId,
      keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
      hmac: { id: hmac.id, type: hmac.type },
    };
    if (referenceId) {
      config.referenceId = referenceId;
    }
    config = await EdvClient.createEdv({
      config,
      url: 'http://localhost:9876/edvs',
    });
    return new EdvClient({ id: config.id, keyAgreementKey, hmac });
  }

  async createCapabilityAgent() {
    const key1 = await ed25519.Ed25519KeyPair.generate({
      secureRandom: () => {
        return Buffer.from(getRandomValues(new Uint8Array(32)));
      },
    });
    key1.id = key1.controller + key1.id;
    const key2 = await key1.toX25519KeyPair(true);
    const kek = await this.createKeyAgreementKey(key2.toKeyPair(true));

    return { capabilityAgent: new CapabilityInvoker(key1), didKey: kek };
  }
  async createKeyAgreementKey(base58EncodedX25519KeyPair?: any) {
    let key: any; // base58 encoded keypair (with private key as string)
    if (base58EncodedX25519KeyPair) {
      key = base58EncodedX25519KeyPair;
    } else {
      const key1 = await ed25519.Ed25519KeyPair.generate({
        secureRandom: () => {
          return Buffer.from(getRandomValues(new Uint8Array(32)));
        },
      });
      key1.id = key1.controller + key1.id;

      const key2 = await key1.toX25519KeyPair(true);
      key2.id = key2.controller + key2.id;
      key = {
        '@context': 'https://w3id.org/security/v2',
        ...key2.toKeyPair(true),
      };
    }

    this.keyStorage.set(key.id, key);
    return key;
  }
}

const singleton = new TestMock();
export default singleton;
