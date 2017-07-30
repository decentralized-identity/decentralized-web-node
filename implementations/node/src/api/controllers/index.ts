import * as Router from 'koa-router';
import resolver from '../../resolver';
import appConfig from '../../config/app';

// THIS NEEDS TO BE A SEPARATE NPM MODULE
import auth from '../../lib/auth';

const indexRouter = new Router();
const nano = require('nano')(appConfig.dbURL);

// consider a default ID token that directs to a designated identity's Hub data

indexRouter.post('/.identity/:id', async function(ctx) {
  // DID or dan.id
  // Prove You Own It call. Where?

  await resolver
    .resolve(this.params.id)
    .then(async response => {
      // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
      var pubkey;
      var did = response.did;
      var ddo = response.ddo;
      ddo.owner.some(item => {
        if (item.type[1] == 'EdDsaPublicKey') {
          pubkey = item.publicKeyBase64;
          return true;
        }
      });
      // Validate it with a lib we use or create;
      await auth
        .validate(pubkey, ctx.sig)
        .then(async function() {
          // Check to see if the user already has a DB in Couch - if so exit, if not, sync existing remote or create one
          if (!nano.use(did)) {
            var hubs = ddo.service && ddo.service.hubs;
            if (hubs) {
              for (hub of hubs) {
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
    .catch(error => {
      ctx.body = 'Could not resolve';
    });
});

indexRouter.get('/.identity/:id', async function(ctx) {
  // Ensure that there is an ID passed to the Hub
  console.log(ctx.params.id);

  if (!ctx.params.id) ctx.body = 'You must include a DID or TLN ID';
  else
    await resolver.resolve(ctx.params.id).then(response => {
      ctx.body = JSON.stringify({
        routes: {
          extensions: {
            extensions: {
              rel: 'extension',
              href: appConfig.baseURL + '/extensions',
              action: 'GET'
            },
            extension: {
              rel: 'extension',
              href: appConfig.baseURL + '/extension/:id',
              action: 'GET'
            }
          }
        }
      });
    });
});

import extensionsRouter from './extensions';
export { indexRouter, extensionsRouter };
