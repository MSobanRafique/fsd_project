# BuildWise API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "site_worker"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "site_worker",
  "token": "jwt_token_here"
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "site_worker",
  "token": "jwt_token_here"
}
```

---

### Get Current User
**GET** `/auth/me` (Protected)

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "site_worker",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Project Endpoints

### Get All Projects
**GET** `/projects` (Protected)

**Query Parameters:**
- None (filtered by user role automatically)

**Response:**
```json
[
  {
    "_id": "project_id",
    "name": "Office Building Construction",
    "description": "New office building project",
    "manager": {
      "_id": "manager_id",
      "name": "Jane Manager",
      "email": "jane@example.com"
    },
    "status": "in_progress",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "budget": 500000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Single Project
**GET** `/projects/:id` (Protected)

**Response:**
```json
{
  "_id": "project_id",
  "name": "Office Building Construction",
  "description": "New office building project",
  "manager": {
    "_id": "manager_id",
    "name": "Jane Manager",
    "email": "jane@example.com"
  },
  "status": "in_progress",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "budget": 500000
}
```

---

### Create Project
**POST** `/projects` (Protected - Admin/Project Manager)

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "manager": "manager_id",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 100000,
  "location": "City, Country"
}
```

---

### Update Project
**PUT** `/projects/:id` (Protected - Admin/Project Manager)

**Request Body:** (same as create, all fields optional)

---

### Delete Project
**DELETE** `/projects/:id` (Protected - Admin only)

---

## Task Endpoints

### Get All Tasks
**GET** `/tasks` (Protected)

**Query Parameters:**
- `project`: Filter by project ID

**Response:**
```json
[
  {
    "_id": "task_id",
    "title": "Foundation Work",
    "description": "Complete foundation",
    "project": {
      "_id": "project_id",
      "name": "Office Building"
    },
    "assignedTo": {
      "_id": "user_id",
      "name": "John Worker",
      "email": "john@example.com"
    },
    "status": "in_progress",
    "progress": 65,
    "priority": "high",
    "deadline": "2024-02-01T00:00:00.000Z"
  }
]
```

---

### Create Task
**POST** `/tasks` (Protected - Admin/Project Manager)

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "project": "project_id",
  "assignedTo": "user_id",
  "priority": "medium",
  "deadline": "2024-02-01"
}
```

---

### Update Task
**PUT** `/tasks/:id` (Protected)

**Request Body:**
```json
{
  "status": "completed",
  "progress": 100
}
```

---

## Material Endpoints

### Get All Materials
**GET** `/materials` (Protected)

**Query Parameters:**
- `project`: Filter by project ID
- `status`: Filter by status

---

### Create Material
**POST** `/materials` (Protected)

**Request Body:**
```json
{
  "name": "Cement",
  "category": "cement",
  "quantity": 100,
  "unit": "bags",
  "project": "project_id",
  "costPerUnit": 10,
  "minThreshold": 20,
  "supplier": {
    "name": "ABC Suppliers",
    "contact": "123-456-7890"
  }
}
```

---

## Expense Endpoints

### Get All Expenses
**GET** `/expenses` (Protected)

**Query Parameters:**
- `project`: Filter by project ID
- `category`: Filter by category

---

### Create Expense
**POST** `/expenses` (Protected)

**Request Body:**
```json
{
  "project": "project_id",
  "category": "materials",
  "amount": 5000,
  "description": "Cement purchase",
  "date": "2024-01-15",
  "paymentMethod": "cash"
}
```

---

### Get Expense Summary
**GET** `/expenses/summary/:projectId` (Protected)

**Response:**
```json
{
  "totalExpenses": 15000,
  "count": 5,
  "byCategory": {
    "materials": 8000,
    "labor": 5000,
    "equipment": 2000
  }
}
```

---

## Document Endpoints

### Get All Documents
**GET** `/documents` (Protected)

**Query Parameters:**
- `project`: Filter by project ID
- `category`: Filter by category

---

### Upload Document
**POST** `/documents` (Protected)

**Request:** Multipart form data
- `file`: File to upload
- `project`: Project ID
- `category`: Document category
- `description`: Optional description

---

### Download Document
**GET** `/documents/:id/download` (Protected)

**Response:** File download

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications` (Protected)

**Response:**
```json
[
  {
    "_id": "notification_id",
    "message": "New task assigned",
    "type": "task_assigned",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Mark as Read
**PUT** `/notifications/:id` (Protected)

---

### Mark All as Read
**PUT** `/notifications/mark-all-read` (Protected)

---

## Dashboard Endpoints

### Get Dashboard Stats
**GET** `/dashboard/stats` (Protected)

**Response:**
```json
{
  "projects": {
    "total": 5,
    "active": 3,
    "completed": 2
  },
  "tasks": {
    "total": 20,
    "completed": 12,
    "pending": 5,
    "inProgress": 3
  },
  "budget": {
    "total": 500000,
    "spent": 250000,
    "remaining": 250000
  },
  "materials": {
    "lowStock": 2,
    "total": 15
  },
  "notifications": {
    "unread": 5
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

