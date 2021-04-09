import { OperationRequest, OperationResponse } from '../../types';

export const getEdv = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, params } = request;

  if (!headers['capability-invocation']) {
    console.warn('no authorization required to get a vault config?');
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

  const { edvId } = params;
  const config = await server.store.getVaultById(edvId);
  if (!config) {
    return {
      status: 404,
      headers: {},
      body: {},
    };
  }

  return {
    status: 200,
    headers: {},
    body: config,
  };
};
