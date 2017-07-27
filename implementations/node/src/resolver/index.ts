const resolver = {
  resolve: function(id) {
    return new Promise(function(resolve, reject) {
      resolve({
        did: 'did:btcr:123',
        ddo: {
          '@context': 'https://example.org/did/v1',
          id: 'did:sov:21tDAKCERh95uGgKbJNHYp',
          owner: [
            {
              id: 'did:sov:21tDAKCERh95uGgKbJNHYp#key-1',
              type: ['CryptographicKey', 'EdDsaPublicKey'],
              curve: 'ed25519',
              expires: '2017-02-08T16:02:20Z',
              publicKeyBase64: 'lji9qTtkCydxtez/bt1zdLxVMMbz4SzWvlqgOBmURoM='
            },
            {
              id: 'did:sov:21tDAKCERh95uGgKbJNHYp#key-2',
              type: ['CryptographicKey', 'RsaPublicKey'],
              expires: '2017-03-22T00:00:00Z',
              publicKeyPem:
                '----BEGIN PUBLIC KEY-----\r\nMIIBOgIBAAJBAKkbSUT9/Q2uBfGRau6/XJyZhcF5abo7b37I5hr3EmwGykdzyk8GSyJK3TOrjyl0sdJsGbFmgQaRyV\r\n-----END PUBLIC KEY-----'
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
            signatureValue:
              'IOmA4R7TfhkYTYW87z640O3GYFldw0yqie9Wl1kZ5OBYNAKOwG5uOsPRK8/2C4STOWF+83cMcbZ3CBMq2/gi25s='
          }
        }
      });
    });
  },
  auth: function(did, request) {
    return true;
  }
};

export default resolver;
