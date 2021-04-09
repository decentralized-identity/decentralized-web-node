import { Ed25519KeyPair } from 'crypto-ld';
import { X25519KeyPair } from 'x25519-key-pair';
import { didSeed } from './config';
const { keyToDidDoc } = require('did-method-key').driver();

describe('did', () => {
  it('should generate a did doc from seed', async () => {
    const ed25519Key = await Ed25519KeyPair.generate({
      seed: Buffer.from(didSeed, 'hex'),
    });
    const didDocument = keyToDidDoc(ed25519Key);
    ed25519Key.id = didDocument.publicKey[0].id;
    ed25519Key.controller = didDocument.publicKey[0].controller;
    // console.log(JSON.stringify(ed25519Key, null, 2));
    expect(ed25519Key.id).toBe(
      'did:key:z6MkwJSaEMnE4u6LiqrZV1BJHSkc9x8S4mTm3ArNL1m19BZR#z6MkwJSaEMnE4u6LiqrZV1BJHSkc9x8S4mTm3ArNL1m19BZR'
    );
    const x25519Key = X25519KeyPair.fromEdKeyPair(ed25519Key);
    x25519Key.id = didDocument.keyAgreement[0].id;
    x25519Key.controller = didDocument.keyAgreement[0].controller;
    // console.log(JSON.stringify(x25519Key, null, 2));
    expect(x25519Key.id).toBe(
      'did:key:z6MkwJSaEMnE4u6LiqrZV1BJHSkc9x8S4mTm3ArNL1m19BZR#z6LSnHCakA8zvH61bCXv7goaT2MyVf8PjfW7XjeKTEGCgG9N'
    );
  });
});
