import forge from 'node-forge';
import { decode } from './Base58Btc';
import * as config from './config';

const {
  pki: { ed25519 },
} = forge;

export interface IEd25519VerificationKey2018 {
  id: string;
  type: string;
  controller: string;
  privateKeyBase58: string;
  publicKeyBase58: string;
}

export default class MockInvoker {
  public id: any;
  public controller: any;
  public type: any;
  public privateKey: any;
  public privateKey58: any;

  constructor(ed25519Key: IEd25519VerificationKey2018 = config.ed25519Key) {
    this.id = ed25519Key.id;
    this.controller = ed25519Key.controller;
    this.type = ed25519Key.type;
    this.privateKey = decode(ed25519Key.privateKeyBase58);
    this.privateKey58 = decode(ed25519Key.publicKeyBase58);
  }

  async sign({ data }: any) {
    const { privateKey } = this;
    return ed25519.sign({ message: data, privateKey });
  }
}
