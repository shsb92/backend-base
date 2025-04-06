import fs from 'fs';
import path from 'path';
import pool from './connection.js';

const seedersDir = path.join(process.cwd(), 'src/seeders');

async function runSeeder(filePath: string) {
  try {
    console.log(`Running seeder: ${path.basename(filePath)}`);
    
    // Import the seeder module
    const seeder = await import(filePath);
    
    // Run the seeder
    await seeder.up();
    
    console.log(`✅ Seeder ${path.basename(filePath)} completed successfully`);
  } catch (error) {
    console.error(`❌ Seeder ${path.basename(filePath)} failed:`, error);
    throw error;
  }
}

export async function seed() {
  try {
    // Check if seeders directory exists
    if (!fs.existsSync(seedersDir)) {
      console.log('Seeders directory does not exist. Creating...');
      fs.mkdirSync(seedersDir, { recursive: true });
      console.log('✅ Seeders directory created');
      return;
    }
    
    // Get all seeder files
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
      .sort(); // Sort to ensure consistent order
    
    if (files.length === 0) {
      console.log('No seeders found');
      return;
    }
    
    console.log(`Found ${files.length} seeders`);
    
    // Run each seeder
    for (const file of files) {
      const filePath = path.join(seedersDir, file);
      await runSeeder(filePath);
    }
    
    console.log('✅ All seeders completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
} 