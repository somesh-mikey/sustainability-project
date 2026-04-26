import pg from 'pg';
const { Client } = pg;
const connectionString = 'postgresql://sustainability_user:MC7l7zq6QAtja3JnQFxnky4QKN1fqHYM@dpg-d7mj6re7r5hc7388bc40-a.oregon-postgres.render.com/sustainability_db_btry';
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
async function run() {
  try {
    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      type VARCHAR(50),
      message TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Notifications table ensured.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
