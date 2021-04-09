import crypto from './crypto';

describe('isomorphic web crypto', () => {
  it('has subtle', async () => {
    expect(crypto.subtle).toBeDefined();
  });
});
