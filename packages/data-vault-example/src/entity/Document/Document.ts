import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';
import { DocumentBindingModel } from './DocumentBindingModel';
import { Jwe } from '../../types/Jwe';

@Entity()
export class Document extends Base {
  @Column()
  edvId?: string;

  @Column()
  sequence?: number;

  @Column()
  indexed?: Array<{
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

  @Column()
  jwe?: Jwe;

  static fromBindingModel(bindingModel: DocumentBindingModel): Document {
    const entity: any = new Document();
    Object.keys(bindingModel).forEach((k: any) => {
      entity[k] = (bindingModel as any)[k];
    });
    return entity;
  }

  public toExternal(baseUrl = 'http://localhost:9876/edvs'): Document {
    const doc: any = {
      id: `${baseUrl}/${this.edvId}/documents/${this.id}`,
      sequence: this.sequence,
      indexed: this.indexed,
      jwe: this.jwe,
    };

    return doc;
  }

  public toFs(baseUrl: string): string {
    const doc: any = {
      id: `${baseUrl}/${this.id}`,
      sequence: this.sequence,
      indexed: this.indexed,
      jwe: this.jwe,
    };

    return JSON.stringify(doc, null, 2);
  }
}
