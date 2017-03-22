var express = require('express');

var app = express();

// henrytsai: Run on port defined by IDENTITY_HUB_PORT environment variable if it exists, else run on port 3000.
var port = process.env.IDENTITY_HUB_PORT || 3000;

app.get('/', function (request, response) {
    response.send('Welcome to Decentralized Identity Hub!');
});

app.listen(port, function () {
    console.log('Running on port: ' + port);
});