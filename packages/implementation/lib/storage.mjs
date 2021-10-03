
import Natives from './natives.mjs';
import Normalize from './normalize.mjs';
import { nSQL as nano } from "@nano-sql/core";

function normalizeEntries(entries){
  return (Array.isArray(entries) ? entries : [entries]).map(entry => {
    if (entry.schema) entry.schema = entry.schema.trim();
    return entry;
  });
}

const modelTemplate = {
  model: {
    "id:string": { pk: true, immutable: true },
    "message:object": {
      model: {
        "header:object": { immutable: true },
        "protected:string": { immutable: true },
        "payload:string": { immutable: true },
        "signature:string": { immutable: true },
        "content:object": {
          model: {
            "type:string": { immutable: true, notNull: true },
            "format:string": { immutable: true, notNull: true },
            "nonce:string": { immutable: true },
            "root:string": { immutable: true },
            "parent:string": { immutable: true },
            "schema:string": { immutable: true, notNull: true },
            "tags:string[]": {},
            "data:any": {},
          }
        }
      }
    }
  },
  // indexes: {
  //   "message.content.schema:string": {},
  //   "message.content.tags:string[]": {}
  // }
};

const tables = [
  'stack',
  'profile',
  'permissions',
  'collections',
  'actions'
]

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
        Object.assign({}, modelTemplate, {
          name: 'profile',
        }),
        Object.assign({}, modelTemplate, {
          name: 'permissions',
        }),
        Object.assign({}, modelTemplate, {
          name: 'collections',
        }),
        Object.assign({}, modelTemplate, {
          name: 'actions',
        })
      ]
    }).then(async z => {
      // for (let table of tables) {
      //   await nano().useDatabase(table).query('rebuild indexes');
      // }
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
      'message.content.schema', '=', schema.trim()
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