import mock from './mock-client';

describe('mock-client', () => {
  it('init', async () => {
    expect(mock.account_seed).toBe(
      '7052adea8f9823817065456ecad5bf24dcd31a698f7bc9a0b5fc170849af4226'
    );
    expect(mock.vault_endpoint).toBe('http://localhost:9876/edvs');
    expect(mock.invocationSigner).toBeUndefined();
    await mock.init();
    expect(mock.invocationSigner).toBeDefined();
    expect(mock.account_controller).toBe(
      'did:key:z6MkwJSaEMnE4u6LiqrZV1BJHSkc9x8S4mTm3ArNL1m19BZR'
    );
  });
});
