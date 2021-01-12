import { OperationRequest, OperationResponse } from '../../types';

export const getChunk = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, method, headers, path, params } = request;

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

  const { edvId, docId, chunkIndex } = params;

  const chunk = await server.store.getChunk(
    edvId,
    docId,
    parseInt(chunkIndex, 10)
  );

  if (!chunk) {
    return {
      status: 404,
      headers: {},
      body: undefined,
    };
  }

  return {
    status: 200,
    headers: {},
    body: chunk,
  };
};
