import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users table:', res.rows);
  } catch (err) {
    console.error('Error debugging schema:', err.message);
  } finally {
    await client.end();
  }
}
run();
