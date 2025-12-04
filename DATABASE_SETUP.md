# FixLater - Database Setup Guide

## Prerequisites

Before running the database migrations, ensure you have:

1. **PostgreSQL Installed** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - During installation, set:
     - Superuser password: `postgres` (or your preference)
     - Port: 5432 (default)

2. **Database Created**
   Run these commands in PostgreSQL (via psql or pgAdmin):
   ```sql
   CREATE DATABASE fixlater;
   ```

3. **Environment Variables Set**
   - The `.env` file has been created at `backend/.env`
   - Current configuration:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=fixlater
     DB_USER=postgres
     DB_PASSWORD=postgres
     ```

## Running Migrations

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Test Database Connection
Before running migrations, verify your connection is working:

```bash
cd backend
npm run dev
# Check the console for "Server running on port 5000"
# Visit http://localhost:5000/api/health
# You should see: { "status": "ok", "message": "FixLater API is running" }
```

### Step 3: Run Migrations
```bash
cd backend
npm run migrate
```

This will:
- Create all tables (users, tasks, applications, reviews, notifications, etc.)
- Create indexes for performance
- Set up foreign key relationships

### Step 4: Verify Migration Success
Check that tables were created in PostgreSQL:

```sql
-- Connect to fixlater database
\c fixlater

-- List all tables
\dt

-- Check specific table structure
\d users
\d tasks
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check DB_HOST and DB_PORT in `.env`
- Verify DB_USER and DB_PASSWORD are correct

### Migration Fails
- Check that the `fixlater` database exists
- Check database user has proper permissions
- Look for SQL errors in the schema.sql file

### Port Already in Use
- Backend tries to use port 5000
- If in use, modify `PORT` in `.env`
- Or kill the process using that port

## Next Steps

After successful migration:
1. Start the backend: `npm run dev` (in backend folder)
2. Start the frontend: `npm start` (in frontend folder)
3. Or use the root script: `npm run dev` (from project root)
