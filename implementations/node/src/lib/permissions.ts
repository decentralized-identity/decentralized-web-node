const permissions = {
  check(ctx) {
    return new Promise(function(resolve) {
      resolve(true);
    });
  }
};

export default permissions;
