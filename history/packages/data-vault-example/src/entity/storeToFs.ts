import { ModelStore } from './ModelStore';
import fs from 'fs-extra';
import path from 'path';
export const storeToFs = async (
  store: ModelStore,
  rootDirectory: string,
  baseUrl: string = 'http://localhost:9876'
) => {
  const vaultsDirectory = path.join(rootDirectory, 'edvs');
  fs.rmdirSync(vaultsDirectory, { recursive: true });
  const vaults = await store.getAllVaults();

  vaults.forEach((vault: any) => {
    const vaultPath = path.join(vaultsDirectory, vault.id, '/index.json');
    const vaultForFs = vault.toFs(`${baseUrl}/edvs`);
    fs.outputFileSync(vaultPath, vaultForFs);
  });

  const documents = await store.getAllDocuments();

  documents.forEach((doc: any) => {
    const docPath = path.join(
      vaultsDirectory,
      doc.edvId,
      '/documents',
      doc.id,
      '/index.json'
    );
    const docForFs = doc.toFs(`${baseUrl}/edvs/${doc.edvId}/documents`);

    fs.outputFileSync(docPath, docForFs);
  });

  const indexes = await store.getAllVaultIndexes();

  indexes.forEach((index: any) => {
    const docPath = path.join(
      vaultsDirectory,
      index.edvId,
      '/indexes',
      `${index.hmacId}.json`
    );
    const docForFs = index.toFs(`${baseUrl}/edvs/${index.edvId}/indexes`);
    fs.outputFileSync(docPath, docForFs);
  });

  const chunks = await store.getAllChunks();

  chunks.forEach((chunk: any) => {
    const chunkPath = path.join(
      vaultsDirectory,
      chunk.edvId,
      '/documents',
      chunk.docId,
      '/chunks',
      `${chunk.index}/index.json`
    );
    const chunkForFs = chunk.toFs(
      `${baseUrl}/edvs/${chunk.edvId}/documents/${chunk.docId}/chunks`
    );
    fs.outputFileSync(chunkPath, chunkForFs);
  });

  const caps = await store.getAllCapabilities();
  // console.log('unsure what to do with caps', caps);
  caps.forEach((cap: any) => {
    const invocationTargeParts = cap.invocationTarget.split('/');
    if (invocationTargeParts.indexOf('documents') === 5) {
      const edvId = invocationTargeParts[4];
      const docId = invocationTargeParts[6];
      const capId = cap.id.split(':').pop();
      // console.log({ docId, edvId, capId });
      const capPath = path.join(
        vaultsDirectory,
        edvId,
        '/documents',
        docId,
        '/zcaps',
        `${capId}.json`
      );
      const capForFs = cap.toFs(
        `${baseUrl}/edvs/${edvId}/documents/${docId}/zcaps`
      );
      fs.outputFileSync(capPath, capForFs);
    }
  });

  const revocations = await store.getAllRevocations();
  // console.log('unsure what to do with revocations', revocations);

  revocations.forEach((rev: any) => {
    const invocationTargeParts = rev.invocationTarget.split('/');
    if (invocationTargeParts.indexOf('documents') === 5) {
      const edvId = invocationTargeParts[4];
      const docId = invocationTargeParts[6];
      const capId = rev.id.split(':').pop();
      // console.log({ docId, edvId, capId });
      const capPath = path.join(
        vaultsDirectory,
        edvId,
        '/documents',
        docId,
        '/revocations',
        `${capId}.json`
      );
      const capForFs = rev.toFs(
        `${baseUrl}/edvs/${edvId}/documents/${docId}/zcaps`
      );
      fs.outputFileSync(capPath, capForFs);
    }
  });
};
