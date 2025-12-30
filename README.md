# BuildWise - Construction Project Tracker

A full-stack web application for managing construction projects, tasks, resources, budgets, and documents.

## Project Overview

BuildWise helps construction companies track and manage their projects efficiently. The system supports multiple user roles and provides comprehensive project management features.

## Features

- **User Management**: Registration, authentication, role-based access
- **Project Management**: Create, update, and track construction projects
- **Task Tracking**: Assign tasks, track progress, manage deadlines
- **Material Management**: Track materials, monitor stock levels, supplier information
- **Budget & Expense Tracking**: Manage budgets, record expenses, track spending
- **Document Management**: Upload, store, and manage project documents
- **Notifications**: System alerts and reminders
- **Dashboard**: Overview of all project metrics and statistics

## Technology Stack

### Frontend (Person 1)
- React 18.2.0
- React Router DOM 6.16.0
- Axios 1.5.0
- React Icons 4.11.0
- CSS3 (Custom light theme)

### Backend (Person 2)
- Node.js
- Express.js 4.18.2
- MongoDB (local/offline)
- Mongoose 7.5.0
- JWT Authentication
- Multer (file uploads)

### Database (Person 3)
- MongoDB
- Mongoose ODM
- Document-based storage

## Project Structure

```
buildwise/
├── frontend/          # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── backend/           # Node.js backend API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
├── database/          # Database documentation
│   └── README.md
├── documentation/     # Project documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── FRONTEND_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── VIVA_QUESTIONS.md
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buildwise
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

4. Start the server:
```bash
npm run dev
```

Backend runs on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Frontend runs on http://localhost:3000

## User Roles

- **Admin**: Full system access
- **Project Manager**: Manage assigned projects
- **Site Worker**: View and update assigned tasks
- **Client**: View own projects

## Modules

1. **User Management**: Authentication, registration, profiles
2. **Project Management**: Create and manage projects
3. **Task & Progress Tracking**: Task assignment and progress updates
4. **Resource & Material Management**: Material inventory and tracking
5. **Budget & Expense Tracking**: Financial management
6. **Document Management**: File uploads and storage
7. **Notifications**: System alerts
8. **Dashboard & Reports**: Analytics and overview

## API Endpoints

- `/api/auth/*` - Authentication
- `/api/projects/*` - Projects
- `/api/tasks/*` - Tasks
- `/api/materials/*` - Materials
- `/api/expenses/*` - Expenses
- `/api/documents/*` - Documents
- `/api/notifications/*` - Notifications
- `/api/dashboard/*` - Dashboard statistics

See `documentation/API_DOCUMENTATION.md` for detailed API documentation.

## Documentation

Comprehensive documentation available in the `documentation/` folder:

- **API_DOCUMENTATION.md**: Complete API reference
- **DATABASE_SCHEMA.md**: Database structure and relationships
- **FRONTEND_GUIDE.md**: Frontend development guide
- **DEPLOYMENT_GUIDE.md**: Deployment instructions
- **SYSTEM_ARCHITECTURE.md**: System architecture overview
- **VIVA_QUESTIONS.md**: Viva preparation Q&A

## Design Principles

- **Laptop-First**: Responsive design optimized for laptops
- **Light Theme**: Clean, professional light color scheme
- **User-Friendly**: Intuitive interface with clear navigation
- **Role-Based**: Different views based on user roles
- **Modular**: Well-organized, maintainable code structure

## Development Team

- **Person 1**: Frontend Development (React, CSS)
- **Person 2**: Backend Development (Node.js, Express)
- **Person 3**: Database Design (MongoDB, Mongoose)

## License

ISC

## Support

For issues or questions, refer to the documentation folder or check the code comments for implementation details.

