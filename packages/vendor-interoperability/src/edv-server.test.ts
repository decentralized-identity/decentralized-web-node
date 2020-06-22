import crypto from 'crypto';
import { testServer } from './edv-server-test-helper';
import mock from './mock-client';
import vendors from './vendors';

jest.setTimeout(20 * 1000);

Object.values(vendors).map((vendor: any) => {
  return describe(vendor.name, () => {
    beforeAll(async () => {
      const seed = await crypto.randomBytes(32);
      await mock.init({
        account_seed: seed.toString('hex'),
        // account_seed: vendor.account_seed,
        // vault_endpoint: 'http://localhost:8080/edvs',
        vault_endpoint: vendor.edv_base_url + vendor.edv_root,
      });
      // Uncomment to see the random did created for this rest run.
      // console.log(mock.account_controller);
    });
    testServer(mock);
  });
});
