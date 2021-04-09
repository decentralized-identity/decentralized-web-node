import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';

import { VaultIndexBindingModel } from './VaultIndexBindingModel';

@Entity()
export class VaultIndex extends Base {
  @Column()
  edvId?: string;

  @Column()
  hmacId?: string;

  @Column()
  has?: object;

  @Column()
  equals?: object;

  static fromBindingModel(bindingModel: VaultIndexBindingModel): VaultIndex {
    const entity: any = new VaultIndex();
    Object.keys(bindingModel).forEach((k: any) => {
      entity[k] = (bindingModel as any)[k];
    });
    return entity;
  }

  public toFs(baseUrl: string): string {
    const index: any = {
      id: `${baseUrl}/${this.hmacId}`,
    };
    if (Object.keys((this as any).has).length) {
      index.has = this.has;
    }

    if (Object.keys((this as any).equals).length) {
      index.equals = this.equals;
    }

    return JSON.stringify(index, null, 2);
  }
}
