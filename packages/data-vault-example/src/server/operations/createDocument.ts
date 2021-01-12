import { OperationRequest, OperationResponse } from '../../types';

export const createDocument = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, method, headers, path, params, body } = request;
  // console.log(headers);

  if (!headers['authorization']) {
    return {
      status: 401,
      headers: {},
      body: { message: 'authorization header is required' },
    };
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

  const { edvId } = params;
  const doc = body;

  const vault = await server.store.getVaultById(edvId);

  if (!vault) {
    return {
      status: 404,
      headers: {},
      body: undefined,
    };
  }

  if (await server.store.getDocument(edvId, doc.id)) {
    return {
      status: 409,
      headers: {},
      body: undefined,
    };
  }

  try {
    await server.store.storeDocument(edvId, doc, true);
  } catch (e) {
    console.error(e);
    return {
      status: 409,
      headers: {},
      body: undefined,
    };
  }

  const location = `${edvId}/documents/${doc.id}`;

  return {
    status: 201,
    headers: {
      location,
    },
    body: undefined,
  };
};
