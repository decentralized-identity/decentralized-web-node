
import { IdentityHub } from '../main.mjs';

const cidProps = [
  'data',
  'descriptor',
  'attestation',
  'authorization'
]

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
    let cids = {};
    await Promise.all(cidProps.reduce((promises, prop) => {
      if (message[prop]) {
        promises.push(ipfs.dag.put(message[prop]).then(cid => cids[prop] = cid))
      }
    }, []));
    let dataCID = message.descriptor.cid;
    if (dataCID) cids.data = new CID(dataCID);
    else delete cids.data;
    return cids;
  }
}