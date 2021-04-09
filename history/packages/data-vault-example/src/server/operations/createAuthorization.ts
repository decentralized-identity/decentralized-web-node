import { OperationRequest, OperationResponse } from '../../types';

export const createAuthorization = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, body } = request;

  const capability = body;
  if (!capability) {
    throw new TypeError('"capability" is required');
  }
  if (!capability.id) {
    throw new TypeError('"capability.id" is required');
  }
  if (typeof capability.id !== 'string') {
    throw new TypeError('"capability.id" must be a string');
  }
  if (!capability['@context']) {
    throw new TypeError('"capability[@context]" is required');
  }
  if (!capability.invoker) {
    throw new TypeError('"capability.invoker" is required');
  }
  if (!capability.parentCapability) {
    throw new TypeError('"capability.parentCapability" is required');
  }

  if (!headers['capability-invocation']) {
    return {
      status: 400,
      headers: {},
      body: { message: 'capability-invocation header is required' },
    };
  } else {
    const verified = await server.verifyCapabilityInvocation(
      server,
      method as string,
      path as string,
      headers
    );

    if (!verified) {
      return {
        status: 403,
        headers: {},
        body: { message: 'capability invocation verification failed' },
      };
    }
  }
  // need to verify deledation  before saving
  // exports.verifyDelegation = async ({ capability, edvId }) => {
  //   const invocationTarget =
  //     typeof capability.invocationTarget === 'string'
  //       ? capability.invocationTarget
  //       : capability.invocationTarget.id;
  //   const documentLoader = extendContextLoader(async (url) => {
  //     if (url.startsWith('did:key:')) {
  //       return _documentLoader(url);
  //     }

  //     // dynamically generate zcap for root capability if applicable
  //     const zcap = await exports.generateRootCapability({ url });
  //     if (zcap) {
  //       return {
  //         contextUrl: null,
  //         documentUrl: url,
  //         document: zcap,
  //       };
  //     }

  //     // see if zcap is in storage
  //     try {
  //       const { authorization } = await brZCapStorage.authorizations.get({
  //         id: url,
  //         invocationTarget,
  //       });
  //       return {
  //         contextUrl: null,
  //         documentUrl: url,
  //         document: authorization.capability,
  //       };
  //     } catch (e) {
  //       if (e.name !== 'NotFoundError') {
  //         throw e;
  //       }
  //     }

  //     return _documentLoader(url);
  //   });
  //   const expectedRootCapability = _getExpectedRootCapability({
  //     invocationTarget,
  //     edvId,
  //   });
  //   const { verified, error } = await jsigs.verify(capability, {
  //     suite: new Ed25519Signature2018(),
  //     purpose: new CapabilityDelegation({
  //       expectedRootCapability,
  //       suite: new Ed25519Signature2018(),
  //     }),
  //     documentLoader,
  //     compactProof: false,
  //   });
  //   if (!verified) {
  //     throw error;
  //   }
  // };

  await server.store.createCapability(capability);

  return {
    status: 201,
    headers: {},
    body: capability,
  };
};
