"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolver = {
    lookup: function (id) {
        return new Promise(function (resolve, reject) {
            switch (id) {
                case 'bob.id':
                    resolve({
                        ddo: {
                            '@context': 'https://example.org/did/v1',
                            id: 'did:sov:21tDAKCERh95uGgKbJNHYp',
                            owner: [
                                {
                                    id: 'did:sov:21tDAKCERh95uGgKbJNHYp#key-3',
                                    type: ['CryptographicKey', 'secp256k1PublicKey'],
                                    expires: '2017-03-22T00:00:00Z',
                                    publicKeyHex: '04d94b283060e23de26d11ad9b4ed3127c98506ac144f8767f7dc48a28623f63997796c8e737e79fa6bf40d096929938bb5e3bedd8f79b915539e82b69d52a7d1d'
                                    // private key: d276057693c73633a841bf9e532f172ba8c504fea1990d6ced61bf15c295641b
                                }
                            ],
                            control: [
                                {
                                    type: 'OrControl',
                                    signer: [
                                        'did:sov:21tDAKCERh95uGgKbJNHYp',
                                        'did:sov:8uQhQMGzWxR8vw5P3UWH1j'
                                    ]
                                }
                            ],
                            service: {
                                openid: 'https://openid.example.com/456',
                                xdi: 'https://xdi.example.com/123'
                            },
                            created: '2002-10-10T17:00:00Z',
                            updated: '2016-10-17T02:41:00Z',
                            signature: {
                                type: 'RsaSignature2016',
                                created: '2016-02-08T16:02:20Z',
                                creator: 'did:sov:8uQhQMGzWxR8vw5P3UWH1j#key-1',
                                signatureValue: 'IOmA4R7TfhkYTYW87z640O3GYFldw0yqie9Wl1kZ5OBYNAKOwG5uOsPRK8/2C4STOWF+83cMcbZ3CBMq2/gi25s='
                            }
                        }
                    });
                    break;
                case 'alice.id':
                    resolve({
                        ddo: {
                            '@context': 'https://example.org/did/v1',
                            id: 'did:btcr:21tDAKCERh95uGgKbJNHYp',
                            owner: [
                                {
                                    id: 'did:btcr:21tDAKCERh95uGgKbJNHYp#key-3',
                                    type: ['CryptographicKey', 'secp256k1PublicKey'],
                                    expires: '2017-03-22T00:00:00Z',
                                    publicKeyHex: '04b053d9425db45075c1f16f39433d8e5a2b141896e6b51fda437f74ef344a688f8d615611069e04747e087ef527cbf8228246d0a84bf1b7c07164461f01baa743'
                                    // private key: 89577325fb9400fcc278c50aed7a55eb6db9a97d61d38e0b1bb9fd14d0a1e72e
                                }
                            ],
                            control: [
                                {
                                    type: 'OrControl',
                                    signer: [
                                        'did:btcr:21tDAKCERh95uGgKbJNHYp',
                                        'did:btcr:8uQhQMGzWxR8vw5P3UWH1j'
                                    ]
                                }
                            ],
                            service: {
                                openid: 'https://openid.example.com/456',
                                xdi: 'https://xdi.example.com/123'
                            },
                            created: '2002-10-10T17:00:00Z',
                            updated: '2016-10-17T02:41:00Z',
                            signature: {
                                type: 'RsaSignature2016',
                                created: '2016-02-08T16:02:20Z',
                                creator: 'did:btcr:8uQhQMGzWxR8vw5P3UWH1j#key-1',
                                signatureValue: 'IOmA4R7TfhkYTYW87z640O3GYFldw0yqie9Wl1kZ5OBYNAKOwG5uOsPRK8/2C4STOWF+83cMcbZ3CBMq2/gi25s='
                            }
                        }
                    });
                    break;
                default: reject('not found');
            }
        });
    },
    auth: function (did, request) {
        return true;
    }
};
exports.default = resolver;
//# sourceMappingURL=index.js.map