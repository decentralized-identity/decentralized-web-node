import { CapabilityInvoker } from './CapabilityInvoker';
import * as ed25519 from '@transmute/did-key-ed25519';

import base64url from 'base64url';
import * as fixtures from './__fixtures__';

describe('CapabilityInvoker', () => {
  it('sign', async () => {
    const key = await ed25519.Ed25519KeyPair.generate({
      seed: base64url.toBuffer(fixtures.client[0].seed),
    });
    const invoker = new CapabilityInvoker(key);
    expect(invoker.sign).toBeDefined();
    expect(await invoker.toJson(true)).toEqual(fixtures.client[0].invoker);
  });
});
