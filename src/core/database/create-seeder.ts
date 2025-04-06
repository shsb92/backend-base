import fs from 'fs';
import path from 'path';

const seedersDir = path.join(process.cwd(), 'src/seeders');

// Ensure seeders directory exists
if (!fs.existsSync(seedersDir)) {
  fs.mkdirSync(seedersDir, { recursive: true });
}

// Get seeder name from command line arguments
const seederName = process.argv[2];

if (!seederName) {
  console.error('Please provide a seeder name');
  console.error('Usage: pnpm seed:create <seeder-name>');
  process.exit(1);
}

// Format seeder name (convert to kebab case)
const formattedName = seederName
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase();

// Create timestamp for the filename
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
const fileName = `${timestamp}-${formattedName}.ts`;
const filePath = path.join(seedersDir, fileName);

// Seeder template
const seederTemplate = `import pool from '../core/database/connection.js';

export async function up() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add your seeding logic here
    // Example:
    // await client.query(
    //   'INSERT INTO users (email, username, password_hash, is_active) VALUES ($1, $2, $3, $4)',
    //   ['admin@example.com', 'admin', 'hashed_password', true]
    // );
    
    await client.query('COMMIT');
    console.log('✅ Seeder ${seederName} completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeder ${seederName} failed:', error);
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
    // await client.query('DELETE FROM users WHERE email = $1', ['admin@example.com']);
    
    await client.query('COMMIT');
    console.log('✅ Rollback for ${seederName} completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback for ${seederName} failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
`;

// Write the seeder file
fs.writeFileSync(filePath, seederTemplate);

console.log(`✅ Created seeder: ${fileName}`);
console.log(`📝 Edit the file at: ${filePath}`); 