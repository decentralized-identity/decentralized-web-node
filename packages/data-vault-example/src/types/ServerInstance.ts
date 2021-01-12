import { FastifyInstance } from 'fastify';

import { ModelStore } from '../entity/ModelStore';

export interface ServerInstance extends FastifyInstance {
  baseUrl: string;
  store: ModelStore;
  connectionString: string;
  verifyCapabilityInvocation: (
    server: ServerInstance,
    method: string,
    path: string,
    headers: object
  ) => Promise<boolean>;
}
