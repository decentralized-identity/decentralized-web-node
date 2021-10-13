
import Natives from './lib/natives.mjs';
import Storage from './lib/storage.mjs';
import Status from './lib/status.mjs';
import Interfaces from './lib/interfaces.mjs';
import Validator from './lib/schema-validation.mjs';
import DIDMethods from './did-methods/index.mjs';
import CID from 'cids';
import { v4 as uuidv4 } from 'uuid';
import { create as ipfsCreate } from 'ipfs-core';
import { parseJwk } from 'jose/jwk/parse';
import { FlattenedSign } from 'jose/jws/flattened/sign';
import { FlattenedEncrypt  } from 'jose/jwe/flattened/encrypt';
import { decodeProtectedHeader } from 'jose/util/decode_protected_header';

const IPFS = ipfsCreate();

const Features = Interfaces.FeatureDetectionRead();
  delete Features['@context'];
  delete Features['type'];

const textEncoder = new TextEncoder();
function toEncodedArray(data){
  return data instanceof Uint8Array ? data : textEncoder.encode(data)
}

const algs = {
  'Ed25519': 'EdDSA',
  'secp256k1': 'ES256K'
}

const commitStrategies = {
  replace: 0,
  delta: 1
}

const tableRegexp = /^(Profile|Collections|Actions|Permissions)/;

class IdentityHub {
  static ipfs = IPFS;
  static instances = {};
  static interfaces = Interfaces;
  static methods = DIDMethods;
  static features = Features;
  static async load (did, options = {}) {
    let method = IdentityHub.methods[did.split(':')[1]];
    if (!method) throw 'Unsupported DID Method';
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
    this.keyId = options.keyId;
    this.signing = options.signing || {};
    this.encryption = options.encryption || {};
    this.ddo = null;
    this.cacheTime = 0;
    this.cacheDuration = options.cacheDuration || 3600;
    this.sync = {};
    this.method = options.method; 
    this.storage = new Storage(this.baseId);
  }
  
  async resolve(){
    if (!this.ddo || new Date().getTime() - this.cacheTime > this.cacheDuration) {
      this.ddo = await this.method.resolve(did);
      this.cacheTime = new Date().getTime();
    }
    return this.ddo;
  }

  async getKey(id){
    id += id[0] === '#' ? '' : '#';
    let ddo = await this.resolve();
    let doc = ddo.didDocument;
    for (let prop of ['verificationMethods', 'authentication', 'keyAgreement']) {
      for (let key of doc[prop]) {
        if (key.id === id && key.publicKeyJwk) return key;
      }
    };
  }

  async getEndpoints(){

  }

  async sign (payload, options = {}){
    switch (options.format) {
      default:
        let privateJwk = options.privateJwk || this.signing.privateJwk;
        let alg = privateJwk.alg || algs[privateJwk.crv];
        return new FlattenedSign(toEncodedArray(payload))    
                    .setProtectedHeader({ alg: alg })
                    .sign(await parseJwk(privateJwk, alg))
                    
    }
  }

  async encrypt (payload, options = {}){
    switch (options.format) {
      default:
        let privateJwk = options.privateJwk || this.encryption.privateJwk;
        let alg = privateJwk.alg || algs[privateJwk.crv];
        return new FlattenedEncrypt(toEncodedArray(payload))
                    .setProtectedHeader({ alg: alg })
                    .encrypt(await parseJwk(privateJwk, alg));
    }
  }

  async compose(args){

    if (!(await Validator.validate(args.descriptor))) throw `Unsupported Interface invocation`;

    let ipfs = await IdentityHub.ipfs;
    let message =  {
      descriptor: args.descriptor
    };

    let descriptor = message.descriptor;
        descriptor.id = args.id || uuidv4();
        descriptor.format = 'json';
    
    if (args.encrypt && descriptor.data) {
      descriptor.format = 'jwe';
      descriptor.data = typeof args.encrypt === 'function' ?
        await args.encrypt(descriptor.data) :
        await this.encrypt(descriptor.data, { privateJwk: args.encrypt.privateJwk })
    }

    let dataNode = await ipfs.dag.put(descriptor.data);
    descriptor.data = dataNode.toString();
    
    if (args.sign) {
      let jws = typeof args.sign === 'function' ?
        await args.sign(descriptor) :
        await this.sign(descriptor, { privateJwk: args.sign.privateJwk });
      Object.assign(message, jws);
    }

    return message;
  }

  async commit(message){
    let descriptor = message.descriptor;

    if (!(await Validator.validate(descriptor))) throw `Unsupported Interface type`;
    if (!descriptor.id) throw 'Message does not have an ID';

    let ipfs = await IdentityHub.ipfs;
    let messageCID = await ipfs.dag.put(message);
    let messageID = messageCID.toString();
    if (await this.storage.get('stack', messageID)) return;

    let type = descriptor.type;
    let dataId = descriptor.data;
    let dataCID = new CID(dataId);

    return Promise.all([ // Could store these against stores located elsewhere
      ipfs.pin.addAll([messageCID, dataCID]), // Probably need to remove this and make it interface specific
      this.storage.set('stack', { message_id: messageID, descriptor_id: descriptor.id, data_id: dataId }),
      IdentityHub.interfaces?.[type](this, message)
    ]);
  }

  async process (request){
    
    let responses = await Promise.all(request.messages.map(async message => {

      let descriptor = message.descriptor;
      let Interface = IdentityHub.interfaces[descriptor.type];

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
        let response = await Interface(this, message);
        return {
          status: Status.getStatus(200),
          body: response
        }
      }
      catch(e) {
        return {
          status: Status.getStatus(500)
        };
      }

    }))

    return multiple ? { responses } : responses[0];
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

export {
  IdentityHub,
  IdentityHubInstance
};