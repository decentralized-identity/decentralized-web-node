const permissions = {
  validateRequest(ctx) {
    return new Promise(function(resolve) {
      resolve(true);
    });
  },
  validateObject(obj) {
    return new Promise(function(resolve) {
      resolve(true);
    });
  }
};

export default permissions;
