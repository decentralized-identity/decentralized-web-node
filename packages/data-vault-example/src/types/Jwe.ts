export interface JweRecipient {
  header: {
    kid: string;
    alg: 'ECDH-ES+A256KW';
    epk: {
      kty: string;
      crv: string;
      x: string;
    };
    apu: string;
    apv: string;
  };
  encrypted_key: string;
}

export interface Jwe {
  protected: string;
  recipients: JweRecipient[];
  iv: string;
  ciphertext: string;
  tag: string;
}
