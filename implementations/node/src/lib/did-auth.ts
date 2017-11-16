/* MOVE THIS TO A MODULE AND DELETE FROM PROJECT */

import resolver from '../resolver';

const authHeaderRegex = /\s*DID\s+(\S+)/;
const parseKeyRegex = /key[-/](\d+)/;
const dotRegex = /[.]/g;

const auth = {
  parseAuthHeader(header: string) {
    var match;
    if (
      header &&
      header.replace(authHeaderRegex, function(m, did) {
        match = did.split('#');
        match = {
          did: match[0],
          key: match[1] ? Number(match[1].split(parseKeyRegex)[1]) || 0 : 0
        };
      })
    )
      return match;
    return false;
  },
  validate(pub, sig) {
    return new Promise(function(resolve, reject) {
      resolve(true);
    });
  },
  getKeyFromDDO(ddo, keyIndex = 0) {
    var entry = ddo.owner[keyIndex];
    for (let z in entry) {
      if (z.match('public'))
        return {
          ...entry,
          public: entry[z],
          crypto: entry.type[1]
        };
    }
  },
  filterRequest(ctx, next) {
    return new Promise(function(resolve, reject) {
      var header = auth.parseAuthHeader(ctx.headers.authorization);
      console.log(header);
      if (header) {
        resolver.lookup(header.did).then(response => {
          // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
          var key = auth.getKeyFromDDO(response.ddo, header.key);
          if (key) {
            ctx.state.dbname = header.did.replace(dotRegex, '_');
            ctx.state.did = header.did;
            ctx.state.key = key;
            ctx.state.ddo = response.ddo;
            resolve(next());
          } else reject();
        });
      } else {
        resolve(next());
      }
    });
  }
};

export default auth;
