import pg from 'pg';
const { Client } = pg;
const connectionString = 'postgresql://sustainability_user:MC7l7zq6QAtja3JnQFxnky4QKN1fqHYM@dpg-d7mj6re7r5hc7388bc40-a.oregon-postgres.render.com/sustainability_db_btry';
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
async function run() {
  try {
    await client.connect();
    // Add missing columns to organizations
    await client.query('ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(255)');
    await client.query('ALTER TABLE organizations ADD COLUMN IF NOT EXISTS size VARCHAR(50)');
    await client.query('ALTER TABLE organizations ADD COLUMN IF NOT EXISTS location VARCHAR(255)');
    
    // Add missing column to notifications if that's what failed earlier (though fix_notifications_types probably handles it)
    await client.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)');
    
    // Add type to users if missing
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS type VARCHAR(50)');
    
    console.log('Schema fixes applied.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
