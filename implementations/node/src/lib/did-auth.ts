/* MOVE THIS TO A MODULE AND DELETE FROM PROJECT */

const authHeaderRegex = /\s*DID\s+(\S+)/;
const parseKeyRegex = /key[-/](\d+)/;

const auth = {
  parseAuthHeader: function(header: string) {
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
  validate: function(pub, sig) {
    return new Promise(function(resolve, reject) {
      resolve(true);
    });
  },
  getKeyFromDDO: function(ddo, keyIndex = 0) {
    var entry = ddo.owner[keyIndex];
    for (let z in entry) {
      if (z.match('public'))
        return {
          ...entry,
          public: entry[z],
          crypto: entry.type[1]
        };
    }
  }
};

export default auth;
