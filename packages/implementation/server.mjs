
import * as fs from 'fs';
import Koa from 'koa';
import Router from 'koa-router';
import BodyParser from 'koa-body';
import Static from 'koa-static';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { IdentityHub } from './main.mjs';
import Status from './lib/status.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = new Koa();
const router = new Router();
const PORT = 1337;

const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));

const textDecoder = new TextDecoder();
function decodeArray(data){
  return data instanceof Uint8Array ? textDecoder.decode(data) : data;
}

const testDID = decodeArray(fs.readFileSync(__dirname + '/vectors/did.txt'));
const ed25519Keys = JSON.parse(fs.readFileSync(__dirname + '/vectors/ed25519.json'));
const secp256k1Keys = JSON.parse(fs.readFileSync(__dirname + '/vectors/secp256k1.json'));

async function getHub(did){
  return IdentityHub.load(did, {
    signing: ed25519Keys
  }); 
}

router.post('/:did/all/:table', async (ctx) => {
  let hub = await getHub(ctx.params.did);
  let result = await hub.storage.txn(db => db(ctx.params.table).query('select').exec()).catch(e => console.log(e));
  console.log(123, result);
  ctx.body = result;
});

router.post('/upload', async (ctx) => {
  let body = ctx.request.body;
  let hub = await getHub(body.target);
  let request = await hub.generateRequest({
    messages: [await hub.compose({
      descriptor: body.descriptor,
      data: body.data,
      sign: true
    })]
  })
  
  let response = await hub.process(request);
  ctx.body = response;
});

router.post('/', async (ctx) => {
  let request = ctx.request.body;
  let hub = await getHub(request.target);
  try {
    ctx.body = await hub.process(request);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = {
      status: Status.getStatus(500)
    };
  }
});

app.use(Static(__dirname));
app.use(BodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

/* Example of a tweet

{
  type: 'CollectionsCreate',
  schema: 'https://schema.org/Event',
  data: {
    "@context":"https://schema.org",
    "@type":"SocialMediaPosting",
    "datePublished":"2021-08-17",
    "headline":"Leaked new BMW 2 series (m235i)",
    "articleBody": "My first decentralized tweet"
  }
}

*/