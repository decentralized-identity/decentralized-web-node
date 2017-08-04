import * as Router from 'koa-router';

const fs = require('fs');
const devRouter = new Router();

devRouter.get('/_test', async ctx => {
  await new Promise((resolve, reject) => {
    fs.readFile('./node/../../test/playground.html', function(error, content) {
      console.log(error);
      if (error) reject();
      ctx.set('Content-Type', 'text/html');
      ctx.body = content;
      resolve();
    });
  });
});

export default devRouter;
