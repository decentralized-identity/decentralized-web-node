export class CapabilityInvoker {
  public key: any;

  constructor(key: any) {
    this.key = key;
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
