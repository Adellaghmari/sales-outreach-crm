import fs from 'fs';
import path from 'path';
import pool from './index';

async function setup() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Running database schema...');
  await pool.query(schema);
  console.log('Schema applied successfully.');
  await pool.end();
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
