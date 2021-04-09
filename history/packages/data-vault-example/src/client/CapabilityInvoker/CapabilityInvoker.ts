// todo: this class must be modified to only support base58
// for compatibility with db
export class CapabilityInvoker {
  public id: string; // a DID URL that resolved to a verification method.
  public key: any;

  constructor(key: any) {
    this.key = key;

    if (key.id.indexOf('#') === 0) {
      this.id = key.controller + key.id;
    } else {
      this.id = key.id;
    }
  }

  async sign({ data }: any) {
    const signer = this.key.signer();
    return signer.sign({ data });
  }

  async toJson(exportPrivateKey = false) {
    const keypair = this.key.toJsonWebKeyPair(exportPrivateKey);
    if (keypair.id.indexOf('#') === 0) {
      keypair.id = keypair.controller + keypair.id;
    }
    delete keypair.publicKeyJwk.kid;
    delete keypair.privateKeyJwk.kid;
    return keypair;
  }
}
