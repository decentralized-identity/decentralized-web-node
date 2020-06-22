import crypto from 'isomorphic-webcrypto';
import base64url from 'base64url-universal';

import { hmacSecret } from './config';

export default class MockHmac {
  public id: string;
  public type: string;
  public algorithm: string;
  public key: any;

  constructor({ id, type, algorithm, key }: any) {
    this.id = id;
    this.type = type;
    this.algorithm = algorithm;
    this.key = key;
  }

  static async create({ data = base64url.decode(hmacSecret) }: any = {}) {
    const id = 'urn:mockhmac:1';
    const type = 'Sha256HmacKey2019';
    const algorithm = 'HS256';
    const extractable = true;
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      extractable,
      ['sign', 'verify']
    );
    const hmac = new MockHmac({ id, type, algorithm, key });
    return hmac;
  }

  async sign({ data }: any) {
    const key = this.key;
    const signature = new Uint8Array(
      await crypto.subtle.sign(key.algorithm, key, data)
    );
    return base64url.encode(signature);
  }

  async verify({ data, signature }: any) {
    const key = this.key;
    signature = base64url.decode(signature);
    return crypto.subtle.verify(key.algorithm, key, signature, data);
  }
}
