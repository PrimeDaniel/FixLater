# Troubleshooting Guide - FixLater

## Getting Help

This guide covers common issues and how to resolve them. For issues not listed here, check:
1. The error message in the console
2. `DATABASE_SETUP.md` for database issues
3. `API_DOCUMENTATION.md` for API questions
4. Server logs (check the terminal running `npm run dev`)

---

## Installation & Setup Issues

### PowerShell Execution Policy Error
**Error:**
```
File X:\Program\jsnode\npm.ps1 cannot be loaded because running scripts is disabled
```

**Solution:**
Run in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Answer `Y` to confirm, then retry your command.

**Alternative:** Use `cmd.exe` instead of PowerShell.

---

### npm: command not found
**Error:**
```
npm: command not found
```

**Solution:**
1. Verify Node.js is installed:
   ```bash
   node --version
   ```

2. If that fails, download Node.js from https://nodejs.org/ and install

3. Restart your terminal and try again

4. On Windows, if still not working:
   - Add Node.js to PATH manually
   - Check installation folder (usually `C:\Program Files\nodejs`)

---

### Dependencies Won't Install
**Error:**
```
npm ERR! code EACCES
npm ERR! syscall open
npm ERR! path /path/to/node_modules
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -r node_modules

# Reinstall
npm install
```

On Windows:
```powershell
rm -r node_modules
npm install
```

---

### Slow npm Install
**Problem:** Installation takes very long

**Solutions:**
1. Use npm ci instead (faster):
   ```bash
   npm ci
   ```

2. Check your internet connection

3. Try installing packages one at a time

4. Update npm itself:
   ```bash
   npm install -g npm@latest
   ```

---

## Database Issues

### PostgreSQL Connection Failed
**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Verify PostgreSQL is running:
   - **Windows**: Check Services (search "Services")
   - **Mac**: `brew services list`
   - **Linux**: `sudo systemctl status postgresql`

2. Check connection settings in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fixlater
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. Verify the database exists:
   ```bash
   psql -U postgres -l
   ```
   Look for `fixlater` in the list.

4. If database doesn't exist, create it:
   ```bash
   psql -U postgres
   CREATE DATABASE fixlater;
   ```

---

### Database Password Error
**Error:**
```
error: password authentication failed for user "postgres"
```

**Solution:**
1. Check your PostgreSQL password in `backend/.env`

2. Reset PostgreSQL password (Windows):
   ```bash
   # Start PowerShell as Administrator
   $env:PGPASSWORD = 'your_new_password'
   psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'your_new_password';"
   ```

3. Update `.env` with the new password

4. Restart the backend

---

### Migration Fails
**Error:**
```
Migration failed: error: relation "users" already exists
```

**Solution:**
The database already has tables. Either:
1. Drop and recreate the database:
   ```bash
   psql -U postgres
   DROP DATABASE fixlater;
   CREATE DATABASE fixlater;
   ```
   Then run migrations again

2. Or skip migrations if you already have the schema

---

### Database Performance Issues
**Symptom:** Queries are slow

**Solutions:**
1. Check indexes were created:
   ```bash
   psql -U postgres -d fixlater
   \d tasks
   \d applications
   ```
   Look for `idx_*` lines

2. Monitor active connections:
   ```sql
   SELECT * FROM pg_stat_activity WHERE state != 'idle';
   ```

3. Clear old test data if database is large:
   ```sql
   DELETE FROM notifications;
   DELETE FROM reviews;
   DELETE FROM applications;
   DELETE FROM task_images;
   DELETE FROM task_availability_slots;
   DELETE FROM tasks;
   DELETE FROM users;
   ```

---

## Server/Backend Issues

### Port 5000 Already in Use
**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Change the port** in `backend/.env`:
   ```env
   PORT=5001
   ```
   Then restart server

2. **Or kill the process using port 5000:**

   **Windows (PowerShell as Admin):**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   ```

   **Mac/Linux:**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

---

### Server Won't Start
**Error:**
```
TypeError: Cannot find module 'express'
```

**Solution:**
Dependencies aren't installed. Run:
```bash
cd backend
npm install
```

---

### Server Crashes Immediately
**Error:**
```
Error: ENOENT: no such file or directory, open 'migrations/schema.sql'
```

**Solution:**
1. Verify you're running from the correct directory:
   ```bash
   cd backend
   npm run dev
   ```

2. Check that `migrations/schema.sql` exists:
   ```bash
   ls migrations/
   ```

---

### JWT Secret Not Set
**Error:**
```
Error: secretOrPublicKey must be an asymmetric key or a string
```

**Solution:**
Add `JWT_SECRET` to `backend/.env`:
```env
JWT_SECRET=your_secret_key_here_change_in_production
```

Then restart the server.

---

### Nodemon Not Working
**Error:**
```
nodemon: command not found
```

**Solution:**
Install nodemon globally:
```bash
npm install -g nodemon
```

Or reinstall backend dependencies:
```bash
cd backend
npm install
```

---

## Frontend Issues

### React App Won't Start
**Error:**
```
Port 3000 is in use by another process
```

**Solution:**
1. Change the port by creating `.env` in frontend folder:
   ```env
   PORT=3001
   ```

2. Or kill the process using port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9  # Mac/Linux
   netstat -ano | findstr :3000    # Windows
   ```

---

### Cannot Connect to API
**Error:**
```
Failed to fetch from http://localhost:5000/api/...
CORS error
```

**Solution:**
1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check CORS is enabled in `backend/server.js`:
   ```javascript
   app.use(cors());
   ```

3. Verify correct API endpoint in `frontend/src/utils/api.js`

4. Clear browser cache: Press `F12`, right-click refresh, select "Empty cache and hard refresh"

