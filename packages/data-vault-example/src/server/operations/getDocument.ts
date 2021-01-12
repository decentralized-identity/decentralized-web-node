import { OperationRequest, OperationResponse } from '../../types';

export const getDocument = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, params } = request;
  const { edvId, docId } = params;

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

  const doc = await server.store.getDocument(edvId, docId);

  if (!doc) {
    return {
      status: 404,
      headers: {},
      body: {},
    };
  }

  return {
    status: 200,
    headers: {},
    body: doc,
  };
};
