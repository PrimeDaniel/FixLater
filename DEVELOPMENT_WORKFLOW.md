# Development Workflow Guide - FixLater

## Table of Contents
1. [Daily Workflow](#daily-workflow)
2. [Code Style & Best Practices](#code-style--best-practices)
3. [Branching Strategy](#branching-strategy)
4. [Commit Conventions](#commit-conventions)
5. [Testing Workflow](#testing-workflow)
6. [Code Review Process](#code-review-process)
7. [Debugging Tips](#debugging-tips)
8. [Performance Optimization](#performance-optimization)

---

## Daily Workflow

### Starting Your Day
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Start development servers
npm run dev
```

### Working on a Feature
```bash
# 1. Create a new branch
git checkout -b feature/task-search-by-category

# 2. Make your changes (test as you go)
# - Edit backend routes
# - Update frontend components
# - Test manually or with tests

# 3. Commit changes frequently
git add .
git commit -m "feat: add category filter to task search"

# 4. Push to remote
git push origin feature/task-search-by-category

# 5. Create pull request on GitHub
# - Describe changes
# - Link relevant issues
# - Request reviewers
```

### Ending Your Day
```bash
# Ensure all changes are committed
git status

# If work is incomplete, push to branch anyway
git push origin feature/your-feature-name

# Or use WIP (work in progress) commit
git commit -m "WIP: work in progress on feature"
```

---

## Code Style & Best Practices

### JavaScript Style Guide

#### Naming Conventions
```javascript
// ✅ DO: Clear, descriptive names
const getUserApplications = async (userId) => { }
const isTaskOpen = task.status === 'open'

// ❌ DON'T: Abbreviations, unclear names
const getUA = async (id) => { }
const st = task.status === 'open'
```

#### File Naming
```
Routes: /routes/tasks.js (lowercase, plural)
Components: /components/Navbar.js (PascalCase)
Utils: /utils/api.js (lowercase)
Pages: /pages/Dashboard.js (PascalCase)
```

#### Function Documentation
```javascript
/**
 * Get all tasks with optional filters
 * @param {string} category - Task category (optional)
 * @param {number} minPrice - Minimum price filter (optional)
 * @param {number} maxPrice - Maximum price filter (optional)
 * @returns {Promise<Array>} Array of task objects
 * @throws {Error} Database connection error
 */
const getTasks = async (category, minPrice, maxPrice) => {
  // Implementation
}
```

### Backend Best Practices

#### Error Handling
```javascript
// ✅ DO: Handle errors gracefully
router.post('/tasks', authenticate, async (req, res) => {
  try {
    const result = await pool.query('INSERT INTO tasks...');
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ DON'T: Let errors crash the server
router.post('/tasks', authenticate, async (req, res) => {
  const result = await pool.query('INSERT INTO tasks...');
  res.status(201).json({ task: result.rows[0] });
});
```

#### Input Validation
```javascript
// ✅ DO: Validate all inputs
router.post('/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
], async (req, res) => { });

// ❌ DON'T: Trust user input
router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  // Process without validation
});
```

#### Authorization Checks
```javascript
// ✅ DO: Check user permissions
router.delete('/tasks/:id', authenticate, async (req, res) => {
  const task = await pool.query('SELECT requester_id FROM tasks WHERE id=$1', [req.params.id]);
  
  if (task.rows[0].requester_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  // Delete task
});

// ❌ DON'T: Allow any authenticated user to access resources
router.delete('/tasks/:id', authenticate, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
});
```

### Frontend Best Practices

#### Component Structure
```javascript
// ✅ DO: Organize components logically
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

#### Conditional Rendering
```javascript
// ✅ DO: Use guard clauses
function UserProfile({ userId }) {
  if (!userId) return <p>No user selected</p>;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProfileContent user={user} />;
}

// ❌ DON'T: Deeply nested ternaries
function UserProfile({ userId }) {
  return userId ? (
    loading ? (
      <LoadingSpinner />
    ) : error ? (
      <ErrorMessage />
    ) : (
      <ProfileContent />
    )
  ) : (
    <p>No user</p>
  );
}
```

#### API Calls
```javascript
// ✅ DO: Use utility functions
// In utils/api.js
export const createTask = async (taskData) => {
  const response = await axios.post('/api/tasks', taskData);
  return response.data.task;
};

// In component
const handleCreateTask = async (formData) => {
  try {
    const newTask = await createTask(formData);
    setTasks([...tasks, newTask]);
  } catch (error) {
    setError(error.message);
  }
};

// ❌ DON'T: Make API calls directly in components
const handleCreateTask = async (formData) => {
  const response = await axios.post('http://localhost:5000/api/tasks', formData);
  setTasks([...tasks, response.data.task]);
};
```

---

## Branching Strategy (Git Flow)

### Branch Types
```
main              - Production-ready code
  ├─ develop      - Development integration branch
  ├─ feature/*    - New features
  ├─ bugfix/*     - Bug fixes
  ├─ hotfix/*     - Production hotfixes
  └─ docs/*       - Documentation updates
```

### Feature Branch Workflow
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. Make commits
git commit -m "feat: add JWT authentication"
git commit -m "feat: add password hashing"

# 3. Push feature branch
git push origin feature/user-authentication

# 4. Create Pull Request on GitHub
# (After review and approval)

# 5. Merge into develop
git checkout develop
git merge feature/user-authentication
git push origin develop

# 6. Delete feature branch
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

### Hotfix Branch Workflow
```bash
# For urgent production fixes
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

git commit -m "fix: SQL injection vulnerability"
git push origin hotfix/security-patch

# Merge to main AND develop
git checkout main
git merge hotfix/security-patch
git push origin main

git checkout develop
git merge hotfix/security-patch
git push origin develop
```

---

## Commit Conventions

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvement
- **test**: Test additions or changes
- **chore**: Build, dependency updates
- **ci**: CI/CD configuration

### Examples
```bash
# Feature
git commit -m "feat(auth): add JWT token refresh mechanism"

# Bug fix
git commit -m "fix(api): handle null location_coords in tasks endpoint"

# Documentation
git commit -m "docs: update API documentation for pagination"

# Performance
git commit -m "perf(db): add index on tasks.status column"

# Refactor
git commit -m "refactor(auth): extract password validation to util function"

# Multiple line commit (detailed)
git commit -m "feat(tasks): add geolocation-based task search

- Filter tasks within specified radius
- Sort by distance from user location
- Add location_coords to task response

Closes #123"
```

### Best Practices
```bash
# ✅ DO: Commit related changes together
git commit -m "feat: add task category filter

- Add category column to tasks table
- Add category filter to GET /tasks endpoint
- Update task creation validation"

# ✅ DO: Write clear messages
git commit -m "fix: prevent providers from creating tasks"

# ❌ DON'T: Vague messages
git commit -m "fixed stuff"
git commit -m "changes"
git commit -m "update"

# ❌ DON'T: Mix unrelated changes
# If you mixed unrelated changes, use:
git reset HEAD .
git add path/to/file1
git commit -m "feat: specific feature"
git add path/to/file2
git commit -m "fix: specific fix"
```

---

## Testing Workflow

### Before Committing
```bash
# 1. Manual testing
npm run dev
# Test in browser/Postman

# 2. Check for errors
npm run lint (if configured)

# 3. Run tests (if configured)
npm test

# 4. Code review self
# - Does it follow style guide?
# - Are there edge cases handled?
# - Is error handling present?
```

### Automated Testing (To Implement)
```bash
# Backend tests
cd backend
npm install --save-dev jest supertest
npm test

# Frontend tests
cd frontend
npm install --save-dev @testing-library/react jest
npm test
```

### Test Example (Backend)
```javascript
// backend/__tests__/routes/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        user_type: 'provider',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

---

## Code Review Process

### For Authors (Creating PR)
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test:
1. Go to /tasks
2. Click "Create Task"
3. Fill form and submit
4. Verify success message

## Screenshots (if UI changes)
[Attach before/after screenshots]

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Tested manually
- [ ] No new warnings generated
- [ ] Comments added for complex logic
- [ ] Updated documentation
```

### For Reviewers (Reviewing PR)
```
✅ Check:
- Code follows project style
- No security issues
- No performance problems
- Tests pass
- Error handling is complete
- Authorization checks present
- Database queries are optimized
- Comments are clear
- Documentation is updated

💬 Suggest improvements
👍 Approve when ready
```

### Review Checklist
- [ ] Does the code do what the PR describes?
- [ ] Are there any security vulnerabilities?
- [ ] Are there any performance issues?
- [ ] Is error handling complete?
- [ ] Are there SQL injection risks?
- [ ] Is input validation present?
- [ ] Are edge cases handled?
- [ ] Is the code readable and maintainable?
- [ ] Are tests present and passing?
- [ ] Is documentation updated?

---

## Debugging Tips

### Browser Developer Tools (F12)

#### Console Tab
```javascript
// Check for JavaScript errors
// Test API responses
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

#### Network Tab
1. Open DevTools → Network
2. Make a request
3. Click the request
4. View Request/Response/Headers

#### Application Tab
- **Cookies**: Check JWT token
- **LocalStorage**: Check stored auth data
- **Sessions**: Debug state issues

### Backend Debugging

#### Add Console Logs
```javascript
// In routes/tasks.js
console.log('Creating task:', req.body);
console.log('User:', req.user);

try {
  const result = await pool.query('INSERT INTO tasks...');
  console.log('Task created:', result.rows[0]);
} catch (error) {
  console.error('Database error:', error.message);
}
```

#### Check Environment Variables
```bash
# In terminal running backend
echo $JWT_SECRET
echo $DB_PASSWORD
```

#### Database Debugging
```sql
-- Connect to PostgreSQL
psql -U postgres -d fixlater

-- Check specific user
SELECT * FROM users WHERE email='test@example.com';

-- Check task details
SELECT t.*, COUNT(a.id) as applications
FROM tasks t
LEFT JOIN applications a ON t.id = a.task_id
WHERE t.id = 1
GROUP BY t.id;

-- Check for slow queries
SELECT COUNT(*) FROM tasks;
```

#### Use Debugger
```javascript
// Add breakpoint
debugger;

// Or use Node inspector
node --inspect-brk backend/server.js
// Then visit chrome://inspect
```

---

## Performance Optimization

### Frontend Optimization

#### Code Splitting
```javascript
// ✅ DO: Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Route path="/dashboard" element={<Dashboard />} />
    </Suspense>
  );
}
```

#### Memoization
```javascript
// ✅ DO: Memoize expensive components
const TaskCard = React.memo(function TaskCard({ task, onSelect }) {
  return (
    <div onClick={() => onSelect(task.id)}>
      {task.title}
    </div>
  );
});
```

#### Virtual Lists for Large Data
```javascript
// For long lists (100+ items), use virtual scrolling library
import { FixedSizeList } from 'react-window';
```

### Backend Optimization

#### Database Query Optimization
```javascript
// ❌ DON'T: N+1 queries
const tasks = await pool.query('SELECT * FROM tasks');
for (const task of tasks.rows) {
  const requester = await pool.query('SELECT * FROM users WHERE id=$1', [task.requester_id]);
  task.requester = requester.rows[0];
}

// ✅ DO: Use JOIN
const tasks = await pool.query(`
  SELECT t.*, u.name as requester_name
  FROM tasks t
  JOIN users u ON t.requester_id = u.id
`);
```

#### Pagination
```javascript
// ✅ DO: Paginate large result sets
router.get('/tasks', async (req, res) => {
  const page = req.query.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  const result = await pool.query(
    'SELECT * FROM tasks LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  res.json({ tasks: result.rows, page, limit });
});
```

#### Caching
```javascript
// ✅ DO: Cache frequently accessed data
const categoryCache = new Map();

router.get('/tasks/categories', async (req, res) => {
  if (categoryCache.has('all')) {
    return res.json({ categories: categoryCache.get('all') });
  }
  
  const result = await pool.query('SELECT DISTINCT category FROM tasks');
  categoryCache.set('all', result.rows);
  res.json({ categories: result.rows });
});
```

#### Connection Pooling
```javascript
// ✅ Already configured in config/database.js
const pool = new Pool({
  max: 20,                    // Max connections
  min: 10,                    // Min connections
  idle_in_transaction_timeout: 30000,
});
```

---

## Tools & Extensions

### Recommended VS Code Extensions
- **Thunder Client**: API testing
- **ES7+ React/Redux/React-Native snippets**: Code snippets
- **Prettier**: Code formatter
- **ESLint**: Code linting
- **PostgreSQL Explorer**: Database browsing
- **Git Graph**: Visual git history

### Recommended Tools
- **Postman**: API testing and documentation
- **pgAdmin**: PostgreSQL GUI client
- **DBeaver**: Database management
- **Chrome DevTools**: Browser debugging
- **Node Inspector**: Node.js debugging

---

## Quick Reference

### Most Used Commands
```bash
# Start development
npm run dev

# Database migration
cd backend && npm run migrate

# View server logs
# (Usually shown in terminal where npm run dev is running)

# Database connection
psql -U postgres -d fixlater

# Kill process on port
lsof -ti:5000 | xargs kill -9  # Mac/Linux
# Or use Task Manager (Windows)

# Git workflow
git status
git add .
git commit -m "message"
git push origin branch-name
```

---

## Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Best Practices](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Git Workflow](https://git-scm.com/docs/gittutorial-2)
- [RESTful API Design](https://restfulapi.net/)
