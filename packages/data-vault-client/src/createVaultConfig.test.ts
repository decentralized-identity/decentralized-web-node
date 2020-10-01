import * as ed25519 from '@transmute/did-key-ed25519';
import * as fixtures from './__fixtures__';
import { createVaultConfig } from './createVaultConfig';
import { KeyAgreementKey } from './KeyAgreementKey';
import { CapabilityInvoker } from './CapabilityInvoker';
import { Sha256HmacKey2019 } from './Sha256HmacKey2019';

describe('createVaultConfig', () => {
  it('works', async () => {
    const key1 = await ed25519.Ed25519KeyPair.generate({
      seed: Buffer.from(
        '9b937b81322d816cfab9d5a3baacc9b2a5febe4b149f126b3630f93a29527017',
        'hex'
      ),
    });
    const invoker = new CapabilityInvoker(key1);
    const key2 = await key1.toX25519KeyPair(true);
    const keyAgreementKey = new KeyAgreementKey(key2);
    const hmac = await Sha256HmacKey2019.fromJwk(
      fixtures.client[0].hmac.privateKeyJwk
    );
    const vaultConfig = await createVaultConfig(
      'primary',
      invoker,
      keyAgreementKey,
      hmac
    );
    expect(vaultConfig.id).toBeDefined();
    expect(vaultConfig.referenceId).toBeDefined();
    expect(vaultConfig.sequence).toBeDefined();
  });
});
