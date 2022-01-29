
import DIDMethods from '../did-methods/index.mjs';

const verificationRelationships = [
  'verificationMethods',
  'authentication',
  'assertionMethod',
  'keyAgreement',
  'capabilityInvocation',
  'capabilityDelegation'
]

const DID = {
  entries: {},
  methods: DIDMethods,
  getMethod(uri){
    let method = DIDMethods[uri.split(':')[1]];
    if (!method) throw 'Unsupported DID Method';
    return method;
  },
  async resolve(uri, options = {}){
    let method = this.getMethod(uri);
    let baseId = await method.getBaseId(uri);
    let entry = this.entries[baseId] || (this.entries[baseId] = { cacheTime: 0, cacheDuration: 3600 });
    if (options.cacheDuration) entry.cacheDuration = options.cacheDuration;
    if (
      options.force || 
      !entry.resolutionResult || 
      new Date().getTime() - entry.cacheTime > entry.cacheDuration
    ) {
      entry.resolutionResult = await method.resolve(uri);
      entry.cacheTime = new Date().getTime();
    }
    return entry.resolutionResult;
  },
  async getKey(did, frag){
    let doc = (await this.resolve(did)).didDocument;
    let id = frag.split('#').pop();
    for (let prop of verificationRelationships) {
      for (let key of doc[prop]) {
        if (key.id.split('#').pop() === id) {
          return key;
        }
      }
    };
  },
  async getService(did, type = 'IdentityHub', frag){
    let doc = (await this.resolve(did)).didDocument;
    let id = frag && frag.split('#').pop();
    for (let service of doc.service) {
      if ((id ? service.id.split('#').pop() === id : true) && service.type === type) {
        return service;
      }
    };
  }
}

export { DID }