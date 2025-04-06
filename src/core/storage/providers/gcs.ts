import { Storage } from '@google-cloud/storage';
import { StorageConfig, StorageFile, StorageProvider } from '../types.js';

export class GCSStorageProvider implements StorageProvider {
  private storage: Storage;
  private bucket: string;

  constructor(config: StorageConfig) {
    if (!config.gcs?.projectId || !config.gcs?.keyFilename || !config.gcs?.bucket) {
      throw new Error('GCS storage requires projectId, keyFilename, and bucket configuration');
    }

    this.storage = new Storage({
      projectId: config.gcs.projectId,
      keyFilename: config.gcs.keyFilename,
    });

    this.bucket = config.gcs.bucket;
  }

  async store(file: StorageFile): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const blob = bucket.file(file.path);

    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
    
    const metadata: any = {};
    if (file.contentType) {
      metadata.contentType = file.contentType;
    }
    if (file.metadata) {
      metadata.metadata = file.metadata;
    }

    await blob.save(content, { metadata });
    return file.path;
  }

  async get(path: string): Promise<Buffer> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(path);
    
    const [content] = await file.download();
    return content;
  }

  async delete(path: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(path);
    
    await file.delete();
  }

  async exists(path: string): Promise<boolean> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(path);
    
    const [exists] = await file.exists();
    return exists;
  }
} 