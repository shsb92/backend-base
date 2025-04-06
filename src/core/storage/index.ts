import { StorageConfig, StorageProvider } from './types.js';
import { LocalStorageProvider } from './providers/local.js';
import { S3StorageProvider } from './providers/s3.js';
import { GCSStorageProvider } from './providers/gcs.js';

export class StorageFactory {
  private static instance: StorageFactory;
  private provider: StorageProvider;

  private constructor(config: StorageConfig) {
    switch (config.type) {
      case 'local':
        this.provider = new LocalStorageProvider(config);
        break;
      case 's3':
        this.provider = new S3StorageProvider(config);
        break;
      case 'gcs':
        this.provider = new GCSStorageProvider(config);
        break;
      default:
        throw new Error(`Unsupported storage type: ${config.type}`);
    }
  }

  public static getInstance(config?: StorageConfig): StorageFactory {
    if (!StorageFactory.instance && config) {
      StorageFactory.instance = new StorageFactory(config);
    }
    return StorageFactory.instance;
  }

  public getProvider(): StorageProvider {
    return this.provider;
  }
}

// Helper function to create storage configuration from environment variables
export function createStorageConfig(): StorageConfig {
  const storageType = process.env.STORAGE_TYPE || 'local';

  switch (storageType) {
    case 'local':
      return {
        type: 'local',
        local: {
          basePath: process.env.STORAGE_LOCAL_PATH || './storage',
        },
      };
    case 's3':
      return {
        type: 's3',
        s3: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          region: process.env.AWS_REGION || 'us-east-1',
          bucket: process.env.AWS_S3_BUCKET || '',
        },
      };
    case 'gcs':
      return {
        type: 'gcs',
        gcs: {
          projectId: process.env.GCS_PROJECT_ID || '',
          keyFilename: process.env.GCS_KEY_FILENAME || '',
          bucket: process.env.GCS_BUCKET || '',
        },
      };
    default:
      throw new Error(`Unsupported storage type: ${storageType}`);
  }
} 