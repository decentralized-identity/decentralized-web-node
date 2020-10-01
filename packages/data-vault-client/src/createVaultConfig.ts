import { v4 as uuidv4 } from 'uuid';
import { CapabilityInvoker } from './CapabilityInvoker';
import { KeyAgreementKey } from './KeyAgreementKey';
import { Sha256HmacKey2019 } from './Sha256HmacKey2019';

export const createVaultConfig = async (
  referenceId: string,
  invoker: CapabilityInvoker,
  keyAgreementKey: KeyAgreementKey,
  hmac: Sha256HmacKey2019
) => {
  return {
    id: uuidv4(),
    referenceId: `${invoker.key.controller}#${referenceId}`,
    sequence: 0,
    controller: `${invoker.key.controller}`,
    hmac: await hmac.toJson(),
    keyAgreementKey: {
      id: `${invoker.key.controller}${keyAgreementKey.key.id}`,
      type: `${keyAgreementKey.key.type}`,
    },
  };
};
