import { Jwe } from '../../types';

export interface DocumentBindingModel {
  id: string;
  sequence: number;
  indexed: Array<{
    hmac: {
      id: string;
      type: string;
    };
    sequence: number;
    attributes: Array<{
      name: string;
      value: string;
      unique: boolean;
    }>;
  }>;
  jwe: Jwe;
}
