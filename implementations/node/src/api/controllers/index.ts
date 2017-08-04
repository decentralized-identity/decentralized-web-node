import * as Router from 'koa-router';
import resolver from '../../resolver';
import appConfig from '../../config/app';

// THIS NEEDS TO BE A SEPARATE NPM MODULE
import auth from '../../lib/did-auth';

const URL = require('url');
const indexRouter = new Router();
const nano = require('nano')(appConfig.dbURL);

// consider a default ID token that directs to a designated identity's Hub data

function parseAuthHeader(header) {
  if (header) {
    // header.split()
  } else return false;
}

indexRouter.use('*', async ctx => {
  await new Promise(function(resolve, reject) {
    resolver.lookup('bob.id').then(response => {
      // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
      var pubkey;
      var ddo = response.ddo;
      var did = ddo.id;
      ddo.owner.some(item => {
        // Which key pair do we challenge with? Can the DDO flag it?
        if (item.type[1] == 'secp256k1PublicKey') {
          pubkey = item.publicKeyHex;
          return true;
        }
        return false;
      });

      console.log(ddo);

      // var verifier = crypto.createVerify("RSA-SHA256");
      // verifier.update(nonceString);

      // var publicKeyBuf = new Buffer(pubkey, 'base64');

      //var result = null //verifier.verify(publicKeyBuf, signature, "base64");
      var result = true;
      if (result) {
        ctx.body = ddo;
        resolve();
      } else reject();
    });
  });
});

indexRouter.post('/.identity/:id', async function(ctx) {
  // DID or dan.id
  // Prove You Own It call. Where?

  await resolver
    .lookup(ctx.params.id)
    .then(async response => {
      // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
      var pubkey;
      var ddo = response.ddo;
      var did = ddo.id;
      ddo.owner.some(item => {
        // Which key pair do we challenge with? Can the DDO flag it?
        if (item.type[1] == 'secp256k1PublicKey') {
          pubkey = item.publicKeyHex;
          return true;
        }
        return false;
      });
      // Validate it with a lib we use or create;
      await auth
        .validate(pubkey, ctx.params.sig)
        .then(async function() {
          // Check to see if the user already has a DB in Couch - if so exit, if not, sync existing remote or create one
          if (!nano.use(did)) {
            var hubs = ddo.service && ddo.service.hubs;
            if (hubs) {
              for (let hub of hubs) {
                if (new URL(hub).hostname != appConfig.hostname) {
                  // Don't count yourself as a sync target
                  await new Promise(function(resolve, reject) {
                    nano.db.replicate(
                      hubs[hub],
                      did,
                      { create_target: true },
                      function(error, body) {
                        if (error) reject(error);
                        else resolve(body);
                      }
                    );
                  });
                }
              }
            } else {
              nano.db.create(did, (error: object) => {
                if (!error) {
                  ctx.body = 'DB created for user';
                }
              });
            }
          } else {
            ctx.body = 'User already exists';
          }
        })
        .catch(function() {
          ctx.body = 'Request could not be validated';
        });
    })
    .catch(() => {
      ctx.body = 'Could not resolve';
    });
});

indexRouter.get('/.identity/:id', async function(ctx) {
  // Ensure that there is an ID passed to the Hub
  console.log(ctx.params.id);

  if (!ctx.params.id) ctx.body = 'You must include a DID or TLN ID';
  else
    await resolver.resolve(ctx.params.id).then(response => {
      ctx.body = 'Success';
    });
});

import extensionsRouter from './extensions';
export { indexRouter, extensionsRouter };
