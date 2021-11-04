
import CID from 'cids';
import Utils from './utils.mjs';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(entry){
  let ipfs = await IdentityHub.ipfs;
  return await Promise.all(entry.messages.map(async message => {
    let result = { descriptor: message.descriptor };
    let cid = message.descriptor.parameters.cid;
    if (cid) {
      result.data = await ipfs.dag.get(new CID(cid)).then(z => z.value);
    }
    return result;
  }));
}

async function deleteMessages(hub, table, entry, deleteEntry){
  let ipfs = await IdentityHub.ipfs;
  // console.log(2, typeof entry.messages, JSON.stringify(entry.messages, null, 2));
  let promises = entry.messages.map(async msg => ipfs.pin.rmAll([
    await Utils.putMessage(msg),
    new CID(msg.content.descriptor.cid)
  ]))
  if (deleteEntry) promises.push(hub.storage.delete(table, entry.id))
  return Promise.all(promises);
}

const Interfaces = {
  async FeatureDetectionRead(){
    return Object.assign({
      "@context": "https://identity.foundation/schemas/hub",
      "type": "FeatureDetection",
    }, FeatureDetection);
  },
  async ProfileRead(hub){
    let entry = await hub.storage.get('profile', 'profile').catch(e => console.log(e));
    if (entry) return resolveEntry(entry);
    else throw 204;
  },
  async ProfileWrite(hub, message){
    await hub.storage.set('profile', Object.assign({}, message, { id: 'default' })).catch(e => console.log(e));
  },
  async ProfileDelete(hub){
    await hub.storage.remove('profile', 'default').catch(e => console.log(e));
  },
  async CollectionsQuery(hub, message){
    let descriptor = message.content.descriptor;
    let query = [];
    if (descriptor.id) {
      query.push('AND', ['id', '=', descriptor.id.trim()]);
    }
    if (descriptor.schema) {
      query.push('AND', ['schema', '=', descriptor.schema.trim()])
    }
    if (descriptor.tags) {
      query.push('AND', ['tags', 'INCLUDES', descriptor.tags.map(tag => tag.trim())])
    }
    query.shift();
    return hub.storage.find('collections', query).then(entries => {
      return Promise.all(entries.map(entry => resolveEntry(entry)))
    });
  },
  async CollectionsWrite(hub, message){
    let promises = [];
    let descriptor = message.content.descriptor;
    let messageCID = await Utils.putMessage(message);
    let messageID = messageCID.toString();
    await hub.commitMessage(message);
    let entry = await hub.storage.get('collections', descriptor.id);
    if (entry) {
      if (descriptor.clock > entry.clock || (descriptor.clock === entry.clock && entry.tip.localCompare(messageID) < 0)) {
        entry.clock = clock;
        entry.tip = messageID;
        if (descriptor.schema) entry.schema = descriptor.schema;
        if (descriptor.tags) entry.tags = descriptor.tags;
        if (descriptor.datePublished) entry.datePublished = descriptor.datePublished;
        promises.push(deleteMessages(hub, 'collections', entry));
        entry.messages = [message];
      }
    }
    else {
      entry = {
        id: descriptor.id,
        tip: messageID,
        clock: descriptor.clock,
        schema: descriptor.schema,
        tags: descriptor.tags,
        messages: [message]
      }
      if (descriptor.datePublished) {
        entry.datePublished = descriptor.datePublished;
      }
    }
    promises.push(hub.storage.set('collections', entry));
    await Promise.all(promises);
  },
  async CollectionsDelete(hub, message){
    let descriptor = message.content.descriptor;
    let entry = await hub.storage.get('collections', descriptor.id);
    if (entry) await deleteMessages(hub, 'collections', entry, true);
  }
}

const FeatureDetection = {
  interfaces: {}
}

for (let z in Interfaces) {
  FeatureDetection.interfaces[z] = true;
}

// const features = {
//   interfaces: [
    // 'ProfileRead',
    // 'ProfileWrite',
    // 'ProfileDelete',
    // 'CollectionsQuery',
    // 'CollectionsWrite',
    // 'CollectionsDelete',
    // 'ActionsQuery',
    // 'ActionsCreate',
    // 'ActionsUpdate',
    // 'ActionsDelete',
    // 'ActionsBatch',
    // 'PermissionsQuery',
    // 'PermissionsRequest',
    // 'PermissionsUpdate',
    // 'PermissionsDelete',
    // 'PermissionsBatch'
//   ]
// }

export default Interfaces;