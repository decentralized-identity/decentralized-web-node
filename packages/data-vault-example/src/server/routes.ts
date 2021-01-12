import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { ServerInstance } from '../types';

import {
  createEdv,
  getEdvs,
  getEdv,
  createDocument,
  getDocument,
  updateDocument,
  createAuthorization,
  createRevocation,
  createChunk,
  getChunk,
  queryEdv,
} from './operations';

export default async (server: FastifyInstance): Promise<void> => {
  server.post(
    '/',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await createEdv({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );
  server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await getEdvs({
      server: server as ServerInstance,
      method: request.method,
      path: request.url,
      params: request.params,
      query: request.query,
      headers: request.headers,
      body: request.body,
    });
    return reply
      .status(response.status) //
      .headers(response.headers)
      .send(response.body);
  });
  server.get(
    '/:edvId',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await getEdv({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/query',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await queryEdv({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/documents',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await createDocument({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );
  server.get(
    '/:edvId/documents',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await getDocument({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.get(
    '/:edvId/documents/:docId',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await getDocument({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/documents/:docId',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await updateDocument({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/documents/:docId/chunks/:chunkIndex',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await createChunk({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status)
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.get(
    '/:edvId/documents/:docId/chunks/:chunkIndex',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await getChunk({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/authorizations',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await createAuthorization({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );

  server.post(
    '/:edvId/revocations',
    // TODO: add swagger
    async (request: FastifyRequest, reply: FastifyReply) => {
      const response = await createRevocation({
        server: server as ServerInstance,
        method: request.method,
        path: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers,
        body: request.body,
      });
      return reply
        .status(response.status) //
        .headers(response.headers)
        .send(response.body);
    }
  );
};
