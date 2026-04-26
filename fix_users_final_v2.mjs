import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Drop not-null from password if it exists
    await client.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
    // Ensure password_hash is NOT NULL if that's what the code expects
    // But first, let's just make sure both exist.
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');
    console.log('Relaxed password constraints on users table.');
  } catch (err) {
    console.error('Error fixing users table:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
