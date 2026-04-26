import pg from 'pg';
const { Client } = pg;
const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const queries = [
      `CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        organization_id INT REFERENCES organizations(id),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        is_active BOOLEAN DEFAULT true
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        organization_id INT REFERENCES organizations(id),
        name TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS emission_factors (
        id SERIAL PRIMARY KEY,
        activity_type TEXT NOT NULL,
        unit TEXT NOT NULL,
        factor_value NUMERIC NOT NULL,
        factor_unit TEXT,
        valid_from DATE NOT NULL,
        valid_to DATE
      )`,
      `CREATE TABLE IF NOT EXISTS raw_emission_data (
        id SERIAL PRIMARY KEY,
        organization_id INT REFERENCES organizations(id),
        project_id INT REFERENCES projects(id),
        date DATE NOT NULL,
        scope TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        value NUMERIC NOT NULL,
        unit TEXT NOT NULL,
        created_by INT,
        source TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS calculated_emissions (
        id SERIAL PRIMARY KEY,
        organization_id INT REFERENCES organizations(id),
        project_id INT REFERENCES projects(id),
        raw_emission_id INT REFERENCES raw_emission_data(id),
        scope TEXT,
        calculated_value NUMERIC NOT NULL,
        calculation_version INT,
        created_at TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        organization_id INT REFERENCES organizations(id),
        type TEXT NOT NULL,
        filters JSONB,
        file_path TEXT NOT NULL DEFAULT '',
        generated_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT now()
      )`
    ];
    for (const q of queries) {
      await client.query(q);
    }
    console.log('Base tables created or already exist.');
  } catch (err) {
    console.error('Error creating base tables:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
run();
