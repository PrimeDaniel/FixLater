# Setup Checklist - FixLater

Use this checklist to ensure your project is fully set up and ready to work.

---

## Pre-Installation ✅

### Prerequisites
- [ ] Node.js installed (v14+) - verify: `node --version`
- [ ] npm installed (v6+) - verify: `npm --version`
- [ ] PostgreSQL installed (v12+) - verify: `psql --version`
- [ ] Git installed (optional) - verify: `git --version`
- [ ] Text editor/IDE ready (VS Code recommended)
- [ ] All project files downloaded

---

## Initial Setup

### Step 1: PowerShell Configuration (Windows Only)
- [ ] Open PowerShell as Administrator
- [ ] Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- [ ] Answer `Y` to confirm
- [ ] Close and reopen PowerShell

### Step 2: Environment Files
- [ ] `backend/.env` created ✅ (Already done)
- [ ] `backend/.env.example` created ✅ (Already done)
- [ ] Reviewed environment variables
- [ ] Updated DB_PASSWORD if different from "postgres"

### Step 3: PostgreSQL Setup
- [ ] PostgreSQL service is running
- [ ] Can connect to PostgreSQL: `psql -U postgres -c "SELECT 1"`
- [ ] Database "fixlater" created: `CREATE DATABASE fixlater;`

---

## Installation

### Step 4: Install Dependencies
- [ ] Run: `npm run install-all`
- [ ] Wait for all packages to install
- [ ] No errors during installation
- [ ] node_modules folder created

---

## Database Setup

### Step 5: Run Migrations
- [ ] Navigate to backend: `cd backend`
- [ ] Run: `npm run migrate`
- [ ] See success message: "Database migration completed successfully"
- [ ] Verify tables created:
  ```bash
  psql -U postgres -d fixlater -c "\dt"
  ```
  Should show:
  - users
  - tasks
  - task_images
  - task_availability_slots
  - applications
  - reviews
  - notifications

---

## Server Verification

### Step 6: Start Backend
- [ ] From root folder: `cd backend`
- [ ] Run: `npm run dev`
- [ ] See message: "Server running on port 5000"
- [ ] No errors in console

### Step 7: Test Backend
- [ ] In new terminal, run:
  ```bash
  curl http://localhost:5000/api/health
  ```
- [ ] Response shows: `{"status":"ok","message":"FixLater API is running"}`

### Step 8: Start Frontend
- [ ] From root folder: `cd frontend`
- [ ] Run: `npm start`
- [ ] Browser opens automatically to http://localhost:3000
- [ ] See FixLater landing page

---

## Basic Functionality Testing

### Step 9: Test Registration
- [ ] Click "Register" button
- [ ] Fill form with:
  - Email: `test@example.com`
  - Password: `Password123`
  - User Type: Select "Provider"
  - Name: `Test User`
- [ ] Click Submit
- [ ] Redirected to dashboard

### Step 10: Test Login
- [ ] Click Logout
- [ ] Click "Login"
- [ ] Enter credentials from Step 9
- [ ] Click Submit
- [ ] Logged back in successfully

### Step 11: Test Task Creation (if requester role available)
- [ ] Create task with:
  - Title: "Test Task"
  - Description: "Test Description"
  - Category: "cleaning"
  - Location: "Test Location"
  - Price: "100"
- [ ] Task created successfully

---

## Documentation Review

