import { StorageFactory, createStorageConfig } from './index.js';

async function example() {
  // Initialize the storage system with configuration from environment variables
  const config = createStorageConfig();
  const storage = StorageFactory.getInstance(config);
  const provider = storage.getProvider();

  try {
    // Example: Store a file
    const filePath = await provider.store({
      path: 'example/test.txt',
      content: 'Hello, World!',
      contentType: 'text/plain',
      metadata: {
        author: 'System',
        created: new Date().toISOString(),
      },
    });
    console.log('File stored at:', filePath);

    // Example: Check if file exists
    const exists = await provider.exists(filePath);
    console.log('File exists:', exists);

    // Example: Get file content
    const content = await provider.get(filePath);
    console.log('File content:', content.toString());

    // Example: Delete file
    await provider.delete(filePath);
    console.log('File deleted');

    // Verify file is deleted
    const existsAfterDelete = await provider.exists(filePath);
    console.log('File exists after delete:', existsAfterDelete);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
example().catch(console.error); 