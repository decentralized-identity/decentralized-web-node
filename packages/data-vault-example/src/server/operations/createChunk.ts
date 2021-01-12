import { OperationRequest, OperationResponse } from '../../types';

export const createChunk = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, method, path, headers, params, body } = request;

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

  const { edvId, docId } = params;

  const chunk = body;

  await server.store.createChunk(edvId, docId, chunk);

  return {
    status: 204,
    headers: {},
    body: undefined,
  };
};