---

### Authentication Not Working
**Problem:** Can't login or register

**Solutions:**
1. Check your credentials are correct

2. Verify JWT_SECRET is set in `backend/.env`

3. Clear browser storage:
   - Open DevTools (F12)
   - Application tab → Local Storage → Clear all

4. Check browser console for error messages (F12)

---

### Images Not Loading
**Problem:** Profile photos or task images show broken images

**Solutions:**
1. Verify AWS/R2 credentials in `backend/.env`

2. Check the image URL is correct in the response

3. Verify bucket permissions allow public read access

4. Check CORS configuration on S3/R2 bucket

---

## API Issues

### 401 Unauthorized Errors
**Error:**
```
{
  "error": "No token, authorization denied"
}
```

**Solutions:**
1. Add Authorization header with valid token:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/me
   ```

2. Verify token is not expired (default expiry: 7 days)

3. Login again to get a fresh token

---

### 403 Forbidden Errors
**Error:**
```
{
  "error": "Insufficient permissions"
}
```

**Solutions:**
1. Check you have the correct user type:
   - Providers can apply to tasks
   - Requesters can create tasks
   - Both can leave reviews

2. Example:
   ```bash
   # This fails if user is not a "provider"
   curl -X POST http://localhost:5000/api/applications \
     -H "Authorization: Bearer TOKEN" \
     -d '{"task_id": 1, ...}'
   ```

---

### 400 Bad Request Errors
**Error:**
```
{
  "error": "Invalid input",
  "errors": [...]
}
```

**Solutions:**
1. Check all required fields are present

2. Verify data types match:
   - `id` fields should be numbers
   - `price` fields should be decimals
   - Dates should be ISO format

3. Example validation errors:
   ```json
   {
     "msg": "Invalid value",
     "param": "email",
     "location": "body"
   }
   ```
   This means the `email` field is invalid

---

### 404 Not Found Errors
**Error:**
```
{
  "error": "Task not found"
}
```

**Solutions:**
1. Verify the ID exists:
   ```bash
   curl http://localhost:5000/api/tasks/1
   ```

2. Check you're using the correct ID (not just 1)

3. Verify the resource belongs to you (authorization)

---

### 500 Server Errors
**Error:**
```
{
  "error": "Server error"
}
```

**Solutions:**
1. Check the backend server logs for the actual error

2. Common causes:
   - Database connection lost
   - AWS credentials invalid
   - Invalid SQL in migration
   - Node.js version incompatibility

3. Restart the server:
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

---

## File Upload Issues

### Upload Fails
**Error:**
```
{
  "error": "Upload failed"
}
```

**Solutions:**
1. Verify AWS credentials in `backend/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_BUCKET_NAME=your_bucket
   ```

2. Check file size (max 5MB)

3. Verify file is an image (jpg, png, etc.)

4. Check AWS bucket permissions allow uploads

5. Verify bucket exists and is accessible

---

### Image URL Returns 403
**Problem:** Upload succeeds but image won't load (403 Forbidden)

**Solutions:**
1. Check S3 bucket permissions:
   - Select bucket → Permissions → Public Access
   - Ensure "Block all public access" is OFF

2. Add bucket policy to allow public read:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. For Cloudflare R2:
   - Check bucket policy
   - Verify custom domain is configured

---

## Performance Issues

### API Responses Are Slow
**Problem:** Queries take >5 seconds

**Solutions:**
1. Check database performance:
   ```bash
   psql -U postgres -d fixlater
   EXPLAIN ANALYZE SELECT * FROM tasks;
   ```

2. Add missing indexes:
   ```sql
   CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
   CREATE INDEX idx_applications_status ON applications(status);
   ```

3. Optimize queries in route files

4. Consider pagination for large result sets

---

### Memory Leak
**Problem:** Server slows down over time, increasing RAM usage

**Solutions:**
1. Restart the server periodically

2. Check for infinite loops in code

3. Verify database connections are closed properly

4. Monitor with:
   ```bash
   # Keep running the server for 1 hour
   # Then check memory usage
   ps aux | grep node
   ```

---

## Testing Issues

### Tests Fail
**Problem:** Jest or test suite fails

**Solutions:**
1. Ensure test environment is set up:
   ```bash
   npm install --save-dev jest
   ```

2. Check `.env.test` file if needed

3. Run tests with verbose output:
   ```bash
   npm test -- --verbose
   ```

4. Check test database is created (if different from dev DB)

---

## Getting More Help

### Check Logs
**Backend logs:**
- Run `npm run dev` and watch terminal output
- Look for error stack traces

**Browser logs:**
- Press F12 in browser
- Check Console and Network tabs

### Debug with Console Logs
Add to `backend/routes/` files:
```javascript
console.log('Incoming request:', req.body);
console.error('Error occurred:', error);
```

Then watch the terminal.

### Use Network Tab (Browser)
1. Press F12
2. Go to Network tab
3. Repeat the failing request
4. Click on the request
5. View Request/Response tabs

### Common Error Patterns
- **ENOENT**: File not found (check paths)
- **ECONNREFUSED**: Connection refused (service not running)
- **EACCES**: Permission denied (check file permissions)
- **SyntaxError**: Code has syntax error (check file)

---

## Still Stuck?

1. Check all documentation files:
   - `README.md` - Project overview
   - `DATABASE_SETUP.md` - Database help
   - `QUICK_START.md` - Getting started
   - `API_DOCUMENTATION.md` - API reference
   - `TESTING_GUIDE.md` - Testing help

2. Review server console output - most errors are logged there

3. Check the actual error message (not just the HTTP code)

4. Search for the error message online

5. Review similar code that works in the codebase
