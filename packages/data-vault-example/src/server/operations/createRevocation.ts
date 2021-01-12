import { OperationRequest, OperationResponse } from '../../types';

export const createRevocation = async (
  request: OperationRequest
): Promise<OperationResponse> => {
  const { server, method, path, headers, body } = request;

  const capability = body;

  if (!headers.authorization) {
    throw new TypeError('An http-signature header is required.');
  }

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

  await server.store.createRevocation(capability);

  return {
    status: 201,
    headers: {},
    body: capability,
  };
};
