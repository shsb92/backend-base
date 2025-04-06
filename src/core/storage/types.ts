export interface StorageConfig {
  type: 'local' | 's3' | 'gcs';
  local?: {
    basePath: string;
  };
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
  gcs?: {
    projectId: string;
    keyFilename: string;
    bucket: string;
  };
}

export interface StorageFile {
  path: string;
  content: Buffer | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageProvider {
  store(file: StorageFile): Promise<string>;
  get(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
} 