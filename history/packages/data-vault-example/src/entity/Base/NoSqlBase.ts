import { Entity, ObjectIdColumn, BeforeInsert, BaseEntity } from 'typeorm';

const { EdvClient } = require('edv-client');

@Entity()
export class Base extends BaseEntity {
  @ObjectIdColumn()
  id!: string;

  @ObjectIdColumn({ name: 'id' })
  _id!: string;

  @BeforeInsert()
  public async validate() {
    // TODO: here we could assign IDs by content

    // docs and indexes have id set by client.
    if (!this._id && !this.id) {
      this._id = await EdvClient.generateId();
    } else {
      // special ids for docs
      this._id = this.id;
    }
  }
}
