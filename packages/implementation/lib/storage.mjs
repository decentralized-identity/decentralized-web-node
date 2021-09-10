
import Natives from './natives.mjs';
import Normalize from './normalize.mjs';
import { nSQL as nano } from "@nano-sql/core";

function normalizeEntries(entries){
  return (Array.isArray(entries) ? entries : [entries]).map(entry => {
    if (entry.schema) entry.schema = entry.schema.trim();
    return entry;
  });
}

export default class Storage {

  constructor(did, options = {}){
    this.did = did;
    this.dbName = did.replace(/:/g, '-');
    this.ready = nano().createDatabase({
      id: this.dbName,
      mode: 'PERM',
      tables: this.tables = [
        {
          name: 'stack',
          model: {
            "id:string": { pk: true, immutable: true },
            "file:string": { immutable: true }
          }
        },
        {
          name: 'profile',
          model: {
            "id:string": { pk: true, immutable: true },
            "data:object": {},
            "signature:object": {}
          }
        },
        {
          name: 'permissions',
          model: {
            "id:string": { pk: true, immutable: true },
            "schema:string": { immutable: true, notNull: true },
            "data:object": { immutable: true },
            "signature:object": {}
          }
        },
        {
          name: 'collections',
          model: {
            "id:string": { pk: true, immutable: true },
            "type:string": { immutable: true },
            "nonce:string": { immutable: true },
            "schema:string": { immutable: true, notNull: true },
            "root:string": { immutable: true },
            "parent:string": { immutable: true },
            "tags:array": {},
            "data:object": { immutable: true },
            "signature:object": {}
          }
        },
        {
          name: 'actions',
          model: {
            "id:string": { pk: true, immutable: true },
            "nonce:string": { immutable: true },
            "schema:string": { immutable: true, notNull: true },
            "root:string": { immutable: true },
            "parent:string": { immutable: true },
            "data:object": { immutable: true },
            "signature:object": { immutable: true }
          }
        }
      ]
    })  
  }

  async txn(fn){
    return this.ready.then(async () => {
      await nano().useDatabase(this.dbName);
      return fn(nano);
    });
  }

  async set (table, entries){
    return this.txn(db => db(table).query('upsert', normalizeEntries(entries)).exec()).catch(e => console.log(e));
  }

  async get (table, id){
    return this.txn(db => db(table).query('select').where([
      'id', '=', id
    ]).exec())
    .then(rows => rows[0])
    .catch(e => console.log(e));
  }

  async find (table, filter){
    return this.txn(db => db(table).query('select').where(filter).exec()).catch(e => console.log(e));
  }

  async getStackFromIndex (id){
    return this.txn(db => db(table).query('select').where([
      'order', '>', id
    ]).exec()).catch(e => console.log(e))
  }

  async getBySchema(table, schema){
    return this.txn(db => db(table).query('select').where([
      'schema', '=', schema.trim()
    ]).exec()).catch(e => console.log(e))
  }

  async remove (table, id){
    return this.txn(db => db(table).query('delete').where([
      'id', '=', id
    ]).exec()).catch(e => console.log(e));
  }

  async clear (table) {
    this.txn(db => {
    return table ? 
      db(table).query('delete').exec().catch(e => console.log(e)) : 
      Promise.all(this.tables.map(table => db(table).query('delete').exec())).catch(e => console.log(e))
    });
  }

  // async modify (store, id, fn){
  //   return this.get(store, id).then(async entry => {
  //     let obj = entry || {};
  //     let result = await fn(obj, !!entry) || obj;
  //     return this.set(store, result);
  //   })
  // }

  // async merge (store, id, changes){
  //   return this.get(store, id).then((entry = {}) => {
  //     return this.set(store, id, Natives.merge(entry, changes));
  //   })
  // }
}