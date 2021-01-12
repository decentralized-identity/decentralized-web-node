import { OperationRequest, OperationResponse } from '../../types';

export const queryEdv = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, body, params } = request;

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

  const query = body;
  const { edvId } = params;
  try {
    const results = await server.store.queryEdv(edvId, query);
    return {
      status: 200,
      headers: {},
      body: results,
    };
  } catch (e) {
    if (e.message === 'Vault does not exist') {
      return {
        status: 404,
        headers: {},
        body: undefined,
      };
    }

    if (e.message === 'Vault index does not exist') {
      return {
        status: 404,
        headers: {},
        body: undefined,
      };
    }
    console.log(e);
    return {
      status: 500,
      headers: {},
      body: { message: e.message },
    };
  }
};
