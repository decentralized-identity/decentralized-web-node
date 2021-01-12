#!/usr/bin/env node
const vorpal = require('vorpal')();

const { getClient, createDocument } = require('./client');

vorpal
  .command('documents create', 'creates a test edv document')
  .action(async (args, callback) => {
    const client = await getClient();
    const doc = await createDocument(client);
    console.log(JSON.stringify(doc, null, 2));
    callback();
  });

if (process.argv.length <= 2) {
  vorpal.delimiter('💾 $').show();
}
// eslint-disable-next-line no-undef
vorpal.parse(process.argv);
