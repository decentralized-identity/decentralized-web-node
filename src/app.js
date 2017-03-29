let express = require('express');
let app = express();

let router = require('./controllers'); // henrytsai: need "./" to tell node.js which directory to look from, but specifying index.js is optional.

app.use(router);

// henrytsai: Run on port defined by IDENTITY_HUB_PORT environment variable if it exists, else run on port 3000.
let port = process.env.IDENTITY_HUB_PORT || 3000;

app.listen(port, function () {
    console.log('Running on port: ' + port);
});