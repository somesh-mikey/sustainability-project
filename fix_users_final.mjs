import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    // Add password_hash column if it doesn't exist
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');
    
    // Copy password to password_hash if password exists but password_hash is null
    await client.query("UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL");
    
    console.log('Fixed users table (password_hash ensure).');
  } catch (err) {
    console.error('Error fixing users table:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
