import * as proccess from 'process';
const environment = proccess.env.NODE_ENV || 'development';

let port = proccess.env.PORT;
if (!port && environment === 'development') {
  port = '3000';
} else if (!port && environment === 'test') {
  port = '3000';
} else {
  throw 'You must set an environment variable for PORT';
}

let hostName = process.env.HOST_NAME;
if (!hostName && environment === 'development') {
  hostName = 'localhost';
} else if (!hostName && environment === 'test') {
  hostName = 'localhost';
} else {
  throw 'You must set an environment variable for HOST_NAME';
}

let scheme = process.env.SCHEME;
if (!scheme && environment === 'development') {
  scheme = 'http';
} else if (!scheme && environment === 'test') {
  scheme = 'http';
} else {
  throw 'You must set an environment variable for SCHEME';
}

const appConfig = {
  environment,
  scheme,
  hostName,
  port,
  baseURL: `${scheme}://${hostName}:${port}`
};

export default appConfig;
