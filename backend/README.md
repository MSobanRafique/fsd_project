# BuildWise Backend API

This is the backend API for BuildWise Construction Project Tracker.

## Developed by: Person 2 - Backend Developer

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory. See `SETUP_ENV.md` for detailed instructions.

   **For MongoDB Atlas (Cloud - Recommended):**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/buildwise?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

   **For Local MongoDB:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/buildwise
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

3. **MongoDB Setup:**
   - **MongoDB Atlas**: Follow the guide in `MONGODB_ATLAS_SETUP.md` to set up a free cloud database
   - **Local MongoDB**: Make sure MongoDB is installed and running on your local machine

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (Protected)

### Projects
- GET `/api/projects` - Get all projects (Protected)
- GET `/api/projects/:id` - Get single project (Protected)
- POST `/api/projects` - Create project (Protected - Admin/PM)
- PUT `/api/projects/:id` - Update project (Protected - Admin/PM)
- DELETE `/api/projects/:id` - Delete project (Protected - Admin)

### Tasks
- GET `/api/tasks` - Get all tasks (Protected)
- GET `/api/tasks/:id` - Get single task (Protected)
- POST `/api/tasks` - Create task (Protected - Admin/PM)
- PUT `/api/tasks/:id` - Update task (Protected)
- DELETE `/api/tasks/:id` - Delete task (Protected - Admin/PM)

### Materials
- GET `/api/materials` - Get all materials (Protected)
- GET `/api/materials/:id` - Get single material (Protected)
- POST `/api/materials` - Create material (Protected)
- PUT `/api/materials/:id` - Update material (Protected)
- DELETE `/api/materials/:id` - Delete material (Protected)

### Expenses
- GET `/api/expenses` - Get all expenses (Protected)
- GET `/api/expenses/:id` - Get single expense (Protected)
- POST `/api/expenses` - Create expense (Protected)
- PUT `/api/expenses/:id` - Update expense (Protected)
- DELETE `/api/expenses/:id` - Delete expense (Protected)
- GET `/api/expenses/summary/:projectId` - Get expense summary (Protected)

### Documents
- GET `/api/documents` - Get all documents (Protected)
- GET `/api/documents/:id` - Get single document (Protected)
- POST `/api/documents` - Upload document (Protected)
- DELETE `/api/documents/:id` - Delete document (Protected)
- GET `/api/documents/:id/download` - Download document (Protected)

### Notifications
- GET `/api/notifications` - Get user notifications (Protected)
- PUT `/api/notifications/:id` - Mark notification as read (Protected)
- PUT `/api/notifications/mark-all-read` - Mark all as read (Protected)
- DELETE `/api/notifications/:id` - Delete notification (Protected)

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics (Protected)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles

- `admin` - Full system access
- `project_manager` - Manage assigned projects
- `site_worker` - View assigned tasks and update progress
- `client` - View own projects

## File Uploads

Documents are stored in the `uploads/` directory. Maximum file size is 10MB.

