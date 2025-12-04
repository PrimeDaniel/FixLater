# Architecture Documentation - FixLater

## System Overview

FixLater is a full-stack web application built with:
- **Frontend**: React 18 (SPA - Single Page Application)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL
- **Storage**: AWS S3 / Cloudflare R2
- **Authentication**: JWT (JSON Web Tokens)

---

## Directory Structure

```
FixLater/
│
├── backend/                      # Node.js/Express API Server
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT authentication & authorization
│   │
│   ├── routes/                  # API endpoints (RESTful)
│   │   ├── auth.js              # Auth: register, login, get profile
│   │   ├── tasks.js             # CRUD: task management
│   │   ├── applications.js      # Apply to tasks, manage applications
│   │   ├── reviews.js           # Leave and get reviews
│   │   ├── users.js             # User profiles
│   │   ├── notifications.js     # User notifications
│   │   └── upload.js            # Image uploads to S3/R2
│   │
│   ├── migrations/
│   │   ├── migrate.js           # Database migration runner
│   │   └── schema.sql           # PostgreSQL schema definition
│   │
│   ├── server.js                # Express app setup & initialization
│   ├── package.json             # Dependencies & scripts
│   └── .env                     # Environment variables (not in git)
│
├── frontend/                    # React SPA
│   ├── public/
│   │   └── index.html           # HTML entry point
│   │
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Navbar.js        # Navigation bar
│   │   │   └── ReviewModal.js   # Review modal dialog
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state (Context API)
│   │   │
│   │   ├── pages/               # Full page components
│   │   │   ├── Landing.js       # Home page
│   │   │   ├── Auth.js          # Login/Register
│   │   │   ├── Dashboard.js     # User dashboard
│   │   │   ├── CreateTask.js    # Create new task
│   │   │   ├── TaskDetail.js    # View task details
│   │   │   ├── Applications.js  # View applications
│   │   │   ├── Profile.js       # User profile
│   │   │   ├── Notifications.js # Notifications
│   │   │   └── Settings.js      # User settings
│   │   │
│   │   ├── utils/
│   │   │   └── api.js           # Axios API client & endpoints
│   │   │
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Global styles
│   │   ├── index.js             # React DOM render
│   │   └── index.css            # Global CSS
│   │
│   ├── package.json             # Dependencies & scripts
│   └── .env (optional)          # Environment variables
│
├── Documentation/               # Project docs (this folder)
│   ├── README.md               # Project overview
│   ├── QUICK_START.md          # Setup instructions
│   ├── DATABASE_SETUP.md       # Database guide
│   ├── API_DOCUMENTATION.md    # API reference
│   ├── TESTING_GUIDE.md        # Testing procedures
│   ├── TROUBLESHOOTING.md      # Common issues
│   ├── ARCHITECTURE.md         # This file
│   └── DEPLOYMENT.md           # Production deployment
│
├── .gitignore                   # Git ignore rules
└── package.json                # Root package.json (scripts)
```

---

## Data Flow Architecture

### Authentication Flow
```
User Input
    ↓
React Form Component
    ↓
POST /api/auth/register or /api/auth/login
    ↓
Backend validates input
    ↓
Database: Check user exists / Hash password
    ↓
Generate JWT token
    ↓
Return token + user data to frontend
    ↓
Store token in localStorage (frontend)
    ↓
Add "Authorization: Bearer <token>" to all requests
```

### Task Creation Flow
```
Requester fills task form
    ↓
React component (CreateTask.js)
    ↓
POST /api/tasks with task details
    ↓
Backend: Verify user is requester
    ↓
Database: Insert task + availability slots
    ↓
Return task object with ID
    ↓
Frontend: Redirect to task detail page
```

