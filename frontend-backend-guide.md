# Frontend vs Backend Guide for Canteen System

## Current Project Status
This is currently a **pure frontend application** built with HTML, CSS, and JavaScript. There is **no backend** implemented yet. All existing files handle the client-side (browser) functionality.

## Frontend Files (Current - Client-Side)
These files run in the user's browser and handle UI, styling, user interactions, and local logic:

### HTML Pages (src/pages/)
- `daily.html`: Daily view page
- `dashboard.html`: Dashboard page
- `entry.html`: Entry form page
- `monthly.html`: Monthly view page
- `view.html`: View page
- `yearly.html`: Yearly view page
- `index.html`: Main entry point

### CSS Styles (src/css/)
- `daily.css`: Styles for daily view
- `dashboard.css`: Styles for dashboard
- `entry.css`: Styles for entry form
- `fonts.css`: Font imports
- `index.css`: Main styles
- `monthly.css`: Styles for monthly view
- `view.css`: Styles for view page

### JavaScript (src/js/)
- `entry.js`: Entry form logic
- `form-utils.js`: Form utilities
- `index.js`: Main app logic
- `sidebar.js`: Sidebar functionality

### Config
- `package.json`, `package-lock.json`: Frontend dependencies (likely for build tools or libraries like npm packages for JS)

**Frontend Responsibilities**:
- User interface (UI/UX)
- Client-side validation
- Local data processing/storage (e.g., localStorage)
- Routing between pages (via JS)
- Responsive design

## Backend (Future - Server-Side)
No backend files exist yet. Backend will handle server logic, data persistence, authentication, etc. Suggested structure when implementing:

### Typical Backend Files/Directories
```
backend/ (or server/)
├── server.js (or app.js)          # Main server file (Node.js/Express)
├── package.json                   # Backend dependencies
├── routes/                        # API routes
│   ├── entries.js                 # /api/entries
│   ├── dashboard.js               # /api/dashboard
│   └── auth.js                    # /api/auth
├── models/                        # Data models/schemas
│   └── Entry.js                   # e.g., Mongoose schema for canteen entries
├── controllers/                   # Business logic
│   └── entryController.js
├── middleware/                    # Auth, validation, etc.
├── config/                        # Database, env vars
│   └── database.js
└── data/                          # DB files (if SQLite) or migrations
```

**Backend Responsibilities**:
- Database storage/retrieval (e.g., MongoDB, PostgreSQL, SQLite)
- API endpoints (REST or GraphQL)
- User authentication/authorization
- Server-side validation
- Business logic (reports, summaries)
- File uploads (if needed)
- Integration with external services

## How They Connect
- Frontend fetches data from backend APIs (e.g., `fetch('/api/entries')`)
- Backend serves JSON data to frontend
- Current app likely uses mock/local data; backend will replace this

## Next Steps for Full-Stack
1. Set up backend directory with Node.js/Express
2. Install backend deps: `npm init -y && npm i express mongoose cors dotenv`
3. Create API endpoints matching frontend needs (entries, dashboard data)
4. Add database (e.g., MongoDB Atlas or local)
5. Update frontend JS to call backend APIs
6. Run both: Frontend (live server), Backend (`node server.js`)

This guide will be updated as backend is developed.

