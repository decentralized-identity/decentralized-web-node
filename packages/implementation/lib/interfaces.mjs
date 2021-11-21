
import CID from 'cids';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import all from 'it-all';
import Utils from './utils.mjs';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(hub, entry){
  let ipfs = await IdentityHub.ipfs;
  return await Promise.all(entry.messages.map(async descriptorId => {
    let result = {};
    let promises = [];
    let cids = await hub.storage.get('stack', descriptorId, 'descriptor');
    for (let prop in cids) {
      promises.push(
        all(ipfs.cat(cids[prop])).then(array => result[prop] = uint8ArrayConcat(array))
      )
    }
    await Promise.all(promises);
    result.descriptor = Utils.fromEncodedArray(result.descriptor, true);
    if (result.attestation) result.attestation = Utils.fromEncodedArray(result.attestation, true);
    if (result.authorization) result.authorization = Utils.fromEncodedArray(result.authorization, true);
    if (result.data) result.data = Buffer.from(result.data).toString('base64');
    return result;
  }));
}

async function deleteMessages(hub, table, entry, deleteEntry){
  let ipfs = await IdentityHub.ipfs;
  let promises = entry.messages.map(async msg => ipfs.pin.rmAll(
    Object.values(await Utils.getMessageCIDs(msg)).map(cid => new CID(cid))
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
    if (entry) return resolveEntry(hub, entry);
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
    if (descriptor.dataFormat) {
      query.push('AND', ['dataFormat', '=', descriptor.dataFormat.trim()])
    }
    if (descriptor.tags) {
      query.push('AND', ['tags', 'INCLUDES', descriptor.tags.map(tag => tag.trim())])
    }
    query.shift();
    return hub.storage.find('collections', query).then(entries => {
      return Promise.all(entries.map(entry => resolveEntry(hub, entry)))
    });
  },
  async CollectionsWrite(hub, message){
    let promises = [];
    let descriptor = message.descriptor;
    let messageCIDs = await Utils.getMessageCIDs(message);
    let descriptorID = messageCIDs.descriptor;
    await hub.commitMessage(message);
    let entry = await hub.storage.get('collections', descriptor.objectId);
    if (entry) {
      if (descriptor.clock > entry.clock || (descriptor.clock === entry.clock && entry.tip.localCompare(descriptorID) < 0)) {
        entry.clock = clock;
        entry.tip = descriptorID;
        ['schema', 'tags', 'datePublished', 'dataFormat'].forEach(prop => {
          if (prop in descriptor) entry[prop] = descriptor[prop]
        })
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
        dataFormat: descriptor.dataFormat,
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