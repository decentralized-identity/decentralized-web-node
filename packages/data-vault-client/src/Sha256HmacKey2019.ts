import crypto from './crypto';
import base64url from 'base64url';
// Based on https://github.com/digitalbazaar/edv-client/blob/master/tests/MockHmac.js

export class Sha256HmacKey2019 {
  public id: string;
  public type: string = 'Sha256HmacKey2019';
  public algorithm: string;
  private key: any;

  constructor({ id, algorithm, key }: any) {
    this.id = id;
    this.algorithm = algorithm;
    this.key = key;
  }

  static fromJwk = (jwk: any) => {
    if (jwk.kty !== 'oct') {
      throw new Error('Unsupported kty: ' + jwk.kty);
    }
    if (jwk.alg !== 'HS256') {
      throw new Error('Unsupported alg: ' + jwk.alg);
    }
    if (!jwk.k) {
      throw new Error('Unsupported k: ' + jwk.k);
    }
    return Sha256HmacKey2019.create(jwk.k);
  };

  // base64url encoded string.
  static async create(secret: string) {
    const algorithm = 'HS256';
    const extractable = true;
    const rawKey = base64url.toBuffer(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      extractable,
      ['sign', 'verify']
    );
    const fingerprint = await crypto.subtle.digest('SHA-256', rawKey);
    // https://tools.ietf.org/html/draft-multiformats-multibase-00
    // 'u' is base64url (no pad)
    const id = `urn:multibase:u${base64url.encode(
      Buffer.concat([
        // https://github.com/multiformats/multicodec/blob/master/table.csv#L9
        // 0x12 is sha256
        Buffer.from('12', 'hex'),
        // sha256 digest of key
        Buffer.from(fingerprint),
      ])
    )}`;
    const hmac = new Sha256HmacKey2019({ id, algorithm, key });
    return hmac;
  }

  async sign({ data }: any) {
    const key = this.key;
    const signature = new Uint8Array(
      await crypto.subtle.sign(key.algorithm, key, data)
    );
    return base64url.encode(Buffer.from(signature));
  }

  async verify({ data, signature }: any) {
    const key = this.key;
    signature = base64url.decode(signature);
    return crypto.subtle.verify(key.algorithm, key, signature, data);
  }

  async toJson(exportPrivateKey = false) {
    const exported: any = {
      id: this.id,
      type: this.type,
    };
    if (exportPrivateKey) {
      const jwk = await crypto.subtle.exportKey('jwk', this.key);
      delete jwk.key_ops;
      delete jwk.ext;
      exported.privateKeyJwk = jwk;
    }
    return exported;
  }
}
