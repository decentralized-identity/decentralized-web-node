import fastify, {
  FastifyInstance,
  // FastifyRequest,
  // FastifyReply,
} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { ServerInstance } from '../types';

import { storeToFs } from '../entity/storeToFs';
import { ModelStore } from '../entity/ModelStore';
import { verifyCapabilityInvocation } from '../server/zcap/verifyCapabilityInvocation';

import routes from './routes';

export const getFastify = (): ServerInstance => {
  const opts = {};
  const server: FastifyInstance = fastify(opts);

  async function servicesConnector(server: FastifyInstance): Promise<void> {
    const baseUrl = process.env.EDV_BASE_URL || 'http://localhost:9876';

    server.decorate('baseUrl', baseUrl);

    const connectionString =
      process.env.MONGO_DB_CONNECTION_STRING ||
      'mongodb://localhost:27017/test';

    const connection = await ModelStore.getConnection(connectionString);
    const store = new ModelStore(connection, true);

    server.decorate('connectionString', connectionString);

    server.decorate('store', store);

    server.decorate('verifyCapabilityInvocation', verifyCapabilityInvocation);

    server.decorate('storeToFs', storeToFs);
  }

  server.register(fastifyPlugin(servicesConnector));
  server.get(
    '/',
    // TODO: add swagger
    async (_request: any, reply: any) => {
      return reply
        .status(200) //

        .send({
          hello: '💾  data vault.',
          baseUrl: (server as any).baseUrl,
        });
    }
  );

  server.register(routes, { prefix: '/edvs' });

  // uncomment these to debug
  // server.addHook('onRequest', (request: any, _reply: any, done: any) => {
  //   // Your code
  //   // if (request.headers['capability-invocation']) {
  //   //   console.log(request.url);
  //   // }

  //   done();
  // });

  // server.addHook(
  //   'onResponse',
  //   (request: FastifyRequest, reply: FastifyReply, done: Function) => {
  //     // your code
  //     console.log(
  //       'Response: ',
  //       reply.raw.statusCode,
  //       request.method,
  //       request.url
  //     );
  //     done();
  //   }
  // );

  // server.setErrorHandler((error: any, request: any, reply: any) => {
  //   console.error(request.url);
  //   console.error(error);
  //   return reply.status(500).send({
  //     message: error.message,
  //   });
  // });

  server.addHook(
    'onClose',
    async (instance: FastifyInstance, done: Function) => {
      await (instance as ServerInstance).store.close();
      done();
    }
  );

  return server as ServerInstance;
};
