import * as Router from 'koa-router';
import resolver from '../../resolver';
import appConfig from '../../config/app';

// THIS NEEDS TO BE A SEPARATE NPM MODULE
import auth from '../../lib/did-auth';

const URL = require('url');
const indexRouter = new Router();
const nano = require('nano')(appConfig.dbURL);

// consider a default ID token that directs to a designated identity's Hub data

// Identify all inbound parties from any route if an Authorize header declaration is present
// If identification can be established, verify
indexRouter.use('/.identity/*', async (ctx, next) => {
  await new Promise(function(resolve, reject) {
    var header = auth.parseAuthHeader(ctx.headers.authorization);
    if (header) {
      resolver.lookup(header.did).then(response => {
        // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
        var key = auth.getKeyFromDDO(response.ddo, header.key);

        console.log(key);

        if (key) {
          ctx.body = key;
          resolve(next());
        } else reject();
      });
    } else {
      ctx.body = 'foo';
      resolve(next());
    }
  });
});

indexRouter.post('/.identity/:id', async ctx => {
  // DID or dan.id
  // Prove You Own It call. Where?
  console.log(ctx);
  await resolver
    .lookup(ctx.params.id)
    .then(async response => {
      // Locate a key to validate the request. Which one? Does the user specify, or is this standardized?
      var ddo = response.ddo;
      var key = auth.getKeyFromDDO(ddo);
      // Validate it with a lib we use or create;
      await auth
        .validate(key.public, ctx.params.sig)
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

indexRouter.get('/.identity/:id/profile', async ctx => {
  // Ensure that there is an ID passed to the Hub
  console.log(ctx.params.id);

  if (!ctx.params.id) {
    ctx.body = 'You must include a DID or TLN ID';
  } else {
    await resolver.lookup(ctx.params.id).then(response => {
      ctx.body = response.ddo;
    });
  }
});

import extensionsRouter from './extensions';
import devRouter from './_dev';
export { indexRouter, extensionsRouter, devRouter };
