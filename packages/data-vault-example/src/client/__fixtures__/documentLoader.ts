import didV1 from './contexts/did-v1.json';
import secV2 from './contexts/sec-v2.json';
import secV1 from './contexts/sec-v1.json';

import * as ed25519 from '@transmute/did-key-ed25519';

export const documentLoader = async (uri: string) => {
  if (uri === 'https://www.w3.org/ns/did/v1') {
    return {
      contextUrl: null,
      documentUrl: uri,
      document: didV1,
    };
  }

  if (uri === 'https://w3id.org/security/v2') {
    return {
      contextUrl: null,
      documentUrl: uri,
      document: secV2,
    };
  }

  if (uri === 'https://w3id.org/security/v1') {
    return {
      contextUrl: null,
      documentUrl: uri,
      document: secV1,
    };
  }

  if (uri.indexOf('did:key') === 0) {
    const resolutionResponse = await ed25519.driver.resolve(uri, {
      accept: 'application/did+ld+json',
    });
    return {
      contextUrl: null,
      documentUrl: uri,
      document: resolutionResponse.didDocument,
    };
  }

  throw new Error('unsupported uri ' + uri);
};
