import * as Router from 'koa-router';

const fs = require('fs');
const devRouter = new Router();

devRouter.get('/playground', async ctx => {
  await new Promise((resolve, reject) => {
    fs.readFile('./test/playground/index.html', function(error, content) {
      console.log(error);
      if (error) reject();
      ctx.set('Content-Type', 'text/html');
      ctx.body = content;
      resolve();
    });
  });
});

const files = {
  'text/javascript': [
    '/playground/playground.js',
    '/playground/editor/prism.js',
    '/playground/editor/codeflask.js'
  ],
  'text/css': [
    '/playground/playground.css',
    '/playground/editor/prism.css',
    '/playground/editor/codeflask.css'
  ]
};

for (let type in files) {
  files[type].forEach(file => {
    devRouter.get(file, async ctx => {
      await new Promise((resolve, reject) => {
        fs.readFile('./test' + file, function(error, content) {
          if (error) reject();
          ctx.set('Content-Type', type);
          ctx.body = content;
          resolve();
        });
      });
    });
  });
}

export default devRouter;
