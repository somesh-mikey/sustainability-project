# Sustainability Project — Backend ✅

A lightweight backend API for tracking projects and calculating emissions. This repository contains the API server, database access layer, seeding script, and calculation logic for converting raw activity data into CO2-equivalent emissions.

---

## Table of Contents

- [Quick start](#quick-start)
- [Environment](#environment)
- [Database setup](#database-setup)
- [API endpoints](#api-endpoints)
- [CSV upload](#csv-upload)
- [Reports](#reports)
- [Dashboard](#dashboard)
- [Recalculate emissions](#recalculate-emissions)
- [Seeding](#seeding)
- [Emission factors import](#emission-factors-import)
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
  factor_unit TEXT,
  valid_from DATE NOT NULL,
  valid_to DATE
);

-- raw emission data
CREATE TABLE raw_emission_data (
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
);

-- calculated emissions
CREATE TABLE calculated_emissions (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  project_id INT REFERENCES projects(id),
  raw_emission_id INT REFERENCES raw_emission_data(id),
  scope TEXT,
  calculated_value NUMERIC NOT NULL,
  calculation_version INT,
  created_at TIMESTAMP DEFAULT now()
);

-- reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id),
  type TEXT NOT NULL,
  filters JSONB,
  file_path TEXT NOT NULL,
  generated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);
```

### Additional PRD screen tables

To support the newly added screens (API Integrations, Data Requests, Talk With Your Team), run:

```bash
psql -U postgres -d sustainability_db -f migrations/20260222_add_prd_screen_tables.sql
```

This migration creates:
- `integrations`
- `data_requests`
- `messages`

---

## API endpoints 🧭

### Authentication
- **POST `/auth/login`** — obtain JWT token
  - **Body**: `{ "email": "admin@company.com", "password": "admin123" }`
  - **Response**: `{ "success": true, "data": { "token": "...", "user": { "id": "...", "name": "...", "role": "..." } } }`
  - **Note**: Use the token in `Authorization: Bearer <token>` header for all protected endpoints

### Projects
- **GET `/projects`** — list all projects for the authenticated user
  - **Auth**: Required (Bearer token)
  - **Response**: `{ "success": true, "data": [ { "id": "...", "name": "Project A", "location": "...", ... } ] }`

- **POST `/projects`** — create a new project (Admin/Manager only)
  - **Auth**: Required (Bearer token, admin or manager role)
  - **Body**: `{ "name": "Project A", "location": "City" }`
  - **Response**: `{ "success": true, "data": { "id": "...", ... } }`

### Emissions
- **GET `/emissions`** — retrieve emissions data for the authenticated user's organization
  - **Auth**: Required (Bearer token)
  - **Query Parameters** (all optional):
    - `project_id` — Filter by project ID
    - `scope` — Filter by scope value (`scope_1`, `scope_2`, `scope_3`)
    - `from` — Start date (YYYY-MM-DD format)
    - `to` — End date (YYYY-MM-DD format)
  - **Example**: `GET /emissions?project_id=1&scope=scope_2&from=2024-01-01&to=2024-12-31`
  - **Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "raw_emission_id": "...",
          "date": "2024-02-01",
          "scope": "scope_1",
          "activity_type": "electricity",
          "value": 500,
          "unit": "kWh",
          "project_name": "Plant A",
          "calculated_value": "..."
        }
      ]
    }
    ```

- **POST `/emissions`** — submit raw emission data (Admin/Manager only)
  - **Auth**: Required (Bearer token, admin or manager role)
  - **Body**:
    ```json
    {
      "project_id": 1,
      "date": "2024-02-01",
      "scope": "scope_1",
      "activity_type": "electricity",
      "value": 500,
      "unit": "kWh"
    }
    ```
  - **Required fields**: `project_id`, `date`, `scope`, `activity_type`, `value`, `unit`
  - **Response**: `{ "success": true, "data": { "id": "...", ... } }`
  - **Note**: On emission creation, the service automatically calculates and persists the result in the `calculated_emissions` table

---

## CSV upload 📤

- **POST `/upload/emissions`** — bulk upload emissions from CSV (Admin/Manager only)
  - **Auth**: Required (Bearer token, admin or manager role)
  - **Content-Type**: `multipart/form-data`
  - **File field name**: `file`
  - **CSV headers required**: `project_id,date,scope,activity_type,value,unit`
  - **Scope values**: `scope_1`, `scope_2`, `scope_3`
  - **Response**:
    ```json
    {
      "success": true,
      "data": { "inserted": 10, "failed": 2, "errors": [ ... ] }
    }
    ```

---

## Reports 🧾

- **POST `/reports/csv`** — generate and download a CSV report (Admin/Manager only)
- **POST `/reports/pdf`** — generate and download a PDF report (Admin/Manager only)
  - **Auth**: Required (Bearer token, admin or manager role)
  - **Body** (all optional filters):
    ```json
    {
      "project_id": 1,
      "scope": "scope_2",
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
    ```
  - **Response**: File download

---

## Dashboard 📊

- **GET `/dashboard/summary`** — KPI totals by scope
- **GET `/dashboard/scope-breakdown`** — scope totals for pie/donut charts
- **GET `/dashboard/trends`** — monthly trend (optional query params: `project_id`, `scope`)
  - **Auth**: Required (Bearer token)

---

## Recalculate emissions 🔄

- **POST `/recalculate/emissions`** — re-run emission calculations using the latest calculation version (Admin only)
  - **Auth**: Required (Bearer token, admin role)
  - **Body** (all optional filters):
    ```json
    {
      "project_id": 1,
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "total_raw_records": 120,
        "recalculated": 40,
        "skipped": 80,
        "version": 2
      }
    }
    ```

---

## Testing the API with Postman 📝

### Step 1: Login
1. Create a **POST** request to `http://localhost:5000/auth/login`
2. Go to **Body** → Select **raw** → Select **JSON**
3. Paste:
   ```json
   {
     "email": "admin@company.com",
     "password": "admin123"
   }
   ```
4. Click **Send**
5. Copy the `token` from the response

### Step 2: Test GET /emissions
1. Create a **GET** request to `http://localhost:5000/emissions`
2. Go to **Authorization** tab → Select "Bearer Token" → Paste your token
3. Click **Send**
4. You should see all emissions for your organization

### Step 3: Test POST /emissions
1. First, get a valid project ID: **GET** `/projects` with your token
2. Copy a project's UUID
3. Create a **POST** request to `http://localhost:5000/emissions`
4. Go to **Authorization** → Paste your token
5. Go to **Body** → Select **raw** → Select **JSON**
3. Paste (replace project_id with your actual ID):
   ```json
   {
     "project_id": 1,
     "date": "2024-02-01",
     "scope": "scope_1",
     "activity_type": "electricity",
     "value": 500,
     "unit": "kWh"
   }
   ```
7. Click **Send**
8. You should get a 201 response with the created emission

---

## Seeding 🌱

A helper exists to create a sample organization and an admin user:

```bash
npm run seed
```

This script inserts an organization and an admin user (`admin@company.com` / `admin123`). Ensure your DB tables exist before running it.

---

## Emission factors import ♻️

To load emission factors from a CSV file:

```bash
node scripts/importEmissionFactors.js
```

The script expects an `emission_factors.csv` file in the backend root with columns:
`activity_type,unit,factor_value,factor_unit,valid_from`.

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
