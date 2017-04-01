let express = require('express');
let router = require('./controllers'); // Need "./" to tell node.js which directory to look from, but specifying index.js is optional.

// Run on port defined by IDENTITY_HUB_PORT environment variable if it exists, else run on port 3000.
let port = process.env.IDENTITY_HUB_PORT || 3000;

let app = express();
app.use(router);
app.listen(port, function () {
    console.log('Running on port: ' + port);
});