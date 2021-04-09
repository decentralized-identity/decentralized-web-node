import edvConfig from './schemas/edv-config.json';

import Ajv from 'ajv';

const ajv = new Ajv({ verbose: true, removeAdditional: false });
ajv.addSchema(edvConfig, 'edvConfig');

// throws if validation fails
export function validateSchema({ payload }: any) {
  // validate payload against JSON schema
  const valid = ajv.validate('edvConfig', payload);
  if (valid) {
    return true;
  }
  const error: any = new Error('Validation error.');
  error.errors = ajv.errors;
  throw error;
}
