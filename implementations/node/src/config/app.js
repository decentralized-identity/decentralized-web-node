"use strict";
exports.__esModule = true;
var proccess = require("process");
var environment = proccess.env.NODE_ENV || 'development';
var port = proccess.env.PORT;
if (!port && environment === 'development') {
    port = '3000';
}
else if (!port && environment === 'test') {
    port = '3000';
}
else {
    throw 'You must set an environment variable for PORT';
}
var hostName = process.env.HOST_NAME;
if (!hostName && environment === 'development') {
    hostName = 'localhost';
}
else if (!hostName && environment === 'test') {
    hostName = 'localhost';
}
else {
    throw 'You must set an environment variable for HOST_NAME';
}
var scheme = process.env.SCHEME;
if (!scheme && environment === 'development') {
    scheme = 'http';
}
else if (!scheme && environment === 'test') {
    scheme = 'http';
}
else {
    throw 'You must set an environment variable for SCHEME';
}
/*
  I assume we need to specify the CouchDB instance location/settings somewhere in here?
*/
var appConfig = {
    environment: environment,
    scheme: scheme,
    hostName: hostName,
    port: port,
    baseURL: scheme + "://" + hostName + ":" + port
};
exports["default"] = appConfig;
