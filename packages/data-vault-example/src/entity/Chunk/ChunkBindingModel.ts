import { Jwe } from '../../types';

export interface ChunkBindingModel {
  sequence: number;
  index: number;
  offset: number;
  jwe: Jwe;
}
