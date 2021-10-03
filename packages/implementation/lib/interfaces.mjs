
import CID from 'cids';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(entry, file_id){
  let ipfs = await IdentityHub.ipfs;
  let [ item, file ] = await Promise.all([
    typeof entry === 'string' ? ipfs.dag.get(new CID(entry)).then(z => z.value) : entry,
    ipfs.dag.get(new CID(file_id || entry.message.content.data)).then(z => z.value)
  ]);
  item.message.content.data = file;
  return item.message;
}

const Interfaces = {
  async FeatureDetectionRead(){
    return Object.assign({
      "@context": "https://identity.foundation/schemas/hub",
      "type": "FeatureDetection",
    }, FeatureDetection);
  },
  async FilesQuery(did, message){
    let DID = await IdentityHub.load(did);
    let entry = await DID.storage.get('stack', message.content.id).catch(e => console.log(e));
    if (entry) return resolveEntry(entry.id, entry.file);
    else throw 404;
  },
  async ProfileRead(did){
    let DID = await IdentityHub.load(did);
    let entry = await DID.storage.get('profile', 'profile').catch(e => console.log(e));
    if (entry) return resolveEntry(entry);
    else throw 204;
  },
  async ProfileWrite(did, message){
    let DID = await IdentityHub.load(did);
    return DID.storage.set('profile', Object.assign({}, message, { id: 'profile' })).catch(e => console.log(e));
  },
  async ProfileDelete(did){
    let DID = await IdentityHub.load(did);
    return DID.storage.remove('profile', 'profile').catch(e => console.log(e));
  },
  async CollectionsQuery(did, message){
    let DID = await IdentityHub.load(did);
    let query = [];
    if (message.id) {
      query.push('AND', ['id', '=', message.id.trim()]);
    }
    if (message.schema) {
      query.push('AND', ['message.content.schema', '=', message.schema.trim()])
    }
    if (message.tags) {
      query.push('AND', ['message.content.tags', 'INCLUDES', message.tags.map(tag => tag.trim())])
    }
    query.shift();
    return DID.storage.find('collections', query).then(entries => {
      return Promise.all(entries.map(entry => resolveEntry(entry)))
    });
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
    // 'CollectionsCreate',
    // 'CollectionsUpdate',
    // 'CollectionsReplace',
    // 'CollectionsDelete',
    // 'CollectionsBatch',
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