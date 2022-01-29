
import { IdentityHub } from '../main.mjs';
import canonicalize from 'canonicalize';
import CID from 'cids';

const cidProps = {
  'descriptor': 'json',
  'attestation': 'json',
  'authorization': 'json'
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default {
  merge: function merge(target, source) {
    Object.entries(source).forEach(([key, value]) => {
      value && typeof value === 'object' ? 
      merge(target[key] = target[key] || {}, value) : 
      target[key] = value;
    });
    return target;
  },
  pick(source, entries){
    return entries.reduce((obj, key) => {
      if (key in source) obj[key] = source[key];
      return obj;
    }, {})
  },
  async dagifyMessage(message, options = {}){
    let ipfs = await (options?.hub?.ipfs || IdentityHub.ipfs);
    let dagified = {};
    let promises = [];
    if ('data' in message) {
      if (!message.descriptor.cid) {
        message.descriptor.cid = await ipfs.add(this.toEncodedArray(message.data)).then(obj => obj.cid);
        dagified.descriptor = message.descriptor;
      }
    }
    for (let prop in message) {
      if (cidProps[prop]) {
        promises.push(ipfs.dag.put(message[prop]).then(cid => dagified[prop] = cid));
      }
      else if (prop !== 'data') dagified[prop] = message[prop];
    }
    await Promise.all(promises);
    return dagified;
  },
  toEncodedArray(data){
    return data instanceof Uint8Array ? data : encoder.encode(typeof data === 'object' ? canonicalize(data) : data);
  },
  fromEncodedArray(data, format){ 
    let result;
    if (data instanceof Uint8Array) {
      result = decoder.decode(data);
      if (format === 'json') result = JSON.parse(result.toString());
      if (format === 'base64') result = Buffer.from(result).toString('base64');
    }
    return result;
  }
}