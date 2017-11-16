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

function getDB(did) {
  return new Promise(function(resolve, reject) {
    var db = nano.use(did);
    if (db) resolve(db);
    else reject();
  });
}

function createDB(did, ddo) {
  return new Promise(function(resolve, reject) {
    console.log('createDB');
    nano.db.create(did, (error: object) => {
      console.log(error || 'db created!');
      if (error) reject();
      else resolve();
    });

    var hubs = ddo.service && ddo.service.hubs;
    if (hubs) {
      for (let hub of hubs) {
        if (new URL(hub).hostname != appConfig.hostname) {
          // Don't count yourself as a sync target
          await new Promise(function(resolve, reject) {
            nano.db.replicate(hubs[hub], did, { create_target: true }, function(
              error,
              body
            ) {
              if (error) reject(error);
              else resolve(body);
            });
          });
        }
      }
    }
  });
}

indexRouter.use('/.identity/*', async (ctx, next) => {
  await auth.filterRequest(ctx, next);
});

indexRouter.post('/.identity/:did', async ctx => {
  var did = ctx.state.did;
  if (ctx.state.did == ctx.params.did) {
    await new Promise(function(resolve, reject) {
      getDB(ctx.state.dbname)
        .then(db => {
          ctx.body = 'Entity already exists';
          reject();
        })
        .catch(() => {
          createDB(ctx.state.dbname, ctx.state.ddo);
          resolve();
        });
    });
  } else {
    ctx.body = 'Cannot create DB for other entities';
  }
});

indexRouter.get('/.identity/:did/profile', async ctx => {
  await new Promise(function(resolve, reject) {
    getDB(ctx.state.dbname).then(db => {
      db.get('profile', function(err, body) {
        if (err) {
          console.log(err);
        } else {
          ctx.body = body;
        }
        resolve();
      });
    });
  });
});

indexRouter.post('/.identity/:did/profile', async ctx => {
  console.log(ctx.request.body);
  var json = ctx.is('application/json');
  console.log(json);
  //if (ctx.is('application/json') && ctx.request.body){
  await new Promise(function(resolve, reject) {
    getDB(ctx.state.dbname).then(db => {
      db.get('profile', function(err, doc) {
        var rev = doc._rev;
        if (err) {
          ctx.body = {};
          resolve();
        } else {
          ctx.request.body;
          users.insert(
            { title: 'here_ya_go', _rev: updaterev },
            'document_name',
            function(err, body, header) {
              ctx.body = {};
              resolve();
            }
          );
        }
      });
    });
  });
  //}
});

import extensionsRouter from './extensions';
export { indexRouter, extensionsRouter };
