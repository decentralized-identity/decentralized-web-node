export interface CapabilityProof {
  type: string; //"Ed25519Signature2018",
  created: string; //"2021-01-01T18:49:34Z",
  capabilityChain: string[]; //["http://localhost:9876/edvs/79031cb6-5596-4b2c-9d17-d1185b08972e/zcaps/documents/z19saUhqbzoGAAQVCLYGSPyCX"]
  jws: string;
  proofPurpose: string;
  verificationMethod: string;
}
