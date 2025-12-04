# Quick Start Guide - FixLater

## Prerequisites Check ✅

Before starting, ensure you have:
- [ ] Node.js installed (v14+)
- [ ] PostgreSQL installed (v12+) and running
- [ ] Git (optional, but recommended)

## Setup Steps (5-10 minutes)

### 1. Create PostgreSQL Database
```bash
# Open PostgreSQL prompt (psql or pgAdmin)
CREATE DATABASE fixlater;
```

### 2. Install Dependencies
```bash
# From project root
npm run install-all

# Or manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Run Database Migrations
```bash
cd backend
npm run migrate

# Success output: "Database migration completed successfully"
```

### 4. Start Development Servers
```bash
# From project root:
npm run dev

# Or separately:
# Terminal 1 - Backend:
cd backend && npm run dev

# Terminal 2 - Frontend:
cd frontend && npm start
```

### 5. Verify Everything Works
- Backend: Visit `http://localhost:5000/api/health`
  - Should return: `{"status":"ok","message":"FixLater API is running"}`
  
- Frontend: Visit `http://localhost:3000`
  - Should see the FixLater landing page

---

## Environment Configuration

**File:** `backend/.env`

Current defaults (for local development):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fixlater
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=fixlater_development_secret_key_change_in_production
```

### To Use Your Own PostgreSQL Password:
1. Open `backend/.env`
2. Change `DB_PASSWORD=postgres` to your actual password
3. Restart the backend server

### To Enable File Uploads:
1. Get AWS S3 credentials or Cloudflare R2 account
2. Update in `backend/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=fixlater-uploads
   ```

---

## Testing the API

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "user_type": "provider",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response will include a JWT token - use it for authenticated requests:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### "Port 5000 already in use"
- Change `PORT` in `backend/.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify DB_PASSWORD in `.env` matches your PostgreSQL password
- Ensure database `fixlater` exists: `CREATE DATABASE fixlater;`

### "Migration failed"
- Check PostgreSQL error logs
- Verify user permissions: `ALTER USER postgres SUPERUSER;`
- Drop and recreate database if needed

### "Dependencies not installing"
- Delete `node_modules` folder
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## Project Structure Overview

```
FixLater/
├── backend/                    # Node.js/Express server
│   ├── .env                   # Configuration (created)
│   ├── server.js              # Entry point
│   ├── config/                # Database setup
│   ├── middleware/            # Auth middleware
│   ├── routes/                # API endpoints
│   ├── migrations/            # Database schema
│   └── package.json           # Dependencies
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth context
│   │   ├── utils/            # API helpers
│   │   └── App.js            # Main component
│   └── package.json          # Dependencies
│
└── package.json              # Root config (scripts)
```

---

## Common Commands

```bash
# From project root:
npm run dev              # Start both backend and frontend

# From backend folder:
npm run dev             # Start server with auto-reload (nodemon)
npm run start           # Start server (production)
npm run migrate         # Run database migrations

# From frontend folder:
npm start               # Start development server
npm run build           # Create production build
npm test                # Run tests

# Useful utilities:
npm cache clean --force # Clear npm cache if issues
rm -r node_modules      # Remove dependencies (reinstall with npm install)
```

---

## What's Next?

1. ✅ Get the app running locally
2. ⬜ Test authentication flow (register/login)
3. ⬜ Test task creation
4. ⬜ Test provider application flow
5. ⬜ Configure file uploads (AWS/R2)
6. ⬜ Run full integration testing

---

## Support Files

For more detailed information:
- 📄 `DATABASE_SETUP.md` - Database configuration guide
- 📄 `README.md` - Full project documentation
- 📄 `CRITICAL_PATH_COMPLETE.md` - Detailed task completion report

**Questions?** Check the documentation files or the code comments!
