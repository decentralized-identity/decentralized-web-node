const _x25519Expected = {
  kid: 'urn:123',
  alg: 'ECDH-ES+A256KW',
  crv: 'X25519',
  kty: 'OKP',
};

// recipient should be JOSE
// @see https://tools.ietf.org/html/rfc8037
export function isRecipient({ recipient, expected = _x25519Expected }: any) {
  const { kid, alg, crv, kty } = expected;
  expect(recipient).toBeInstanceOf(Object);

  // Expected recipient.header
  expect(recipient.header).toBeDefined();
  expect(recipient.header).toBeInstanceOf(Object);
  const { header } = recipient;

  // there should be a kid with the KaK's id.
  // Expected header.kid to exist
  expect(header.kid).toBeDefined();
  expect(typeof header.kid).toBeDefined();
  // Expected header.kid to match ${kid}
  expect(header.kid).toBe(kid);

  // there should be an algorithm property set to ECDH-ES+A256KW
  // Expected header.alg to exist
  expect(header.alg).toBeDefined();
  expect(typeof header.alg).toBeDefined();
  // Expected alg to match ${alg}
  expect(header.alg).toBe(alg);

  // Expected Agreement PartyUInfo to exist
  expect(header.apu).toBeDefined();
  expect(typeof header.apu).toBeDefined();

  // Expected Agreement PartyVInfo to exist
  expect(header.apv).toBeDefined();
  expect(typeof header.apv).toBeDefined();

  // Expected ephemeral public key to exist
  expect(header.epk).toBeDefined();
  expect(header.epk).toBeInstanceOf(Object);

  // Expected header.epk.crv to exist
  expect(header.epk.crv).toBeDefined();
  expect(typeof header.epk.crv).toBeDefined();
  // Expected header.epk.crv to match ${crv}
  expect(header.epk.crv).toBe(crv);

  // Expected header.epk.kty to exist
  expect(header.epk.kty).toBeDefined();
  expect(typeof header.epk.kty).toBeDefined();
  // Expected header.epk.kty to match ${kty}
  expect(header.epk.kty).toBe(kty);

  // Expected header.epk.x to exist
  expect(header.epk.x).toBeDefined();
  expect(typeof header.epk.x).toBeDefined();
}
