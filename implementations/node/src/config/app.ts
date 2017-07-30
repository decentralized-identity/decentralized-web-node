import * as process from 'process';
const environment = process.env.NODE_ENV || 'development';

let port = process.env.PORT;
if (!port && ['development', 'test'].includes(environment)) {
  port = '3000';
} else {
  throw 'You must set an environment variable for PORT';
}

let hostName = process.env.HOST_NAME;
if (!hostName && ['development', 'test'].includes(environment)) {
  hostName = 'localhost';
} else {
  throw 'You must set an environment variable for HOST_NAME';
}

let scheme = process.env.SCHEME;
if (!scheme && ['development', 'test'].includes(environment)) {
  scheme = 'http';
} else {
  throw 'You must set an environment variable for SCHEME';
}

let couchdbURL = process.env.COUCHDB_URL || 'http://0.0.0.0:5984';
if (!couchdbURL) {
  throw 'You must set an environment variable for COUCHDB_URL';
}

const appConfig = {
  environment,
  scheme,
  hostName,
  port,
  baseURL: `${scheme}://${hostName}:${port}/.identity`,
  dbURL: `${couchdbURL}`
};
export default appConfig;
