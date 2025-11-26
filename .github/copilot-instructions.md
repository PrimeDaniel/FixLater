# Copilot Instructions for FixLater

## Project Overview
- **FixLater** is a full-stack platform connecting users needing help with tasks to local service providers.
- **Frontend**: React (in `frontend/`)
- **Backend**: Node.js/Express (in `backend/`)
- **Database**: PostgreSQL
- **Auth**: JWT-based
- **File Storage**: AWS S3 or Cloudflare R2

## Architecture & Data Flow
- **Frontend** communicates with backend via REST API endpoints (see `backend/routes/`).
- **Backend** organizes logic by feature: routes, middleware, config, migrations.
- **User roles**: Requester (posts tasks, hires), Provider (posts & applies to tasks).
- **Core flows**: Auth, task creation/browsing, applications, reviews, notifications, uploads.

## Developer Workflows
- **Install all dependencies**: `npm run install-all` (from root)
- **Start dev servers**: `npm run dev` (from root; launches both frontend and backend)
- **Backend only**: `cd backend && npm run dev`
- **Frontend only**: `cd frontend && npm start`
- **Migrations**: `cd backend && npm run migrate`
- **Production build**: `cd frontend && npm run build`

## Conventions & Patterns
- **Backend routes**: Each feature has its own file in `backend/routes/` (e.g., `tasks.js`, `auth.js`).
- **Middleware**: Auth logic in `backend/middleware/auth.js`.
- **Database config**: `backend/config/database.js`.
- **Frontend pages**: In `frontend/src/pages/`, components in `frontend/src/components/`.
- **Context**: Auth context in `frontend/src/context/AuthContext.js`.
- **API calls**: Use `frontend/src/utils/api.js` for HTTP requests.
- **Environment variables**: Backend uses `.env` (see example in README).

## Integration Points
- **Image uploads**: Handled via `/api/upload/image` and `/api/upload/images` endpoints.
- **Notifications**: `/api/notifications` endpoints for user alerts.
- **Reviews**: `/api/reviews` endpoints for ratings.

## Examples
- To add a new backend feature, create a route file in `backend/routes/` and update `server.js` to include it.
- To add a new frontend page, create a file in `frontend/src/pages/` and add a route in `App.js`.
- For API calls, use the helper in `frontend/src/utils/api.js`.

## References
- See `README.md` for setup, environment, and API details.
- Key directories: `backend/routes/`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/utils/api.js`.

---
For questions or unclear patterns, review the README or ask for clarification.
