/* MOVE THIS TO A MODULE AND DELETE FROM PROJECT */

const auth = {
  validate: function(pub, sig) {
    return new Promise(function(resolve) {
      resolve(true);
    });
  }
};

export default auth;
