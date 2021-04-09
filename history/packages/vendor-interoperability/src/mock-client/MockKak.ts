import { decode } from './Base58Btc';

import nacl from 'tweetnacl';

import * as config from './config';

export interface IX25519KeyAgreementKey2019 {
  id: string;
  type: string;
  controller: string;
  privateKeyBase58: string;
  publicKeyBase58: string;
}

export default class MockKak {
  public id: string;
  public type: string;
  public publicKeyBase58: string;
  public privateKeyBase58: string;
  public privateKey: Uint8Array;
  public publicKey: Uint8Array;

  constructor(x25519Key: IX25519KeyAgreementKey2019 = config.x25519Key) {
    this.id = x25519Key.id;
    this.type = x25519Key.type;
    this.publicKeyBase58 = x25519Key.publicKeyBase58;
    this.privateKeyBase58 = x25519Key.privateKeyBase58;
    this.privateKey = decode(this.privateKeyBase58);
    this.publicKey = decode(this.publicKeyBase58);
  }

  async deriveSecret({ publicKey }: any) {
    const remotePublicKey = decode(publicKey.publicKeyBase58);
    return nacl.scalarMult(this.privateKey, remotePublicKey);
  }
}
