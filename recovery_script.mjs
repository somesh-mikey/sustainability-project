import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://sustainability_user:MC7l7zq6QAtja3JnQFxnky4QKN1fqHYM@dpg-d7mj6re7r5hc7388bc40-a.oregon-postgres.render.com/sustainability_db_btry';

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    const queries = [
      `CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS emission_factors (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255),
        activity_type VARCHAR(255),
        unit VARCHAR(50),
        factor NUMERIC,
        source VARCHAR(255),
        year INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS raw_emission_data (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        activity_type VARCHAR(255),
        value NUMERIC,
        unit VARCHAR(50),
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS calculated_emissions (
        id SERIAL PRIMARY KEY,
        raw_data_id INTEGER REFERENCES raw_emission_data(id),
        emissions_kg_co2e NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
        type VARCHAR(50),
        filters JSONB,
        file_path VARCHAR(255),
        generated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (let query of queries) {
      await client.query(query);
      console.log('Executed:', query.split('\n')[0]);
    }

    console.log('Base tables recovery check complete.');
  } catch (err) {
    console.error('Error during recovery:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
