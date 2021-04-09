import { ServerInstance } from '../../types';
import { documentLoader } from '../../client/__fixtures__/documentLoader';
import base64url from 'base64url';
const zcapVerify = require('http-signature-zcap-verify');

const jsigs = require('jsonld-signatures');

const { Ed25519Signature2018 } = jsigs.suites;

const pako = require('pako');

export const verifyCapabilityInvocation = async (
  server: ServerInstance,
  method: string,
  path: string,
  headers: any
): Promise<boolean> => {
  const url = `${server.baseUrl}${path}`;
  // This section needs to be cleaned up.
  // capbility invocation verification should be a pure function of the params
  // in the http request and the capabilities and revocations stores.
  // bedrock-edv uses a kind of middlewares for this, which has a signature which is more confusing,
  // since it parses and builds URLs from the same parameters that the request received...
  // This section of this implementation needs the most cleaning.

  const [, resourceAction] = headers['capability-invocation'].split(' ');
  // eslint-disable-next-line prefer-const
  let [, capability, , action] = resourceAction.split('"');

  let expectedRootCapability: any = capability;
  let expectedTarget: any = url;

  const edvId = expectedTarget.split('/')[4];

  const config = await server.store.getVaultById(edvId);

  if (!config) {
    throw new Error('cannot verify invocation on non existent edv');
  }

  const expectedController = config.controller;

  const expectedAction = action;

  if (capability.indexOf('http') === -1) {
    capability = JSON.parse(
      Buffer.from(pako.inflate(base64url.toBuffer(capability))).toString()
    );

    const invocationParts = capability.invocationTarget.split('/');

    const edvId = invocationParts[4];
    const docId = invocationParts[6];

    expectedTarget = [
      `${server.baseUrl}/edvs/${edvId}/documents/${docId}`,
      `${server.baseUrl}/edvs/${edvId}/documents`,
    ];

    expectedRootCapability = [
      `${server.baseUrl}/edvs/${edvId}/zcaps/documents/${docId}`,
      `${server.baseUrl}/edvs/${edvId}/zcaps/documents`,
    ];

    if (capability.id.indexOf(server.baseUrl) === -1) {
      const authorization = await server.store.getAuthorization(
        capability.id,
        capability.invocationTarget
      );
      if (!authorization) {
        return false;
      }
    }
  }

  if (expectedTarget.indexOf('/chunks') !== -1) {
    expectedTarget = url
      .split('/')
      .splice(0, 7)
      .join('/');
  }

  const getInvocationTarget = (url: string) => {
    const baseStorageUrl = `${server.baseUrl}/edvs/`;
    // look for `/edvs/<edvId>/zcaps/`
    let idx = url.indexOf(baseStorageUrl);
    if (idx !== 0) {
      return null;
    }

    // skip EDV ID
    const edvIdIdx = baseStorageUrl.length;
    idx = url.indexOf('/', edvIdIdx);
    if (idx === -1) {
      return null;
    }
    const edvId = `${baseStorageUrl}${url.substring(edvIdIdx, idx)}`;

    // skip `zcaps`
    idx = url.indexOf('zcaps/', idx + 1);
    if (idx === -1) {
      return null;
    }

    // valid root zcap invocation targets:
    // `/edvs/<edvId>/documents`
    // `/edvs/<edvId>/query`
    // `/edvs/<edvId>/authorizations`
    // root `/edvs/<edvId>/documents/...`
    const path = url.substr(idx + 6 /* 'zcaps/'.length */);
    if (
      !(
        ['documents', 'query', 'authorizations', 'revocations'].includes(
          path
        ) ||
        (path.startsWith('documents/') && path.length > 10)
      )
    ) {
      return null;
    }

    // return invocation target for the given root zcap URL
    return {
      target: `${edvId}/${path}`,
      edvId,
    };
  };

  const generateRootCapability = async ({ expectedController, url }: any) => {
    // this is a new config
    if (url === `${server.baseUrl}/edvs/zcaps/configs` && expectedController) {
      return {
        '@context': 'https://w3id.org/security/v2',
        id: url,
        invocationTarget: `${server.baseUrl}/edvs`,
        controller: expectedController,
      };
    }

    const result = getInvocationTarget(url);

    if (!result) {
      return null;
    }
    const { target, edvId } = result;

    const actualEdvId = edvId.split('/').pop() as string;

    // dynamically generate zcap for root capability
    const config = await server.store.getVaultById(actualEdvId);
    if (!config) {
      throw new Error(
        'cannot generate root capability for non existing vault ' + actualEdvId
      );
    }

    const { document } = await documentLoader(config.controller as string);

    return {
      '@context': 'https://w3id.org/security/v2',
      id: url,
      invocationTarget: target,
      controller: config.controller,
      invoker: config.controller,
      delegator: config.controller + document.capabilityDelegation[0],
    };
  };

  // wrap document loader to always generate root zcap from config
  // description in storage
  function _createWrappedDocumentLoader({
    expectedController,
    expectedTarget,
  }: any) {
    return async (url: string) => {
      if (url.startsWith('did:key:')) {
        return documentLoader(url);
      }

      if (url.startsWith('https://www.w3.org/ns/did/v1')) {
        return documentLoader(url);
      }

      // see if zcap is in storage
      const capability = await server.store.getAuthorization(
        url,
        expectedTarget
      );

      if (capability) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: capability,
        };
      }

      // dynamically generate zcap for root capability if applicable
      const zcap = await generateRootCapability({
        expectedController,
        url,
      });

      if (zcap) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: zcap,
        };
      }

      console.error('about to throw ' + url);
      throw new Error('unsupported wrapped document loader url ' + url);
    };
  }

  function _createGetInvokedCapability({ expectedController }: any) {
    return async ({ id, expectedTarget }: any) => {
      // if the capability is a root zcap generated by this server then its
      // `id` will map to an invocation target; if so, dynamically generate the
      // zcap as it is the root authority which is automatically authorized
      // console.log(id);

      const zcap = await generateRootCapability({
        expectedController,
        url: id,
      });

      if (zcap) {
        return zcap;
      }

      // must get capability from authorizations storage
      const capability = await server.store.getAuthorization(
        id,
        expectedTarget
      );

      if (capability) {
        return capability;
      }

      throw new Error('cannot find capability ' + id);
    };
  }

  const inspectCapabilityChain = async ({
    capabilityChain,
    capabilityChainMeta,
  }: any) => {
    // collect the capability IDs and delegators for the capabilities in the chain
    const capabilities = [];
    for (const [i, capability] of capabilityChain.entries()) {
      const [{ purposeResult }] = capabilityChainMeta[i].verifyResult.results;
      if (purposeResult && purposeResult.delegator) {
        capabilities.push({
          capabilityId: capability.id,
          delegator: purposeResult.delegator.id,
        });
      }
    }

    // const revoked = await brZCapStorage.revocations.isRevoked({ capabilities });
    const revoked = false;
    if (revoked) {
      return {
        valid: false,
        error: new Error(
          'One or more capabilities in the chain have been revoked.'
        ),
      };
    }

    return { valid: true };
  };

  const result = await zcapVerify.verifyCapabilityInvocation({
    url,
    method,
    headers,
    getInvokedCapability: _createGetInvokedCapability({ expectedController }),
    documentLoader: _createWrappedDocumentLoader({
      expectedController,
      expectedTarget,
    }),
    expectedHost: [headers.host],
    expectedTarget,
    expectedRootCapability,
    expectedAction,
    inspectCapabilityChain: inspectCapabilityChain,
    // TODO: support RsaSignature2018 and other suites?
    suite: [new Ed25519Signature2018()],
    allowTargetAttenuation: true,
  });

  if (!result.verified) {
    console.error({
      expectedController,
      expectedTarget,
      expectedRootCapability,
      expectedAction,
    });
    console.error(result);
  }

  return result.verified;
};
