export class KeyAgreementKey {
  public id: string; // a (full) DID URL that resolved to a verification method.
  public type: string;
  public publicKeyBase58: string;
  public key: any;

  constructor(key: any) {
    this.key = key;
    const kp = this.key.toKeyPair();
    this.id = kp.id;
    this.type = kp.type;
    this.publicKeyBase58 = kp.publicKeyBase58;
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
