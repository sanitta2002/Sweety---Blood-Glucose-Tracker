# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking web application built with **React**, **Node.js + Express**, and **PostgreSQL** in **TypeScript**. Sweety allows patients with diabetes to record up to 4 readings per day across designated meal-time slots and view detailed daily and monthly health reports.

---

## Features

### 1. Authentication & Security
- User registration and login with email and password.
- Passwords securely hashed with `bcrypt` (never stored in plain text).
- Secure JWT-based session tokens with 7-day expiration.
- Complete user isolation: authenticated users only access and modify their own readings.
- Pre-configured demo account for evaluation.

### 2. Blood Glucose Readings (CRUD)
- Record readings with:
  - **Date**: YYYY-MM-DD
  - **Time Slot**: Morning (fasting), After breakfast, After lunch, After dinner
  - **Value**: Integer in mg/dl
- Validation rules:
  - Value required (`"Please enter a glucose value."`)
  - Value range check between 40 and 600 mg/dl (`"Value must be between 40 and 600 mg/dl."`)
  - One reading per slot per day (`"You already have an [Slot] reading for this date."`)
  - Maximum 4 readings per day limit (`"You can add only 4 readings per day."`)
  - No future dates (`"Date cannot be in the future."`)
- Edit and delete existing readings with instant report recalculation.

### 3. Comprehensive Reports
- **Daily Report**: Selected date summary with highest, lowest, and average (rounded to 1 decimal) values, reading count, and a chronological breakdown of each slot reading.
- **Month-to-Date Report**: Summarizes from the 1st of the month up to the selected date.
- **Monthly Report**: Complete summary for the entire preceding calendar month.
- Friendly empty states when no readings exist for the specified date range.

---

## Tech Stack & Architecture

- **Backend**: Node.js, Express 5, TypeScript, PostgreSQL (`pg` connection pool), `bcrypt`, `jsonwebtoken`
  - Layered Clean Architecture: `Routes` ➔ `Controllers` ➔ `Services` ➔ `Repositories` ➔ `Database`
  - Zero `any` types throughout the codebase
  - Type-safe custom `AppError` and centralized error handling middleware
  - Centralized constants for all messages and HTTP status codes
  - Dedicated DTOs (`src/dto/`) and domain types (`src/types/`)
- **Frontend**: React 18, TypeScript, Vite, CSS Custom Properties
  - Component-driven architecture (`AuthView`, `ReportsView`, `ReadingHistoryTable`, `ReadingFormModal`)
  - Context API for global authentication state management
  - Vite API proxy to backend (`http://localhost:5000`)
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) via `tsx`

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended, developed on v24)
- [PostgreSQL](https://www.postgresql.org/) (v14+ recommended)

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Sweety – Blood Glucose Tracker"
```

### 2. Environment Configuration
Copy `.env.example` to `server/.env` and update your PostgreSQL connection string:

```bash
cp .env.example server/.env
```

Ensure `server/.env` contains:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sweety_db
JWT_SECRET=sweety_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
SALT_ROUNDS=10
NODE_ENV=development
```

### 3. Database Setup & Migrations
Create your PostgreSQL database:
```sql
CREATE DATABASE sweety_db;
```

Run the database schema files located in `server/src/database/migrations/`:
```bash
# Using psql CLI:
psql -d sweety_db -f server/src/database/migrations/001_create_users.sql
psql -d sweety_db -f server/src/database/migrations/002_create_readings.sql
```

### 4. Seed Demo Data
Populate the database with a demo patient and realistic sample readings across current and previous months:
```bash
cd server
npm run seed
```

**Demo Account Credentials:**
- **Email:** `demo@sweety.com`
- **Password:** `password123`

---

## Running the Application

### 1. Start the Server (Backend)
```bash
cd server
npm install
npm run dev
```
The API server will boot on `http://localhost:5000`. You can verify by visiting:
- `GET http://localhost:5000/api/health`

### 2. Start the Client (Frontend)
In a separate terminal window:
```bash
cd client
npm install
npm run dev
```
The React frontend will be accessible at `http://localhost:3000`.

---

## Running Tests

### Backend Unit Tests
Execute the unit test suite covering input validators, error handling, slot uniqueness, max readings limits, and report generation:

```bash
cd server
npm test
```
Result: **29/29 passing tests**.

---

## Assumptions & Engineering Notes

### Assumptions
1. **Time Slots**: Fasting blood glucose is taken in the `Morning (fasting)` slot; post-prandial readings correspond to `After breakfast`, `After lunch`, and `After dinner`.
2. **Date Boundaries**: Date validation compares against the user's current calendar day to prevent future readings.
3. **Monthly Report Range**: Defined as the whole calendar month immediately preceding the active selected date (e.g., if October 15, 2026 is selected, the monthly report evaluates September 1 to September 30, 2026).
4. **Rounding**: Average glucose calculations are rounded to 1 decimal place (e.g., `122.7 mg/dl`).

### What I'd Improve With More Time
- **Interactive Charts**: Add monthly trend charts using Recharts or Chart.js to visualize daily fluctuations and target range compliance.
- **Docker Compose**: Include a `docker-compose.yml` to spin up PostgreSQL, the Node.js API, and the React client with a single command (`docker compose up`).
- **Redis Caching**: Cache expensive report queries with automatic invalidation whenever a reading is added, edited, or deleted.
- **Export to PDF/CSV**: Allow patients to export their monthly report for sharing with their healthcare provider.
- **Doctor Role**: Add role-based access control (RBAC) allowing medical professionals to view aggregated reports for assigned patients.
