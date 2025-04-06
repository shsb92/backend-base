import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'src/migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  console.error('Usage: pnpm migrate:create <migration-name>');
  process.exit(1);
}

// Format migration name (convert to kebab case)
const formattedName = migrationName
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase();

// Create timestamp for the filename
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
const fileName = `${timestamp}-${formattedName}.ts`;
const filePath = path.join(migrationsDir, fileName);

// Migration template
const migrationTemplate = `import pool from '../core/database/connection.js';

export async function up() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add your migration logic here
    // Example:
    // await client.query(\`
    //   CREATE TABLE users (
    //     id SERIAL PRIMARY KEY,
    //     email VARCHAR(255) UNIQUE NOT NULL,
    //     username VARCHAR(50) UNIQUE NOT NULL,
    //     password_hash VARCHAR(255) NOT NULL,
    //     is_active BOOLEAN DEFAULT true,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   )
    // \`);
    
    await client.query('COMMIT');
    console.log('✅ Migration \${migrationName} completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration \${migrationName} failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add your rollback logic here
    // Example:
    // await client.query('DROP TABLE IF EXISTS users');
    
    await client.query('COMMIT');
    console.log('✅ Rollback for \${migrationName} completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback for \${migrationName} failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
`;

// Write the migration file
fs.writeFileSync(filePath, migrationTemplate);

console.log(`✅ Created migration: ${fileName}`);
console.log(`📝 Edit the file at: ${filePath}`); 