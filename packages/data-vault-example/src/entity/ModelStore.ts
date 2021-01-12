import { createConnection, MongoRepository, Connection } from 'typeorm';

import { Vault, VaultBindingModel } from './Vault';
import { Document, DocumentBindingModel } from './Document';
import { VaultIndex } from './VaultIndex';
import { Chunk, ChunkBindingModel } from './Chunk';
import { Capability, CapabilityBindingModel } from './Capability';
import { Revocation, RevocationBindingModel } from './Revocation';

class ModelStore {
  public static getConnection = async (url: string): Promise<Connection> => {
    const connection = await createConnection({
      // Typeorm does not allow two connections to have the same name
      // So we use a different name everytime in order to have parallel connections
      name: `${Date.now()}`,
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url,
      entities: [Vault, VaultIndex, Document, Capability, Revocation, Chunk],
    });
    return connection;
  };
  private connection: Connection;

  private allowDataBaseDestruction = false;

  private vaults: MongoRepository<Vault>;
  private vaultIndexes: MongoRepository<VaultIndex>;
  private documents: MongoRepository<Document>;
  private chunks: MongoRepository<Chunk>;
  private capabilities: MongoRepository<Capability>;
  private revocations: MongoRepository<Revocation>;

  public async resetDatabase(): Promise<void> {
    if (this.connection && this.allowDataBaseDestruction) {
      await this.connection.dropDatabase();
    }
  }

  constructor(connection: Connection, allowDataBaseDestruction: boolean) {
    this.connection = connection;
    this.allowDataBaseDestruction = allowDataBaseDestruction;
    this.vaults = connection.getMongoRepository(Vault);
    this.vaultIndexes = connection.getMongoRepository(VaultIndex);
    this.documents = connection.getMongoRepository(Document);
    this.capabilities = connection.getMongoRepository(Capability);
    this.revocations = connection.getMongoRepository(Revocation);
    this.chunks = connection.getMongoRepository(Chunk);
  }

  public async close(): Promise<void> {
    return this.connection!.close();
  }

  //vaults
  public createVault = async (config: VaultBindingModel): Promise<Vault> => {
    const model = Vault.fromBindingModel(config);
    await this.vaults.save(model);
    return model;
  };

  public getVaultById = async (edvId: string): Promise<Vault | undefined> => {
    return this.vaults.findOne({
      _id: edvId,
    });
  };

  public getVaultByReferenceKey = async (
    controller: string,
    referenceId: string
  ): Promise<Vault | undefined> => {
    return this.vaults.findOne({
      controller,
      referenceId,
    });
  };

  public getAllVaults = async (): Promise<Vault[]> => {
    return this.vaults.find({});
  };

  //indexes
  public createVaultIndex = async (
    edvId: string,
    hmacId: string,
    has: any,
    equals: any
  ): Promise<VaultIndex> => {
    const model = await this.vaultIndexes.findOne({
      _id: `${edvId}:${hmacId}`,
    });
    if (model) {
      model.has = has;
      model.equals = equals;
      await this.vaultIndexes.save(model);
      return model;
    } else {
      const model = VaultIndex.fromBindingModel({ edvId, hmacId, has, equals });
      model.id = `${edvId}:${hmacId}`;
      await this.vaultIndexes.save(model);
      return model;
    }
  };

  public getVaultIndex = async (
    edvId: string,
    hmacId: string
  ): Promise<VaultIndex | undefined> => {
    const vaults = await this.vaultIndexes.find({ edvId, hmacId });

    if (vaults.length > 1) {
      console.log(vaults);
      throw new Error('wtf');
    }

    return this.vaultIndexes.findOne({
      edvId,
      hmacId,
    });
  };

  public updateVaultIndex = async (
    edvId: string,
    hmacId: string,
    has: any,
    equals: any
  ): Promise<VaultIndex> => {
    const model = await this.getVaultIndex(edvId, hmacId);
    if (!model) {
      throw new Error('cannot update non existing index ' + hmacId);
    }
    model.has = has;
    model.equals = equals;

    await this.vaultIndexes.save(model);
    return model;
  };

  public getAllVaultIndexes = async (): Promise<VaultIndex[]> => {
    return this.vaultIndexes.find({});
  };

  //documents
  public createOrUpdateDocument = async (
    edvId: string,
    doc: DocumentBindingModel
  ): Promise<Document> => {
    const model = await this.documents.findOne({
      edvId,
      id: doc.id,
    });
    if (model) {
      model.jwe = doc.jwe;
      model.sequence = doc.sequence;
      model.indexed = doc.indexed;
      await this.documents.save(model);
      return model;
    } else {
      const model = Document.fromBindingModel(doc);
      model.edvId = edvId;
      await this.documents.save(model);
      return model;
    }
  };

  public getDocument = async (
    edvId: string,
    docId: string
  ): Promise<Document | undefined> => {
    return this.documents.findOne({
      edvId,
      id: docId,
    });
  };

  public getDocuments = async (
    edvId: string,
    docIds: string[]
  ): Promise<Document[]> => {
    const allDocs = await this.documents.find({
      edvId,
    });
    return allDocs.filter((doc: Document) => {
      return docIds.indexOf(doc.id) !== -1;
    });
  };

  public getAllDocuments = async (): Promise<Document[]> => {
    return this.documents.find({});
  };

  //zcaps
  public createCapability = async (
    zcap: CapabilityBindingModel
  ): Promise<Capability> => {
    const model = Capability.fromBindingModel(zcap);
    await this.capabilities.save(model);
    return model;
  };

  public getAllCapabilities = async (): Promise<Capability[]> => {
    return this.capabilities.find({});
  };

