import { Sha256HmacKey2019 } from './Sha256HmacKey2019';
import * as fixtures from '../__fixtures__';

describe('Sha256HmacKey2019', () => {
  it('from jwk', async () => {
    const hmac = await Sha256HmacKey2019.fromJwk(
      fixtures.client[0].hmac.privateKeyJwk
    );
    expect(await hmac.toJson(true)).toEqual(fixtures.client[0].hmac);
  });

  it('create', async () => {
    const hmac = await Sha256HmacKey2019.create(fixtures.client[0].seed);
    expect(await hmac.toJson(true)).toEqual(fixtures.client[0].hmac);
  });
});