### Application & Matching Flow
```
Provider views task
    ↓
Provider clicks "Apply"
    ↓
POST /api/applications with bid
    ↓
Backend: Validate task is open, provider not requester
    ↓
Database: Insert application
    ↓
Create notification for requester
    ↓
Notification appears in requester's inbox
    ↓
Requester views application
    ↓
Requester clicks "Accept" or "Reject"
    ↓
PATCH /api/applications/:id
    ↓
Backend: Update application status
    ↓
If accepted: Update task.assigned_provider_id
    ↓
Create notification for provider
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL,          -- 'requester' or 'provider'
  name VARCHAR(255) NOT NULL,
  profile_photo VARCHAR(500),              -- URL to S3/R2 image
  bio TEXT,
  service_area_center JSONB,               -- {lat, lng} for providers
  service_area_radius INTEGER,             -- kilometers
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL,           -- Foreign key to users
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,          -- e.g., 'cleaning', 'handyman'
  location VARCHAR(500) NOT NULL,
  location_coords JSONB,                   -- {lat, lng}
  suggested_price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'open',       -- 'open', 'assigned', 'completed', 'cancelled'
  assigned_provider_id INTEGER,            -- Which provider accepted
  scheduled_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Task Images Table
```sql
CREATE TABLE task_images (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,                -- Foreign key
  image_url VARCHAR(500) NOT NULL,         -- URL to S3/R2 image
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Task Availability Slots Table
```sql
CREATE TABLE task_availability_slots (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,                -- Foreign key
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,                -- Foreign key
  provider_id INTEGER NOT NULL,            -- Foreign key
  proposed_price DECIMAL(10, 2) NOT NULL,  -- Provider's bid
  selected_slot_id INTEGER NOT NULL,       -- Which time slot
  status VARCHAR(20) DEFAULT 'pending',    -- 'pending', 'accepted', 'rejected', 'withdrawn'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, provider_id)             -- Only 1 application per provider per task
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,                -- Foreign key
  provider_id INTEGER NOT NULL,            -- Who is being reviewed
  requester_id INTEGER NOT NULL,           -- Who wrote the review
  rating INTEGER NOT NULL,                 -- 1-5 stars
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id)                          -- Only 1 review per task
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,                -- Foreign key (recipient)
  type VARCHAR(50) NOT NULL,               -- e.g., 'application_received', 'review_posted'
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_task_id INTEGER,                 -- Link to task if applicable
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Architecture (RESTful)

### HTTP Methods Used
- **GET** - Retrieve data (idempotent)
- **POST** - Create new resources
- **PATCH** - Partial update of existing resources
- **DELETE** - Remove resources

### Response Format
All responses are JSON:
```json
{
  "data": { /* resource object */ },
  "error": { /* error object if applicable */ },
  "message": "Optional message"
}
```

### Authentication
- JWT tokens generated on login/register
- Token expires in 7 days (configurable)
- All protected endpoints require `Authorization: Bearer <token>` header
- Token is verified using `JWT_SECRET` environment variable

### Error Handling
```javascript
400 Bad Request   - Invalid input data
401 Unauthorized  - Missing or invalid token
403 Forbidden     - User lacks permission
404 Not Found     - Resource doesn't exist
500 Server Error  - Unexpected error
```

### Validation
- Input validation using `express-validator`
- Database constraints (UNIQUE, FOREIGN KEY, CHECK)
- Authorization checks on protected routes

---

## Frontend Architecture

### State Management
**AuthContext (Context API)**
- Global authentication state
- User information
- Login/logout functions
- Loading state for async operations

### Component Structure
**Functional Components with Hooks**
- `useState` for local component state
- `useEffect` for side effects (API calls)
- `useContext` for global auth state
- `useNavigate` for routing

### API Communication
**Axios HTTP Client** (`frontend/src/utils/api.js`)
- Centralized API endpoints
- Automatic Authorization header injection
- Error handling and logging

### Routing
**React Router v6**
- `BrowserRouter` for routing
- `Routes` and `Route` for page navigation
- `PrivateRoute` wrapper for protected pages
- Automatic redirect to login for unauthenticated users

---

## Authentication Flow (Detailed)

### 1. Registration
```javascript
POST /api/auth/register
{
  email: "user@example.com",
  password: "securePassword",
  user_type: "provider",
  name: "John Doe"
}
```
Response includes JWT token → Store in localStorage

### 2. Login
```javascript
POST /api/auth/login
{
  email: "user@example.com",
  password: "securePassword"
}
```
Response includes JWT token → Store in localStorage

### 3. Using Token
```javascript
// All subsequent requests include:
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Token Verification
```javascript
// Backend middleware verifies:
1. Token exists in header
2. Token is properly signed with JWT_SECRET
3. Token hasn't expired
4. User exists in database
```

### 5. Token Refresh
- Current implementation: No automatic refresh
- User must login again after 7 days
- Future enhancement: Implement refresh token mechanism

---

## Security Architecture

### Password Security
- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Raw passwords never stored
- Password verification uses bcryptjs.compare()

### JWT Security
- Signed with `JWT_SECRET` (must be strong)
- Includes user ID and expiration time
- Verified on every protected request
- **Recommendation**: Change JWT_SECRET before production

### File Upload Security
- Image files only (MIME type validation)
- File size limited to 5MB
- Images processed with **sharp** (reduce attack surface)
- Stored on S3/R2 (not on server)

### Authorization
- User type checks (provider vs requester)
- Ownership checks (can't modify others' resources)
- Task status validation (can't apply to non-open tasks)

### CORS Configuration
```javascript
app.use(cors()); // Allows requests from all origins
```
**Recommendation**: Restrict CORS to frontend domain in production

---

## Deployment Architecture

### Development Stack
```
User Browser (localhost:3000)
        ↓
React Dev Server (webpack dev server)
        ↓
Axios API Client
        ↓
Express Backend (localhost:5000)
        ↓
PostgreSQL (localhost:5432)
        ↓
AWS S3 / Cloudflare R2
```

### Production Stack (Recommended)
```
User Browser (fixlater.com)
        ↓
Nginx / Apache (reverse proxy)
        ↓
Node.js Backend Server (PM2)
        ↓
PostgreSQL (Managed DB)
        ↓
AWS S3 / Cloudflare R2
```

---

## Performance Considerations

### Database
- **Indexes** created on frequently queried columns
- **Foreign keys** ensure referential integrity
- **Connection pooling** via pg Pool

### Backend
- **Middleware execution order** optimized
- **Error handling** prevents crashes
- **Async/await** for non-blocking I/O

### Frontend
- **Code splitting** via React Router lazy loading (future)
- **Image compression** done on server before storage
- **Caching** of API responses (future)

---

## Scalability Considerations

### Horizontal Scaling
- **Backend**: Run multiple Node.js instances behind load balancer
- **Database**: Use read replicas for scaling reads
- **Storage**: S3/R2 inherently scalable

### Rate Limiting (Future)
- Implement express-rate-limit
- Different limits for different endpoints
- IP-based or user-based

### Caching (Future)
- Redis for session caching
- API response caching
- Database query caching

### Monitoring (Future)
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)

---

## Extension Points

### Adding New Features
1. **Create database schema** (add to migrations/schema.sql)
2. **Create API route** (new file in routes/)
3. **Add middleware if needed** (create in middleware/)
4. **Add React components** (create in src/pages/ or src/components/)
5. **Add API utilities** (update src/utils/api.js)
6. **Document** (update API_DOCUMENTATION.md)

### Common Extensions
- **Messaging**: Add messages table, WebSocket support
- **Payments**: Integrate Stripe or PayPal
- **Real-time**: Add Socket.io for live notifications
- **Search**: Add Elasticsearch for advanced search
- **Analytics**: Add event tracking

---

## Related Documentation
- `README.md` - Project overview
- `DATABASE_SETUP.md` - Database configuration
- `API_DOCUMENTATION.md` - Complete API reference
- `DEPLOYMENT.md` - Production deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions
