# FixLater

A platform connecting people who need help with tasks (cleaning, handyman work, babysitting, labor help, quick fixes, etc.) with service providers in their area.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth
- **File Storage**: AWS S3 / Cloudflare R2 (S3 compatible)

## Features

### User Roles

1. **Requester**: Can post tasks and hire providers
2. **Provider**: Can post tasks AND apply to other users' tasks

### Core Features

- User authentication (register, login, password reset)
- Task creation with images, categories, location, and availability calendar
- Task browsing and filtering
- Application system (providers apply with bids and time slots)
- Review and rating system
- Notifications
- User profiles with ratings and reviews

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- AWS S3 bucket or Cloudflare R2 account (for image storage)

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```

3. **Set up the database**:
   - Create a PostgreSQL database named `fixlater`
   - Update `backend/.env` with your database credentials

4. **Configure environment variables**:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in all required values:
     - Database credentials
     - JWT secret
     - AWS S3 / Cloudflare R2 credentials

5. **Run database migrations**:
   ```bash
   cd backend
   npm run migrate
   ```

6. **Start the development servers**:
   ```bash
   # From root directory
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Environment Variables

Create `backend/.env` with the following:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fixlater
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=fixlater-uploads

# For Cloudflare R2:
# R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

## Project Structure

```
FixLater/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── migrations/
│   │   ├── migrate.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── applications.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   ├── notifications.js
│   │   └── upload.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (Requester/Provider)
- `PATCH /api/tasks/:id` - Update task status

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Apply to task (Provider)
- `PATCH /api/applications/:id` - Accept/Reject application
- `DELETE /api/applications/:id` - Withdraw application

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/provider/:id` - Get provider reviews

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `PATCH /api/users/:id/password` - Change password

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set `NODE_ENV=production` in backend `.env`

3. Serve the frontend build folder statically or deploy to a hosting service

4. Use a process manager like PM2 for the backend:
   ```bash
   pm2 start backend/server.js
   ```

## License

ISC

