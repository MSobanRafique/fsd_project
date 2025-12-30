# BuildWise - System Architecture Documentation

## Overview
BuildWise is a full-stack web application for managing construction projects, tasks, resources, budgets, and documents.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           React Frontend Application                  │   │
│  │  - Components, Pages, Routing, State Management       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                  Node.js/Express Backend                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Routes)                       │   │
│  │  - Authentication, Projects, Tasks, Materials, etc.   │   │
│  └──────────────────┬───────────────────────────────────┘   │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │          Controller Layer                             │   │
│  │  - Business Logic, Request Processing                │   │
│  └──────────────────┬───────────────────────────────────┘   │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │          Middleware Layer                             │   │
│  │  - Authentication, Authorization, Validation          │   │
│  └──────────────────┬───────────────────────────────────┘   │
└──────────────────────┼───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                  MongoDB Database                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Mongoose ODM                                │   │
│  │  - Schema Definitions, Models, Validation            │   │
│  └──────────────────┬───────────────────────────────────┘   │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │          Collections                                  │   │
│  │  Users, Projects, Tasks, Materials, Expenses,        │   │
│  │  Documents, Notifications                             │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.16.0
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: CSS3 (Custom light theme)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB (local/offline)
- **ODM**: Mongoose 7.5.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer

## System Components

### 1. Frontend Layer
- **Components**: Reusable UI components (Navbar, Sidebar)
- **Pages**: Main application pages (Dashboard, Projects, Tasks, etc.)
- **Context**: Authentication context for state management
- **Services**: API service layer for backend communication

### 2. Backend Layer
- **Routes**: API endpoint definitions
- **Controllers**: Business logic and request handling
- **Middleware**: Authentication and authorization
- **Models**: Database schemas and models
- **Config**: Database connection configuration

### 3. Database Layer
- **Collections**: MongoDB collections for data storage
- **Schemas**: Data structure definitions
- **Indexes**: Performance optimization indexes
- **Relationships**: Document references and relationships

## Data Flow

1. **User Request**: User interacts with React frontend
2. **API Call**: Frontend makes HTTP request to backend API
3. **Authentication**: Middleware validates JWT token
4. **Authorization**: Middleware checks user role and permissions
5. **Controller**: Business logic processes the request
6. **Database**: Mongoose queries MongoDB database
7. **Response**: Data sent back through controller → route → frontend
8. **UI Update**: React components update with new data

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- CORS configuration

## Module Interaction

```
User Management → All Modules (authentication)
Project Management → Tasks, Materials, Expenses, Documents
Task Tracking → Projects, Users (assignments)
Material Management → Projects, Notifications (low stock)
Expense Tracking → Projects, Budget calculations
Document Management → Projects, Users (access control)
Notifications → All Modules (alerts and updates)
Dashboard → Aggregates data from all modules
```

## Deployment Architecture

### Development
- Frontend: React Development Server (Port 3000)
- Backend: Node.js/Express (Port 5000)
- Database: MongoDB (Port 27017)

### Production (Recommended)
- Frontend: Build static files, serve via Nginx/Apache
- Backend: Node.js with PM2 process manager
- Database: MongoDB (local or cloud instance)

## Scalability Considerations

1. **Horizontal Scaling**: Backend can be scaled with load balancer
2. **Database Indexing**: Strategic indexes for query performance
3. **File Storage**: Uploads stored on filesystem (can migrate to cloud storage)
4. **Caching**: Can add Redis for session and data caching
5. **API Rate Limiting**: Can implement rate limiting middleware

## Error Handling

- Frontend: Error boundaries and try-catch blocks
- Backend: Centralized error handling middleware
- API: Standardized error response format
- Database: Mongoose validation errors

