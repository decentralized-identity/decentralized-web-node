import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';
import { ChunkBindingModel } from './ChunkBindingModel';
import { Jwe } from '../../types/Jwe';

@Entity()
export class Chunk extends Base {
  @Column()
  edvId?: string;

  @Column()
  docId?: string;

  @Column()
  index?: number;

  @Column()
  sequence?: string;

  @Column()
  offset?: number;

  @Column()
  jwe?: Jwe;

  static fromBindingModel(bindingModel: ChunkBindingModel): Chunk {
    const entity: any = new Chunk();
    Object.keys(bindingModel).forEach((k: any) => {
      entity[k] = (bindingModel as any)[k];
    });
    return entity;
  }

  public toFs(baseUrl: string): string {
    const chunk: any = {
      id: `${baseUrl}/${this.index}`,
      sequence: this.sequence,
      index: this.index,
      offset: this.offset,
      jwe: this.jwe,
    };

    return JSON.stringify(chunk, null, 2);
  }
}
