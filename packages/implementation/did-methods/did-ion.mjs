

import ION from '@decentralized-identity/ion-tools';

export default {
  name: 'ion',
  getBaseId(did){
    return did.split(':').slice(0, 3).join(':');
  },
  async resolve (did){
    return ION.resolve(did);
  }
}