import { validateSchema } from '../../validator';

import { OperationRequest, OperationResponse } from '../../types';

export const createEdv = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, headers, method, path, body } = request;

  if (!headers['capability-invocation']) {
    console.warn('no authorization requried to create a vault?');
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

  const config = body;

  validateSchema({ payload: config });

  if (config.referenceId) {
    const refEdv = await server.store.getVaultByReferenceKey(
      config.controller,
      config.referenceId
    );
    if (refEdv) {
      return {
        status: 409,
        headers: {},
        body: {},
      };
    }
  }

  const vault = await server.store.createVault(config);

  const location = vault.toExternal().id;

  return {
    status: 200,
    headers: {
      location,
    },
    body: vault.toExternal(server.baseUrl + '/edvs'),
  };
};