  public getAuthorization = async (
    id: string,
    invocationTarget: string
  ): Promise<Capability | undefined> => {
    const cap = await this.capabilities.findOne({ id, invocationTarget });
    if (!cap) {
      return undefined;
    }
    const revoked = await this.revocations.findOne({ id });
    if (revoked) {
      return undefined;
    }
    return cap;
  };

  //revocations
  public createRevocation = async (
    revocation: RevocationBindingModel
  ): Promise<Revocation> => {
    const model = Revocation.fromBindingModel(revocation);
    await this.revocations.save(model);

    const cap = await this.capabilities.findOne({ id: revocation.id });

    if (cap) {
      await this.capabilities.remove(cap);
    }

    return model;
  };

  public getAllRevocations = async (): Promise<Revocation[]> => {
    return this.revocations.find({});
  };

  //chunks
  public createChunk = async (
    edvId: string,
    docId: string,
    chunk: ChunkBindingModel
  ): Promise<Chunk> => {
    const model = Chunk.fromBindingModel(chunk);
    model.edvId = edvId;
    model.docId = docId;
    await this.chunks.save(model);
    return model;
  };

  public getChunk = async (
    edvId: string,
    docId: string,
    chunkIndex: number
  ): Promise<Chunk | undefined> => {
    const model = await this.chunks.findOne({
      edvId,
      docId,
      index: chunkIndex,
    });
    return model;
  };

  public getAllChunks = async (): Promise<Chunk[]> => {
    return this.chunks.find({});
  };

  public storeDocument = async (
    edvId: string,
    doc: any,
    create = false
  ): Promise<Document> => {
    if (create) {
      // check uniqueness constraint
      for (const entry of doc.indexed) {
        const vaultIndexes: any = await this.getVaultIndex(
          edvId,
          entry.hmac.id
        );

        if (!vaultIndexes || !vaultIndexes.equals) {
          continue;
        }
        for (const attribute of entry.attributes) {
          if (!attribute.unique) {
            continue;
          }
          const key = attribute.name + '=' + attribute.value;
          if (vaultIndexes.equals[key]) {
            throw new Error('Duplicate error.');
          }
        }
      }
    }

    const oldDoc = await this.getDocument(edvId, doc.id);

    if (oldDoc) {
      // remove old doc from indexes on update.
      for (const entry of (oldDoc as any).indexed) {
        const vaultIndexes: any = await this.getVaultIndex(
          edvId,
          entry.hmac.id
        );

        for (const attribute of entry.attributes) {
          delete vaultIndexes.equals[attribute.name + '=' + attribute.value];
          delete vaultIndexes.has[attribute.name];
        }

        await this.updateVaultIndex(
          edvId,
          entry.hmac.id,
          vaultIndexes.has,
          vaultIndexes.equals
        );
      }
    }

    for (const entry of doc.indexed) {
      let vaultIndexes: any = await this.getVaultIndex(edvId, entry.hmac.id);

      if (!vaultIndexes) {
        vaultIndexes = await this.createVaultIndex(
          edvId,
          entry.hmac.id,
          {},
          {}
        );
      }

      for (const attribute of entry.attributes) {
        let docSet =
          vaultIndexes.equals[attribute.name + '=' + attribute.value];

        if (attribute.unique || !docSet) {
          docSet = [];
          vaultIndexes.equals[attribute.name + '=' + attribute.value] = docSet;
        }

        if (docSet.indexOf(doc.id) === -1) {
          docSet.push(doc.id);
        }

        ///

        docSet = vaultIndexes.has[attribute.name];
        if (!docSet) {
          docSet = [];
          vaultIndexes.has[attribute.name] = docSet;
        }

        if (docSet.indexOf(doc.id) === -1) {
          docSet.push(doc.id);
        }
      }

      await this.updateVaultIndex(
        edvId,
        entry.hmac.id,
        vaultIndexes.has,
        vaultIndexes.equals
      );
    }

    return this.createOrUpdateDocument(edvId, doc);
  };

  public queryEdv = async (edvId: string, query: any) => {
    const config = await this.getVaultById(edvId);

    if (!config) {
      // edv does not exist
      // return [404, undefined];

      throw new Error('Vault does not exist');
    }
    const vaultIndex = await this.getVaultIndex(edvId, query.index);

    if (!vaultIndex) {
      throw new Error('Vault index does not exist');
    }

    const find = async ({ index, key }: any) => {
      const docIds = index[key];
      if (!docIds) {
        return [];
      }

      return this.getDocuments(edvId, docIds);
    };

    // build results
    const results: any = [];
    if (query.equals) {
      for (const equals of query.equals) {
        let matches = null;
        for (const key in equals) {
          const value = equals[key];
          const docs = await find({
            index: vaultIndex.equals,
            key: key + '=' + value,
          });
          if (!matches) {
            // first result
            matches = docs;
          } else {
            // remove any docs from `matches` that are not in `docs`
            matches = matches.filter((x: any) => docs.includes(x));
            if (matches.length === 0) {
              break;
            }
          }
        }
        (matches || []).forEach((x: any) => {
          if (!results.includes(x)) {
            results.push(x);
          }
        });
      }
    }

    if (query.has) {
      let matches = null;
      for (const key of query.has) {
        const docs = await find({ index: vaultIndex.has, key });
        if (!matches) {
          // first result
          matches = docs;
        } else {
          // remove any docs from `matches` that are not in `docs`
          matches = matches.filter((x: any) => docs.includes(x));
          if (matches.length === 0) {
            break;
          }
        }
      }
      results.push(...(matches || []));
    }
    if (query.count === true) {
      return { count: results.length };
    } else {
      return { documents: results };
    }
  };
}

export { ModelStore };
