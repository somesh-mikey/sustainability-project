import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    await client.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS description TEXT');
    await client.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT');
    await client.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT');
    console.log('Relaxed notifications table schema.');
  } catch (err) {
    console.error('Error fixing notifications table:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
