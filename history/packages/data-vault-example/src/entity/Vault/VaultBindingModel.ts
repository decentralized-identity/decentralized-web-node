// "config": {
//   "id": "http://localhost:9876/edvs/3ab4603c-de7d-422c-a098-775d02fc08ef",
//   "sequence": 0,
//   "controller": "did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn",
//   "keyAgreementKey": {
//     "id": "did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn#z6LSn4Wq5XE4FgJ8jyKss1kL5Gqwsn7gVgsKpNEPGHMeCxQq",
//     "type": "X25519KeyAgreementKey2019"
//   },
//   "hmac": {
//     "id": "urn:multibase:uEqwxeY_UyPYkKFB8PVihJdLlrAQKeAh50Z3ay2QO1wzC",
//     "type": "Sha256HmacKey2019"
//   },
//   "referenceId": "data-model-guide"
// },

export interface VaultBindingModel {
  referenceId?: string;
  sequence: number;
  controller: string;
  keyAgreementKey: {
    id: string;
    type: string;
  };
  hmac: {
    id: string;
    type: string;
  };
}
