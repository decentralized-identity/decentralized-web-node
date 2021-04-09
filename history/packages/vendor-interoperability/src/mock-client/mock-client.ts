import { Ed25519KeyPair } from 'crypto-ld';
import { X25519KeyPair } from 'x25519-key-pair';

import MockHmac from './MockHmac';
import MockKak from './MockKak';
import MockInvoker from './MockInvoker';

import { EdvClient } from 'edv-client';

import * as config from './config';
const { keyToDidDoc } = require('did-method-key').driver();

export interface IEdvVendorConfig {
  account_seed: string;
  vault_endpoint: string;
}

const defaultArgs: IEdvVendorConfig = {
  account_seed: config.didSeed,
  vault_endpoint: 'http://localhost:9876/edvs',
};

class TestMock {
  public account_seed: string = defaultArgs.account_seed;
  public account_controller: string =
    'did:key:z6MkwJSaEMnE4u6LiqrZV1BJHSkc9x8S4mTm3ArNL1m19BZR';
  public vault_endpoint: string = defaultArgs.vault_endpoint;
  public keys: any;
  public invocationSigner: any;
  public keyResolver: any;
  public config: any;

  async init(args: IEdvVendorConfig = defaultArgs) {
    this.vault_endpoint = args.vault_endpoint;
    this.account_seed = args.account_seed;
    const ed25519Key = await Ed25519KeyPair.generate({
      seed: Buffer.from(args.account_seed, 'hex'),
    });
    const didDocument = keyToDidDoc(ed25519Key);
    this.account_controller = didDocument.id;
    ed25519Key.id = didDocument.publicKey[0].id;
    ed25519Key.controller = didDocument.publicKey[0].controller;

    const x25519Key = X25519KeyPair.fromEdKeyPair(ed25519Key);
    x25519Key.id = didDocument.keyAgreement[0].id;
    x25519Key.controller = didDocument.keyAgreement[0].controller;

    if (!this.keys) {
      this.keys = {};
      this.invocationSigner = new MockInvoker(ed25519Key);
      this.keys.keyAgreementKey = new MockKak(x25519Key);
      this.keys.hmac = await MockHmac.create();
      this.keyResolver = ({ id }: any) => {
        if (this.keys.keyAgreementKey.id === id) {
          return this.keys.keyAgreementKey;
        }
        throw new Error(`Key ${id} not found`);
      };
    }
  }

  async createEdv({ controller, referenceId }: any = {}) {
    const { keyAgreementKey, hmac } = this.keys;
    let config: any = {
      sequence: 0,
      controller: controller || this.invocationSigner.id,
      keyAgreementKey: { id: keyAgreementKey.id, type: keyAgreementKey.type },
      hmac: { id: hmac.id, type: hmac.type },
    };
    if (referenceId) {
      config.referenceId = referenceId;
    }
    config = await EdvClient.createEdv({
      url: this.vault_endpoint,
      config,
    });
    this.config = config;
    return new EdvClient({
      id: this.vault_endpoint + '/' + config.id,
      keyAgreementKey,
      hmac,
    });
  }
}

const singleton = new TestMock();
export default singleton;