### Step 12: Read Core Documentation
- [ ] Read: QUICK_START.md (5 min)
- [ ] Skim: ARCHITECTURE.md (10 min)
- [ ] Skim: API_DOCUMENTATION.md (find endpoints you'll use)
- [ ] Bookmark: TROUBLESHOOTING.md (for later)

### Step 13: Setup Postman (Optional but Recommended)
- [ ] Download Postman from postman.com
- [ ] Import `FixLater_API.postman_collection.json`
- [ ] Set variable: `{{TOKEN}}` = your JWT token from Step 9
- [ ] Test a few endpoints

---

## Configuration Fine-Tuning

### Step 14: Configure API Endpoint (If Deployed)
- [ ] Check: `frontend/src/utils/api.js`
- [ ] Verify API_BASE_URL points to correct backend
- [ ] For local: `http://localhost:5000/api`
- [ ] For production: `https://api.fixlater.com/api`

### Step 15: Configure AWS/File Upload (Optional)
- [ ] If using file upload feature:
  - [ ] Get AWS S3 credentials
  - [ ] Update `backend/.env`:
    ```env
    AWS_ACCESS_KEY_ID=your_key
    AWS_SECRET_ACCESS_KEY=your_secret
    AWS_BUCKET_NAME=your_bucket
    ```
  - [ ] Restart backend: Stop (Ctrl+C) and run `npm run dev`
  - [ ] Test file upload

---

## Development Environment

### Step 16: Install Recommended VS Code Extensions
- [ ] Thunder Client (API testing)
- [ ] ES7+ React snippets
- [ ] Prettier (code formatter)
- [ ] PostgreSQL Explorer
- [ ] Git Graph

### Step 17: Configure Code Style
- [ ] Review: DEVELOPMENT_WORKFLOW.md
- [ ] Understand: JavaScript naming conventions
- [ ] Understand: Commit message format
- [ ] Setup git (if using): `git config user.name "Your Name"`

### Step 18: Create Your First Feature Branch
- [ ] Run: `git checkout -b feature/test-feature`
- [ ] Make a small change
- [ ] Commit: `git commit -m "feat: test commit"`
- [ ] Review: DEVELOPMENT_WORKFLOW.md for style

---

## Final Verification

### Step 19: Full Workflow Test
- [ ] Stop all servers (Ctrl+C in both terminals)
- [ ] Start fresh:
  ```bash
  npm run dev
  ```
  (from root folder)
- [ ] Backend starts on port 5000 ✓
- [ ] Frontend starts on port 3000 ✓
- [ ] Can see landing page ✓
- [ ] Can register ✓
- [ ] Can login ✓

### Step 20: Cleanup
- [ ] Close all extra files/tabs
- [ ] Keep terminals running:
  - Terminal 1: Backend (`npm run dev` in /backend)
  - Terminal 2: Frontend (`npm start` in /frontend)
- [ ] Note the URLs:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000/api
  - Database: localhost:5432

---

## Troubleshooting Checklist

### If something doesn't work:
- [ ] Check error message in console
- [ ] Restart the server (Ctrl+C and run again)
- [ ] Check TROUBLESHOOTING.md for your specific error
- [ ] Verify all prerequisites installed
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Delete node_modules and reinstall: `npm install`
- [ ] Check database connection: `psql -U postgres -d fixlater`

### If you're stuck:
- [ ] Check TROUBLESHOOTING.md
- [ ] Search documentation for error message
- [ ] Review server logs (in terminal running `npm run dev`)
- [ ] Use browser DevTools (F12) for frontend issues
- [ ] Check DATABASE_SETUP.md for database issues

---

## Ready to Code! 🎉

- [ ] All steps complete
- [ ] Servers running
- [ ] Can register/login
- [ ] Documentation bookmarked
- [ ] IDE ready to use

### Next Steps:
1. Read DEVELOPMENT_WORKFLOW.md
2. Pick a feature from the codebase
3. Make a small change
4. Test it
5. Create a pull request

### Useful Commands to Remember:
```bash
# Development
npm run dev              # Start both servers

# Backend
cd backend && npm run dev  # Start backend only
npm run migrate            # Run database migrations

# Frontend
cd frontend && npm start   # Start frontend only
npm run build             # Build for production

# Database
psql -U postgres -d fixlater  # Connect to database

# Git
git status
git add .
git commit -m "message"
git push origin branch-name
```

---

## Common Issues at This Stage

### Issue: Port already in use
**Solution:** 
```bash
# Change port in .env or kill process
# Windows: Use Task Manager
# Mac/Linux: lsof -ti:5000 | xargs kill -9
```

### Issue: Cannot connect to database
**Solution:**
```bash
# Check PostgreSQL is running
# Verify DB_PASSWORD in .env
# Create database: CREATE DATABASE fixlater;
```

### Issue: npm modules won't install
**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install
```

### Issue: Node or npm command not found
**Solution:**
- Verify installation: `node --version`
- Restart terminal
- Add to PATH if needed

---

## Post-Setup Verification

Run this command to verify everything is working:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","message":"FixLater API is running"}
```

If you see the above response, you're all set! ✅

---

## Next Checklist Items

Once you complete this checklist, see:
- **DEVELOPMENT_WORKFLOW.md** - For coding standards
- **TESTING_GUIDE.md** - For testing endpoints
- **API_DOCUMENTATION.md** - For API reference

---

## Support

- **Setup issues?** → TROUBLESHOOTING.md
- **Database questions?** → DATABASE_SETUP.md
- **API questions?** → API_DOCUMENTATION.md
- **Deployment?** → DEPLOYMENT.md

---

**Status:** ⬜ Not Started  |  🟡 In Progress  |  ✅ Complete

Start date: _____________
Completion date: _____________

Good luck! 🚀
