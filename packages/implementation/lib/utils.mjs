
import { IdentityHub } from '../main.mjs';
import canonicalize from 'canonicalize';
import CID from 'cids';

const cidProps = [
  'data',
  'descriptor',
  'attestation',
  'authorization'
]

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
  async getMessageCIDs(message){
    let ipfs = await IdentityHub.ipfs;
    let cids = {}
    await Promise.all(cidProps.reduce((promises, prop) => {
      if (message[prop]) {
        promises.push(ipfs.add(this.toEncodedArray(message[prop])).then(cid => cids[prop] = cid.path));
      }
      return promises;
    }, []));
    let dataCID = message.descriptor.cid; 
    if (dataCID) cids.data = dataCID;
    else delete cids.data;
    return cids;
  },
  toEncodedArray(data){
    return data instanceof Uint8Array ? data : encoder.encode(typeof data === 'object' ? canonicalize(data) : data);
  },
  fromEncodedArray(data, parse){ 
    let result;
    if (data instanceof Uint8Array) {
      result = decoder.decode(data);
      if (parse === true) result = JSON.parse(result.toString());
    }
    console.log(data instanceof Uint8Array, parse, typeof result, result);
    return result;
  }
}