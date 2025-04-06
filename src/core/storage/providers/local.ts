import fs from 'fs/promises';
import path from 'path';
import { StorageConfig, StorageFile, StorageProvider } from '../types.js';

export class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(config: StorageConfig) {
    if (!config.local?.basePath) {
      throw new Error('Local storage requires a basePath configuration');
    }
    this.basePath = config.local.basePath;
  }

  async store(file: StorageFile): Promise<string> {
    const fullPath = path.join(this.basePath, file.path);
    const dirPath = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Write file
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
    await fs.writeFile(fullPath, content);

    return file.path;
  }

  async get(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, filePath);
    return await fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await fs.unlink(fullPath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
} 