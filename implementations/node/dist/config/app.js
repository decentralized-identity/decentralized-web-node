"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const environment = process.env.NODE_ENV || 'development';
let port = process.env.PORT;
if (!port && ['development', 'test'].includes(environment)) {
    port = '3000';
}
else {
    throw 'You must set an environment variable for PORT';
}
let hostName = process.env.HOST_NAME;
if (!hostName && ['development', 'test'].includes(environment)) {
    hostName = 'localhost';
}
else {
    throw 'You must set an environment variable for HOST_NAME';
}
let scheme = process.env.SCHEME;
if (!scheme && ['development', 'test'].includes(environment)) {
    scheme = 'http';
}
else {
    throw 'You must set an environment variable for SCHEME';
}
/*
  I assume we need to specify the CouchDB instance location/settings somewhere in here?
*/
const appConfig = {
    environment,
    scheme,
    hostName,
    port,
    dbURL,
    baseURL: `${scheme}://${hostName}:${port}/.identity`
};
exports.default = appConfig;
//# sourceMappingURL=app.js.map