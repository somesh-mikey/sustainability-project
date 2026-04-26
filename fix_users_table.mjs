import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Check if 'name' exists, if not add it.
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT');
    console.log('Fixed users table (added name column).');
  } catch (err) {
    console.error('Error fixing users table:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
