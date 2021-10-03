
import Natives from './lib/natives.mjs';
import Storage from './lib/storage.mjs';
import Status from './lib/status.mjs';
import Interfaces from './lib/interfaces.mjs';
import Validator from './lib/schema-validation.mjs';
import DIDMethods from './did-methods/index.mjs';
import randomBytes from '@consento/sync-randombytes';
import CID from 'cids';
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

const storeRegexp = /^(Profile|Collections|Actions|Permissions)/;

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

    if (!Validator.schemas[args.content.type]) throw `Unsupported Interface invocation`;

    let ipfs = await IdentityHub.ipfs;
    let entry = {
      message: {
        content: args.content
      }
    };

    let content = entry.message.content;
        content.format = 'json';
        content.nonce = randomBytes(new Uint8Array(16)).join('');
    
    if (args.encrypt && content.data) {
      content.format = 'jwe';
      content.data = typeof args.encrypt === 'function' ?
        await args.encrypt(content.data) :
        await this.encrypt(content.data, { privateJwk: args.encrypt.privateJwk })
    }

    let dataNode = await ipfs.dag.put(content.data);
    content.data = dataNode.toString();
    
    if (args.sign) {
      let jws = typeof args.sign === 'function' ?
        await args.sign(content) :
        await this.sign(content, { privateJwk: args.sign.privateJwk });
      Object.assign(entry.message, jws);
    }

    let messageNode = await ipfs.dag.put(entry.message);
    entry.id = messageNode.toString()
    return entry;
  }

  async commit(entry){
    let ipfs = await IdentityHub.ipfs;
    let type = entry.message.content.type;
    let match = type.match(storeRegexp);
    if (!match) throw 'Not a supported object type';
    let dataId = entry.message.content.data;
    console.log(entry.message.content.data)
    let messageCID = new CID(entry.id);
    let dataCID = new CID(dataId);
    let Interface = IdentityHub.interfaces[type];
    return Promise.all([ // Could store these against stores located elsewhere
      ipfs.pin.addAll([messageCID, dataCID]),
      this.storage.set('stack', { id: entry.id, file: dataId }),
      Interface ?
        Interface(this.did, entry, entry.id) :
        this.storage.set(match[0].toLowerCase(), Object.assign({}, entry))
    ]);
  }

  async process (message){
    console.log(message);
    let multiple = Array.isArray(message);
    let responses = await Promise.all((multiple ? message : [message]).map(async msg => {

      let content = msg.content;
      let Interface = IdentityHub.interfaces[content.type];

      if (!Interface) {
        return {
          status: Status.getStatus(501)
        };
      }

      let valid = await Validator.validate(content);
      if (!valid) {
        return {
          status: Status.getStatus(400)
        };
      }

      let allow = await this.authorize(content).catch(e => false);
      if (!allow) {
        return {
          status: Status.getStatus(401)
        };
      }

      try {
        let response = await Interface(this.did, msg);
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