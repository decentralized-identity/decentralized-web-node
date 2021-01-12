import { OperationRequest, OperationResponse } from '../../types';

export const updateDocument = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, params, body } = request;

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

  const doc = body;
  if (docId !== doc.id) {
    return {
      status: 400,
      headers: {},
      body: undefined,
    };
  }

  await server.store.storeDocument(edvId, doc);

  return {
    status: 204,
    headers: {},
    body: undefined,
  };
};
