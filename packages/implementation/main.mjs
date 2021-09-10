
import Natives from './lib/natives.mjs';
import Storage from './lib/storage.mjs';
import Interfaces from './lib/interfaces.mjs';
import Validator from './lib/schema-validation.mjs';
import DIDMethods from './did-methods/index.mjs';
import randomBytes from '@consento/sync-randombytes';
import CID from 'cids';
import { create as ipfsCreate } from 'ipfs-core';
import { parseJwk } from 'jose/jwk/parse';
import { CompactEncrypt } from 'jose/jwe/compact/encrypt';
import { CompactSign } from 'jose/jws/compact/sign';
import { decodeProtectedHeader } from 'jose/util/decode_protected_header';
// import { JWS, JWE } from '@transmute/jose-ld';
// import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
// import { X25519KeyPair } from '@transmute/x25519-key-pair';

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
        return new CompactSign(payload)
                    .setProtectedHeader(Object.assign({}, options.header || {}, { alg: alg }))
                    .sign(await parseJwk(privateJwk, alg))
    }
  }

  async encrypt (payload, options = {}){
    switch (options.format) {
      default:
        let privateJwk = options.privateJwk || this.encryption.privateJwk;
        let alg = privateJwk.alg || algs[privateJwk.crv];
        return new CompactEncrypt(toEncodedArray(payload))
                    .setProtectedHeader(Object.assign({}, options.header || {}, { alg: alg }))
                    .encrypt(await parseJwk(privateJwk, alg));
    }
  }

  async compose(args){
    let message = args.message;

    if (!Validator.schemas[message.type]) throw `Unsupported Interface invocation`;
    
    let ipfs = await IdentityHub.ipfs;
    let data = message.data;
    let header = Natives.pick(message, ['type', 'schema', 'tags', 'root', 'parent']);
    header.nonce = randomBytes(new Uint8Array(16)).join('');

    if (args.encrypt) {
      data = typeof args.sign === 'function' ?
              await args.encrypt(data, { header }) :
              await this.encrypt(data, { header, privateJwk: args.sign.privateJwk })
    }

    let dataNode = await ipfs.dag.put(data);

    let entry = Object.assign({}, header, {
      data: {
        format: args.encrypt ? 'jwe' : 'raw',
        id: dataNode.toString()
      }
    });

    if (args.sign) {
      let payload = toEncodedArray(JSON.stringify({
        id: entry.data.id
      }));
      entry.signature = {
        format: 'jws',
        payload: typeof args.sign === 'function' ?
                  await args.sign(payload, { header }) :
                  await this.sign(payload, { header, privateJwk: args.sign.privateJwk })
      }
    }

    let composedNode = await ipfs.dag.put(entry);
    return {
      id: composedNode.toString(),
      node: (await ipfs.dag.get(composedNode)).value
    }
  }

  async commit(node, id){
    let ipfs = await IdentityHub.ipfs;
    let entryCID = new CID(id);
    node = node || (await ipfs.dag.get(entryCID)).value;
    let type = node.type;
    let match = type.match(storeRegexp);
    if (!match) throw 'Not a supported object type';
    let dataCID = new CID(node.data.id);
    let Interface = IdentityHub.interfaces[type];
    return Promise.all([ // Could store these against stores located elsewhere
      ipfs.pin.addAll([entryCID, dataCID]),
      this.storage.set('stack', { id: id, file: node.data.id }),
      Interface ?
        Interface(this.did, node, id) :
        this.storage.set(match[0].toLowerCase(), Object.assign({}, node, { id: id }))
    ]);
  }

  async process (entry){
    let Interface = IdentityHub.interfaces[entry.type];
    if (!Interface) {
      throw {
        statusCode: 501,
        message: `
          The interface method invoked is not supported by this Identity Hub implementation. 
          Invoke a FeatureDetectionRead to discover supported interfaces.
        `
      };
    }
    await Validator.validate(entry);
    let allow = await this.authorize(entry).catch(e => false);
    if (!allow) throw 'Payload contains unathorized invocations';
    return Interface(this.did, entry);
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