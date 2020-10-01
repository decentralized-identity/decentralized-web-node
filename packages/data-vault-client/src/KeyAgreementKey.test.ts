import base64url from 'base64url';

import * as ed25519 from '@transmute/did-key-ed25519';
import { KeyAgreementKey } from './KeyAgreementKey';
import * as fixtures from './__fixtures__';

describe('KeyAgreementKey', () => {
  it('deriveSecret', async () => {
    const key1 = await ed25519.Ed25519KeyPair.generate({
      seed: base64url.toBuffer(fixtures.client[0].seed),
    });
    const key2 = await key1.toX25519KeyPair(true);
    const keyAgreementKey = new KeyAgreementKey(key2);
    expect(keyAgreementKey.deriveSecret).toBeDefined();
    expect(await keyAgreementKey.toJson(true)).toEqual(
      fixtures.client[0].keyAgreementKey
    );
  });
});
