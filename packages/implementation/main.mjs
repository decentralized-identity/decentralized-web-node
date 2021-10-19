
import Utils from './lib/utils.mjs';
import { DID } from './lib/did.mjs';
import Storage from './lib/storage.mjs';
import Status from './lib/status.mjs';
import Interfaces from './lib/interfaces.mjs';
import Validator from './lib/schema-validation.mjs';
import CID from 'cids';

import { v4 as uuidv4 } from 'uuid';
import base64url from 'base64url';
import fetch from 'cross-fetch';
import { create as ipfsCreate } from 'ipfs-core';
import { parseJwk } from 'jose/jwk/parse';
import { FlattenedSign } from 'jose/jws/flattened/sign';
import { FlattenedEncrypt  } from 'jose/jwe/flattened/encrypt';

const IPFS = ipfsCreate();

const algs = {
  'Ed25519': 'EdDSA',
  'secp256k1': 'ES256K'
}

const Features = Interfaces.FeatureDetectionRead();
  delete Features['@context'];
  delete Features['type'];

const textEncoder = new TextEncoder();
function toEncodedArray(data){
  return data instanceof Uint8Array ? data : textEncoder.encode(data)
}

async function sign (payload, options = {}){
  switch (options.format) {
    default:
      let privateJwk = options.privateJwk;
      let alg = privateJwk.alg || algs[privateJwk.crv];
      return new FlattenedSign(toEncodedArray(payload))    
                  .setProtectedHeader({ alg: alg })
                  .sign(await parseJwk(privateJwk, alg))           
  }
}

async function encrypt (payload, options = {}){
  switch (options.format) {
    default:
      let privateJwk = options.privateJwk;
      let alg = privateJwk.alg || algs[privateJwk.crv];
      return new FlattenedEncrypt(toEncodedArray(payload))
                  .setProtectedHeader({ alg: alg })
                  .encrypt(await parseJwk(privateJwk, alg));
  }
}

const autoIdMethods = /(Write|Create)$/i;

const Messages = {

  async compose(args){
    if (!(await Validator.validate(args.descriptor))) throw `Unsupported Interface invocation`;

    let ipfs = await IdentityHub.ipfs;
    let message =  {
      content: {
        descriptor: args.descriptor
      }
    };

    let content = message.content;
    let descriptor = content.descriptor;
        if (descriptor.method.match(autoIdMethods)) {
          descriptor.id = descriptor.id || uuidv4();
        }
        if (descriptor.cid || content.data) {
          descriptor.clock = descriptor.clock || 0;
          descriptor.format = descriptor.format || 'json'; 
        }
        if (args.publish) {
          descriptor.datePublished = typeof args.publish === 'string' ? args.publish : Date.now();
        }
    
    if (args.data) {
      if (args.encrypt) {
        descriptor.encryption = 'jwe';
        content.data = typeof args.encrypt === 'function' ?
          await args.encrypt(args.data) :
          await encrypt(args.data, { privateJwk: args.encrypt.privateJwk })
      }
      else content.data = args.data;
      let dataNode = await ipfs.dag.put(content.data);
      descriptor.cid = dataNode.toString();
    }

    if (args.sign) {
      let jws = typeof args.sign === 'function' ?
        await args.sign(descriptor) :
        await sign(descriptor, { privateJwk: args.sign.privateJwk });
      Object.assign(content, jws);
    }
    return message;
  },

  async send(did, messages, options = {}){
    
    let endpoints = options.endpoints;
    if (!endpoints) {
      let service = await DID.getService(did);
      if (service && service.serviceEndpoint) {
        endpoints = Array.isArray(service.serviceEndpoint) ? service.serviceEndpoint : [service.serviceEndpoint];
      }
    }

    if (!endpoints) throw 'DID has no Identity Hub endpoints';
    else if (options.skipEndpoints) {
      endpoints = endpoints.filter(url => !options.skipEndpoints.includes(url));
    }

    for (let url of endpoints) {
      try {
        let response = (await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: uuidv4(),
            target: did,
            messages: messages
          })
        })).json();
        return response;
      }
      catch(e){
        console.log(e);
      }
    }
    throw 'Identity Hub message attempts failed';
  }
}

const IdentityHub = {
  instances: {},
  ipfs: IPFS,
  features: Features,
  interfaces: Interfaces,
  async load (did, options = {}) {
    let method = DID.getMethod(did);
    let baseId = await method.getBaseId(did);
    let instance = IdentityHub.instances[baseId];
    if (!instance) {
      instance = IdentityHub.instances[baseId] = new IdentityHubInstance(did, Object.assign(options, {
        baseId: baseId,
        method: method
      }));
    }
    return instance;
  }
}

class IdentityHubInstance {

  constructor(did, options = {}){
    this.did = did;
    this.baseId = options.baseId || did;
    this.endpoint = options.endpoint;
    this.keyId = options.keyId;
    this.signing = options.signing || {};
    this.encryption = options.encryption || {};
    this.sync = {};
    this.method = options.method; 
    this.storage = new Storage(this.baseId);
  }

  async composeMessage(args){
    if (args.sign) {
      args.sign = typeof args.sign === 'function' ? args.sign : this.signing
    }
    if (args.encrypt) {
      args.encrypt = typeof args.encrypt === 'function' ? args.encrypt : this.encryption
    }
    return Messages.compose(args);
  }

  async commitMessage(message){
    let content = message.content;
    let descriptor = content.descriptor;

    if (!(await Validator.validate(descriptor))) throw `Unsupported Interface type`;
    if (!descriptor.id) throw 'Message does not have an ID';

    let messageCID = await Utils.putMessage(message);
    let messageID = messageCID.toString();
    if (await this.storage.get('stack', messageID)) return;

    let ipfs = await IdentityHub.ipfs;
    let pins = [messageCID];
    if (descriptor.cid) {
      pins.push(new CID(descriptor.cid));
    }
    
    return Promise.all([ // Could store these against stores located elsewhere
      ipfs.pin.addAll(pins), // Probably need to remove this and make it interface specific
      this.storage.set('stack', { message_id: messageID, descriptor_id: descriptor.id, data_id: descriptor.cid })
    ]);
  }

  async generateRequest(messages){
    return Messages.send(this.did, messages, {
      skipEndpoints: [this.endpoint]
    })
  }

  async handleRequest(request){
    let responses = await Promise.all(request.messages.map(async message => {
      return this.processMessage(message)
    }));
    return { id: request.id, responses };
  }

  async processMessage (message){  
    let descriptor = message.content.descriptor;
    let Interface = IdentityHub.interfaces[descriptor.method];
    
    if (!Interface) {
      return {
        status: Status.getStatus(501)
      };
    }

    let valid = await Validator.validate(descriptor);
    if (!valid) {
      return {
        status: Status.getStatus(400)
      };
    }

    let allow = await this.authorize(message).catch(e => false);
    if (!allow) {
      return {
        status: Status.getStatus(401)
      };
    }

    try {
      let result = await Interface(this, message);
      let response = {
        status: Status.getStatus(200)
      };
      if (result) response.content = result;
      return response;
    }
    catch(e) {
      console.log(e);
      return {
        status: Status.getStatus(500)
      };
    }
  }

  async authorize (entry){ // Could go elsewhere to diagnose authz
    // let header = decodeProtectedHeader(token);
    // let url = new URL(header.didKeyUrl);
    // let did = 'did:' + url.pathname;
    // let baseId = this.method.getBaseId(did);
    // if (this.baseId === baseId) {
    //   let ddo = await this.resolve();
      
    // }
    return true;
  }

}

export { IdentityHub, DID, Messages };