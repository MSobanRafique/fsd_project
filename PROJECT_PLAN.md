# BuildWise - Full Stack Web Project Plan

## Project Overview
**BuildWise** is a Construction Project Tracker system designed to manage construction projects, tasks, resources, budgets, and documents.

## Technology Stack

### Frontend (Person 1)
- **Framework**: React
- **Styling**: CSS (Light theme, laptop-first responsive design)
- **No purple gradient** - clean, professional light theme
- Modern UI with good UX practices

### Backend (Person 2)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT tokens
- **File Upload**: Multer for document management

### Database (Person 3)
- **Database**: MongoDB (offline/local)
- **ODM**: Mongoose
- **Collections**: Users, Projects, Tasks, Materials, Expenses, Documents, Notifications

## Project Structure

```
buildwise/
├── frontend/              # Person 1's work
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.js
│   ├── package.json
│   └── README.md
├── backend/               # Person 2's work
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── database/              # Person 3's work
│   ├── models/
│   ├── schemas/
│   └── README.md
├── documentation/         # Viva preparation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── FRONTEND_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── VIVA_QUESTIONS.md
└── README.md

```

## Module Implementation Plan

### 1. User Management Module
- Registration, Login, Authentication
- Role-based permissions (Admin, Project Manager, Site Worker, Client)
- Profile management

### 2. Project Management Module
- Create/Edit/Delete projects
- Set timelines and deadlines
- Assign project managers
- Update project status

### 3. Task & Progress Tracking Module
- Create tasks with assignments
- Track task progress (0-100%)
- Update completion status
- Task timeline management

### 4. Resource & Material Management Module
- Add/edit materials with quantities
- Track material usage
- Manage equipment inventory
- Supplier information management

### 5. Budget & Expense Tracking Module
- Set project budgets
- Record expenses
- Compare planned vs actual costs
- Generate expense reports

### 6. Document Management Module
- Upload/download documents
- Store blueprints and plans
- Version control
- Access control based on roles

### 7. Notifications Module
- Task alerts and reminders
- Deadline notifications
- Material shortage alerts
- System-wide announcements

### 8. Dashboard & Reports Module
- Overview dashboard with stats
- Progress charts and graphs
- Summary reports
- Role-based dashboards

## Database Schema Design

### Users Collection
- user_id, name, email, password (hashed), role, profile_pic, created_at

### Projects Collection
- project_id, name, description, manager_id, status, start_date, end_date, budget, created_at

### Tasks Collection
- task_id, project_id, title, description, assigned_to, status, progress, deadline, created_at

### Materials Collection
- material_id, name, category, quantity, unit, supplier, project_id, status

### Expenses Collection
- expense_id, project_id, category, amount, description, date, created_by

### Documents Collection
- document_id, project_id, filename, filepath, file_type, uploaded_by, version, created_at

### Notifications Collection
- notification_id, user_id, message, type, read, created_at

## Implementation Strategy

1. **Person 1 (Frontend Developer)**:
   - Clean, modular React components
   - Consistent naming conventions
   - Responsive CSS with mobile-first considerations
   - Modern UI/UX patterns

2. **Person 2 (Backend Developer)**:
   - RESTful API design
   - Proper error handling
   - Authentication middleware
   - API documentation

3. **Person 3 (Database Developer)**:
   - Well-structured MongoDB schemas
   - Proper indexing
   - Data validation
   - Relationship management

## Key Features Implementation

- JWT-based authentication
- Role-based access control (RBAC)
- File upload functionality
- Real-time notifications (polling-based)
- Data visualization (charts)
- Responsive design
- Error handling and validation

## Testing & Documentation

- API endpoint documentation
- Database schema documentation
- Frontend component documentation
- Deployment guide
- Viva preparation questions and answers

