import * as Router from 'koa-router';
import appConfig from '../../config/app';

// THIS NEEDS TO BE A SEPARATE NPM MODULE
import auth from '../../lib/auth';
import data from '../../lib/data';
import permissions from '../../lib/permissions';

const URL = require('url');
const indexRouter = new Router();
const nano = require('nano')({
  url: appConfig.dbURL
});

const dotRegex = /[.]/g;
const dotReplacer = '---';
// consider a default ID token that directs to a designated identity's Hub data

// Identify all inbound parties from any route if an Authorize header declaration is present
// If identification can be established, verify

function getDB(name) {
  return new Promise(function(resolve, reject) {
    nano.db.get(name, (error, body) => {
      if (error) reject();
      else resolve(nano.use(name));
    });
  });
}

function createDB(name: string, ddo: object) {
  return new Promise(async function(resolve, reject) {
    nano.db.create(name, (error: object) => {
      if (error) reject();
      else resolve();
    });

    var hubs = ddo.service && ddo.service.hubs;
    if (hubs) {
      for (let hub of hubs) {
        if (new URL(hub).hostname != appConfig.hostname) {
          // Don't count yourself as a sync target
          await new Promise(function(resolve, reject) {
            nano.db.replicate(
              hubs[hub],
              name,
              { create_target: true },
              function(error, body) {
                if (error) reject(error);
                else resolve(body);
              }
            );
          });
        }
      }
    }
  });
}

indexRouter.use('/.identity/*', async (ctx, next) => {
  await auth.authenticateRequest(ctx).catch(() => {
    ctx.throw(400, 'Authentication failed');
  });
  await next();
});

indexRouter.post('/.identity/:did', async ctx => {
  if (ctx.state.did == ctx.params.did) {
    var dbName = ctx.params.did.replace(dotRegex, dotReplacer);
    await getDB(dbName)
      .then(db => {
        ctx.status = 200;
        ctx.body = 'Entity already exists';
      })
      .catch(() => {
        ctx.status = 201;
        ctx.body = 'New identity added to Hub';
        createDB(dbName, ctx.state.ddo);
      });
  } else {
    ctx.throw(
      403,
      'Cannot create an Identity Hub entry for a DID you do not own'
    );
  }
});

indexRouter.use('/.identity/:did/*', async (ctx, next) => {
  var dbName = ctx.params.did.replace(dotRegex, dotReplacer);
  await getDB(dbName)
    .then(async db => {
      ctx.state.db = db;
      await permissions.validateRequest(ctx).catch(() => {
        ctx.throw(403, 'You are not permitted to make this request');
      });
      return next();
    })
    .catch(() => {
      ctx.throw(403, 'You are not permitted to make this request');
    });
});

indexRouter.get('/.identity/:did/profile', async ctx => {
  await new Promise(function(resolve, reject) {
    ctx.state.db.get('profile', function(err, body) {
      if (err) {
        reject();
      } else {
        ctx.body = body;
        resolve();
      }
    });
  }).catch(() => {
    ctx.status = 400;
    ctx.body = 'No profile found';
  });
});

indexRouter.post('/.identity/:did/profile', async ctx => {
  var json = ctx.is('application/json');
  if (ctx.is('application/json')) {
    await new Promise(function(resolve, reject) {
      ctx.state.db.get('profile', function(err, doc) {
        if (err) {
          data.parseObject(ctx.request.body).then(() => {
            ctx.state.db.insert(ctx.request.body, 'profile', function(
              err,
              body
            ) {
              console.log(err || 'profile created');
              ctx.body = 'Profile created';
              resolve();
            });
          });
        } else {
          var rev = doc._rev;
          ctx.state.db.insert(
            Object.assign(ctx.request.body, { _rev: rev }),
            'profile',
            function(err, body, header) {
              console.log('Updated');
              ctx.body = 'Updated';
              resolve();
            }
          );
        }
      });
    });
  }
});

import extensionsRouter from './extensions';
export { indexRouter, extensionsRouter };
