# Sustainability Project — Backend ✅

A lightweight backend API for tracking projects and calculating emissions. This repository contains the API server, database access layer, seeding script, and calculation logic for converting raw activity data into CO2-equivalent emissions.

---

## Table of Contents

- [Quick start](#quick-start)
- [Environment](#environment)
- [Database setup](#database-setup)
- [API endpoints](#api-endpoints)
- [Seeding](#seeding)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Quick start ⚡

Clone the repo and run the backend only:

```bash
# clone the repository (if you haven't already)
git clone https://github.com/somesh-mikey/sustainability-project.git

# work in the backend folder
cd sustainability-project/backend

# install dependencies
npm install

# create a .env file (see Environment section)
# run the server
npm run dev
```

The server listens on `PORT` (default: `5000`).

---

## Environment 🔧

Create a `.env` file at `backend/.env` with at least the following variables:

```
PORT=5000
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret
```

Notes:
- The DB defaults in `src/db.js` assume a local Postgres setup (`user=postgres`, `database=sustainability_db`, `port=5432`).
- If you use another connection setup, update `src/db.js` accordingly.

---

## Database setup 🗄️

This project expects the following minimal tables. Create them in your Postgres DB before running the app or the seeder.

```sql
-- organizations
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT
);

-- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  is_active BOOLEAN DEFAULT true
);

-- projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  name TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

-- emission factors
CREATE TABLE emission_factors (
  id SERIAL PRIMARY KEY,
  activity_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  factor_value NUMERIC NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE
);

-- raw emission data
CREATE TABLE raw_emission_data (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  project_id INT REFERENCES projects(id),
  date DATE NOT NULL,
  scope INT NOT NULL,
  activity_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_by INT
);

-- calculated emissions
CREATE TABLE calculated_emissions (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  project_id INT REFERENCES projects(id),
  raw_emission_id INT REFERENCES raw_emission_data(id),
  scope INT,
  calculated_value NUMERIC NOT NULL,
  calculation_version INT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## API endpoints 🧭

- POST `/auth/login` — obtain JWT token
  - body: `{ "email": "admin@company.com", "password": "admin123" }`
  - response: `{ data: { token, user } }`
  - Use the token in `Authorization: Bearer <token>` header for protected endpoints

- GET `/projects` — list projects for the authenticated user
- POST `/projects` — create a project (Admin/Manager)
  - body: `{ "name": "Project A", "location": "City" }`

- POST `/emissions` — submit raw emission data (Admin/Manager)
  - body: `{ "project_id": 1, "date": "2025-12-01", "scope": 1, "activity_type": "fuel", "value": 100, "unit": "liters" }`

On emission creation the service inserts the raw row and runs calculation logic to persist a result in `calculated_emissions`.

---

## Seeding 🌱

A helper exists to create a sample organization and an admin user:

```bash
npm run seed
```

This script inserts an organization and an admin user (`admin@company.com` / `admin123`). Ensure your DB tables exist before running it.

---

## Development 🧪

- Recommended Node: 18+ (or current LTS)
- Run development server: `npm run dev`
- Add tests and CI: Consider adding GitHub Actions to run linting and tests on push

---

## Contributing 🤝

Contributions are welcome — open an issue or a PR with a bugfix or a feature. Please include clear steps to reproduce and tests where appropriate.

---

## License 📄

This project does not include a LICENSE file by default. Add a `LICENSE` if you want to define usage terms.

---

If you want, I can also add a basic GitHub Actions workflow (CI) and a more detailed `README` section for deployment or Dockerization.