import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';
import { RevocationBindingModel } from './RevocationBindingModel';
import { CapabilityProof } from '../../types';

@Entity()
export class Revocation extends Base {
  @Column()
  '@context'?: string;

  @Column()
  invocationTarget?: string;

  @Column()
  invoker?: string;

  @Column()
  allowedAction?: string;

  @Column()
  parentCapability?: string;

  @Column()
  proof?: CapabilityProof;

  static fromBindingModel(bindingModel: RevocationBindingModel): Revocation {
    const entity: any = new Revocation();
    Object.keys(bindingModel).forEach((k: any) => {
      entity[k] = (bindingModel as any)[k];
    });
    return entity;
  }

  public toFs(baseUrl: string): string {
    const cap: any = {
      '@context': this['@context'],
      id: `${baseUrl}/${this.id.split(':').pop()}`,
      invocationTarget: this.invocationTarget,
      invoker: this.invoker,
      allowedAction: this.allowedAction,
      parentCapability: this.parentCapability,
      proof: this.proof,
    };

    return JSON.stringify(cap, null, 2);
  }
}
