import { OperationRequest, OperationResponse } from '../../types';

export const getEdvs = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, query } = request;

  if (!headers['capability-invocation']) {
    console.warn(
      'no authorization required to get a vault config by reference?'
    );
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

  const { controller, referenceId } = query;
  if (!referenceId) {
    // query for all edvs controlled by controller not implemented yet
    // TODO: implement

    return {
      status: 500,
      headers: {},
      body: { message: 'Not implemented' },
    };
  }

  const vault = await server.store.getVaultByReferenceKey(
    controller,
    referenceId
  );

  if (!vault) {
    return {
      status: 200,
      headers: {},
      body: [],
    };
  }
  return {
    status: 200,
    headers: {},
    body: [vault.toExternal(server.baseUrl + '/edvs')],
  };
};
