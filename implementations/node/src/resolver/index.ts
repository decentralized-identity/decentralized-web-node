const resolver = {
  resolve: function(id) {
    return new Promise(function(resolve, reject) {
      resolve({
        did: 'did:btcr:123',
        ddo: {}
      });
    });
  },
  auth: function(did, request) {
    return true;
  }
};

export default resolver;
