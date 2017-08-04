import * as process from 'process';
const environment = process.env.NODE_ENV || 'development';

let port = process.env.PORT;
if (!port && ['development', 'test'].includes(environment)) {
  port = '3000';
} else {
  throw 'You must set an environment variable for PORT';
}

let hostname = process.env.HOST_NAME;
if (!hostname && ['development', 'test'].includes(environment)) {
  hostname = 'localhost';
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

console.log(environment);

const appConfig = {
  environment,
  scheme,
  hostname,
  port,
  baseURL: `${scheme}://${hostname}${port ? ':' + port : ''}/.identity`,
  dbURL: `${couchdbURL}`
};
export default appConfig;
