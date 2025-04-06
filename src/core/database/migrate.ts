import fs from 'fs';
import path from 'path';
import pool from './connection.js';

const migrationsDir = path.join(process.cwd(), 'src/migrations');

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Migrations table created or already exists');
  } catch (error) {
    console.error('❌ Failed to create migrations table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all executed migrations
async function getExecutedMigrations() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('❌ Failed to get executed migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Mark a migration as executed
async function markMigrationAsExecuted(name: string) {
  const client = await pool.connect();
  try {
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    console.log(`✅ Marked migration as executed: ${name}`);
  } catch (error) {
    console.error(`❌ Failed to mark migration as executed: ${name}`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Run a migration
async function runMigration(filePath: string) {
  try {
    console.log(`Running migration: ${path.basename(filePath)}`);
    
    // Import the migration module
    const migration = await import(filePath);
    
    // Run the migration
    await migration.up();
    
    // Mark as executed
    await markMigrationAsExecuted(path.basename(filePath));
    
    console.log(`✅ Migration ${path.basename(filePath)} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${path.basename(filePath)} failed:`, error);
    throw error;
  }
}

export async function migrate() {
  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('Migrations directory does not exist. Creating...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✅ Migrations directory created');
      return;
    }
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    
    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
      .sort(); // Sort to ensure consistent order
    
    if (files.length === 0) {
      console.log('No migrations found');
      return;
    }
    
    console.log(`Found ${files.length} migrations`);
    
    // Run pending migrations
    for (const file of files) {
      if (!executedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        await runMigration(filePath);
      } else {
        console.log(`⏭️ Skipping already executed migration: ${file}`);
      }
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migrate function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
} 