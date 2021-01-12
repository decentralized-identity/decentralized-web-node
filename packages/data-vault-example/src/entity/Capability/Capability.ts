import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';
import { CapabilityBindingModel } from './CapabilityBindingModel';
import { CapabilityProof } from '../../types';

@Entity()
export class Capability extends Base {
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

  static fromBindingModel(bindingModel: CapabilityBindingModel): Capability {
    const entity: any = new Capability();
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
