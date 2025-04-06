import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { StorageConfig, StorageFile, StorageProvider } from '../types.js';

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    if (!config.s3?.accessKeyId || !config.s3?.secretAccessKey || !config.s3?.region || !config.s3?.bucket) {
      throw new Error('S3 storage requires accessKeyId, secretAccessKey, region, and bucket configuration');
    }

    this.client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });

    this.bucket = config.s3.bucket;
  }

  async store(file: StorageFile): Promise<string> {
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: file.path,
      Body: content,
      ContentType: file.contentType,
      Metadata: file.metadata,
    });

    await this.client.send(command);
    return file.path;
  }

  async get(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    const response = await this.client.send(command);
    const chunks: Uint8Array[] = [];
    
    // @ts-ignore - response.Body is a ReadableStream
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    await this.client.send(command);
  }

  async exists(path: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      // @ts-ignore - error.name exists
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
} 