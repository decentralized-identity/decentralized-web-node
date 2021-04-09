// base58 characters (Bitcoin alphabet)
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const baseN = require('base-x')(alphabet);

export function encode(input: any, maxline?: any) {
  return baseN.encode(Buffer.from(input), maxline);
}

export function decode(input: any) {
  return baseN.decode(input);
}

export default {
  encode,
  decode,
};
