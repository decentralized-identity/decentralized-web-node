
import CID from 'cids';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(entry, data_id){
  let ipfs = await IdentityHub.ipfs;
  let [ item, data ] = await Promise.all([
    typeof entry === 'string' ? ipfs.dag.get(new CID(entry)).then(z => z.value) : entry,
    ipfs.dag.get(new CID(data_id || entry.message.descriptor.data)).then(z => z.value)
  ]);
  item.message.descriptor.data = data;
  return item.message;
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
    return hub.storage.set('profile', Object.assign({}, message, { id: 'default' })).catch(e => console.log(e));
  },
  async ProfileDelete(hub){
    return hub.storage.remove('profile', 'default').catch(e => console.log(e));
  },
  async CollectionsQuery(hub, message){
    let query = [];
    if (message.descriptor.id) {
      query.push('AND', ['message.descriptor.id', '=', message.descriptor.id.trim()]);
    }
    if (message.descriptor.schema) {
      query.push('AND', ['message.descriptor.schema', '=', message.descriptor.schema.trim()])
    }
    if (message.descriptor.tags) {
      query.push('AND', ['message.descriptor.tags', 'INCLUDES', message.descriptor.tags.map(tag => tag.trim())])
    }
    query.shift();
    return hub.storage.find('collections', query).then(entries => {
      return Promise.all(entries.map(entry => resolveEntry(entry)))
    });
  },
  async CollectionsPut(hub, message){
    let promises = [];
    let descriptor = message.descriptor;
    let messageCID = await ipfs.dag.put(message);
    let messageID = messageCID.toString();
    let entry = await hub.storage.get('collections', descriptor.id);
    if (entry) {
      if (vector > entry.vector || (vector === entry.vector && entry.tip.localCompare(messageID) < 0)) {
        entry.vector = vector;
        entry.tip = messageID;
        if (descriptor.schema) entry.schema = descriptor.schema;
        if (descriptor.tags) entry.tags = descriptor.tags;
        entry.messages.forEach(msg => {
          promises.push(
            ipfs.pin.rmAll([(await ipfs.dag.put(msg).toString()), new CID(msg.descriptor.data)]),
            hub.storage.delete('collections', msg.descriptor.id)
          )
        })
        entry.messages = [message];
      }
    }
    else {
      entry = {
        id: descriptor.id,
        tip: messageID,
        vector: 0,
        schema: descriptor.schema,
        tags: descriptor.tags,
        messages: [message]
      }
    }
    return Promise.all(promises);
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