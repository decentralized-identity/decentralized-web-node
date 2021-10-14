
import { IdentityHub } from '../main.mjs';

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
  async putMessage(message){
    let ipfs = await IdentityHub.ipfs;
    let data = message.content.data;
    delete message.content.data;
    let cid = await ipfs.dag.put(message);
    message.content.data = data;
    return cid;
  }
}