import { Column, Entity } from 'typeorm';
import { Base } from '../Base/NoSqlBase';
import { VaultBindingModel } from './VaultBindingModel';

// "config": {
//   "id": "http://localhost:9876/edvs/3ab4603c-de7d-422c-a098-775d02fc08ef",
//   "sequence": 0,
//   "controller": "did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn",
//   "keyAgreementKey": {
//     "id": "did:key:z6MktCi29iAwUiVDaewSStHVW5qhBxZTGXBFXM9YD9RisbFn#z6LSn4Wq5XE4FgJ8jyKss1kL5Gqwsn7gVgsKpNEPGHMeCxQq",
//     "type": "X25519KeyAgreementKey2019"
//   },
//   "hmac": {
//     "id": "urn:multibase:uEqwxeY_UyPYkKFB8PVihJdLlrAQKeAh50Z3ay2QO1wzC",
//     "type": "Sha256HmacKey2019"
//   },
//   "referenceId": "data-model-guide"
// },

@Entity()
export class Vault extends Base {
  @Column()
  edvId?: string;

  @Column()
  referenceId?: string;

  @Column()
  sequence?: number;

  @Column()
  controller?: string;

  @Column()
  keyAgreementKey?: {
    id: string;
    type: string;
  };

  @Column()
  hmac?: {
    id: string;
    type: string;
  };

  static getReferenceKey(controller: string, referenceId: string): string {
    return `${encodeURIComponent(controller)}:${encodeURIComponent(
      referenceId
    )}`;
  }

  static fromBindingModel(bindingModel: VaultBindingModel): Vault {
    const entity: any = new Vault();
    Object.keys(bindingModel).forEach((k: any) => {
      entity[k] = (bindingModel as any)[k];
    });
    return entity;
  }

  public toExternal(baseUrl = 'http://localhost:9876/edvs'): Vault {
    const config: any = {
      id: `${baseUrl}/${this.id}`,
      sequence: this.sequence,
      controller: this.controller,
      keyAgreementKey: this.keyAgreementKey,
      hmac: this.hmac,
    };

    if (this.referenceId) {
      config.referenceId = this.referenceId;
    }
    return config;
  }

  public toFs(baseUrl = '/edvs'): string {
    const config: any = {
      id: `${baseUrl}/${this.id}`,
      sequence: this.sequence,
      controller: this.controller,
      keyAgreementKey: this.keyAgreementKey,
      hmac: this.hmac,
    };

    if (this.referenceId) {
      config.referenceId = this.referenceId;
    }
    return JSON.stringify(config, null, 2);
  }
}
