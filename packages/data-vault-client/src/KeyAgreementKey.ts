export class KeyAgreementKey {
  public key: any;

  constructor(key: any) {
    this.key = key;
  }

  async deriveSecret({ publicKey }: any) {
    return this.key.deriveSecret({ publicKey });
  }

  async toJson(exportPrivateKey = false) {
    const keypair = this.key.toJsonWebKeyPair(exportPrivateKey);
    if (keypair.id.indexOf('#') === 0) {
      keypair.id = keypair.controller + keypair.id;
    }
    return keypair;
  }
}
