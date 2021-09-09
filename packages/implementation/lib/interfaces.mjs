
import CID from 'cids';
import { IdentityHub } from '../main.mjs';

async function resolveEntry(entry, file_id){
  let ipfs = await IdentityHub.ipfs;
  let [ node, file ] = await Promise.all([
    typeof entry === 'string' ? ipfs.dag.get(new CID(entry)).then(z => z.value) : entry,
    ipfs.dag.get(new CID(file_id || entry.data.id)).then(z => z.value)
  ]);
  node.data.payload = file;
  delete node.id;
  return node;
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
    let entry = await DID.storage.get('stack', message.id).catch(e => console.log(e));
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
    return Promise.all(message.statements.reduce((queries, statement) => {
      let query = Object.keys(statement).length;
      if (!query) queries.push(null);
      else {
        query = [];
        if (statement.id) {
          query.push('AND', ['id', '=', statement.id.trim()]);
        }
        if (statement.schema) {
          query.push('AND', ['schema', '=', statement.schema.trim()])
        }
        if (statement.tags) {
          query.push('AND', ['tags', 'INCLUDES', statement.tags.map(tag => tag.trim())])
        }
        query.shift();
        queries.push(DID.storage.find('collections', query).then(entries => {
          return Promise.all(entries.map(entry => resolveEntry(entry)))
        }));
      }
      return queries;
    }, [])).catch(e => console.log(e));
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