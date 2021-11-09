
import CID from 'cids';
import Utils from './utils.mjs';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(entry){
  let ipfs = await IdentityHub.ipfs;
  return await Promise.all(entry.messages.map(async descriptorId => {
    let result = {};
    let promises = [];
    let cids = await this.storage.get('stack', descriptorId);
    for (let prop in cids) {
      promises.push(
        ipfs.dag.get(new CID(cids[prop])).then(z => result[prop] = z)
      )
    }
    await Promise.all(promises);
    return result;
  }));
}

async function deleteMessages(hub, table, entry, deleteEntry){
  let ipfs = await IdentityHub.ipfs;
  // console.log(2, typeof entry.messages, JSON.stringify(entry.messages, null, 2));
  let promises = entry.messages.map(async msg => ipfs.pin.rmAll(
    Object.values(await Utils.getMessageCIDs(msg))
  ))
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
    let descriptor = message.descriptor;
    let query = [];
    if (descriptor.objectId) {
      query.push('AND', ['id', '=', descriptor.objectId.trim()]);
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
    let descriptor = message.descriptor;
    let messageCIDs = await Utils.getMessageCIDs(message);
    let descriptorID = messageCIDs.descriptor.toString();
    await hub.commitMessage(message);
    let entry = await hub.storage.get('collections', descriptor.objectId);
    if (entry) {
      if (descriptor.clock > entry.clock || (descriptor.clock === entry.clock && entry.tip.localCompare(descriptorID) < 0)) {
        entry.clock = clock;
        entry.tip = descriptorID;
        if (descriptor.schema) entry.schema = descriptor.schema;
        if (descriptor.tags) entry.tags = descriptor.tags;
        if (descriptor.datePublished) entry.datePublished = descriptor.datePublished;
        promises.push(deleteMessages(hub, 'collections', entry));
        entry.messages = [descriptorID];
      }
    }
    else {
      entry = {
        id: descriptor.objectId,
        tip: descriptorID,
        clock: descriptor.clock,
        schema: descriptor.schema,
        tags: descriptor.tags,
        messages: [descriptorID]
      }
      if (descriptor.datePublished) {
        entry.datePublished = descriptor.datePublished;
      }
    }
    promises.push(hub.storage.set('collections', entry));
    await Promise.all(promises);
  },
  async CollectionsDelete(hub, message){
    let descriptor = message.descriptor;
    let entry = await hub.storage.get('collections', descriptor.objectId);
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