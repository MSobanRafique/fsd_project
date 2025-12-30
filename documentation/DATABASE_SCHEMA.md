# BuildWise Database Schema Documentation

## Database: MongoDB
**Database Name:** `buildwise`
**Connection:** `mongodb://localhost:27017/buildwise`

---

## Collections Overview

1. **users** - User accounts and authentication
2. **projects** - Construction projects
3. **tasks** - Project tasks
4. **materials** - Construction materials and resources
5. **expenses** - Project expenses
6. **documents** - Project documents and files
7. **notifications** - System notifications

---

## 1. Users Collection

### Schema
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase, validated),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'admin', 'project_manager', 'site_worker', 'client'),
  profilePic: String (optional),
  phone: String (optional),
  address: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `email` (unique)

### Relationships
- Referenced by: Projects (manager, client), Tasks (assignedTo), Expenses (createdBy), Documents (uploadedBy), Notifications (user)

---

## 2. Projects Collection

### Schema
```javascript
{
  name: String (required),
  description: String (optional),
  manager: ObjectId (ref: 'User', required),
  status: String (enum: 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'),
  startDate: Date (required),
  endDate: Date (required),
  budget: Number (default: 0, min: 0),
  location: String (optional),
  client: ObjectId (ref: 'User', optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `manager`
- `status`

### Relationships
- References: Users (manager, client)
- Referenced by: Tasks, Materials, Expenses, Documents

---

## 3. Tasks Collection

### Schema
```javascript
{
  title: String (required),
  description: String (optional),
  project: ObjectId (ref: 'Project', required),
  assignedTo: ObjectId (ref: 'User', required),
  status: String (enum: 'pending', 'in_progress', 'completed', 'on_hold'),
  progress: Number (0-100, default: 0),
  priority: String (enum: 'low', 'medium', 'high', 'urgent'),
  deadline: Date (required),
  completedAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `project`
- `assignedTo`
- `status`
- `deadline`

### Relationships
- References: Project, User (assignedTo)

---

## 4. Materials Collection

### Schema
```javascript
{
  name: String (required),
  category: String (enum: 'cement', 'steel', 'brick', 'wood', 'electrical', 'plumbing', 'paint', 'other'),
  quantity: Number (required, min: 0),
  unit: String (enum: 'kg', 'tons', 'bags', 'pieces', 'meters', 'liters', 'sqft', 'other'),
  project: ObjectId (ref: 'Project', required),
  supplier: {
    name: String (optional),
    contact: String (optional)
  },
  costPerUnit: Number (default: 0, min: 0),
  status: String (enum: 'available', 'low_stock', 'out_of_stock', 'ordered'),
  minThreshold: Number (default: 10, min: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `project`
- `category`
- `status`

### Relationships
- References: Project

---

## 5. Expenses Collection

### Schema
```javascript
{
  project: ObjectId (ref: 'Project', required),
  category: String (enum: 'labor', 'materials', 'equipment', 'transportation', 'utilities', 'permits', 'other'),
  amount: Number (required, min: 0),
  description: String (required),
  date: Date (required, default: now),
  createdBy: ObjectId (ref: 'User', required),
  receipt: String (optional),
  paymentMethod: String (enum: 'cash', 'card', 'bank_transfer', 'check'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `project`
- `date` (descending)
- `category`

### Relationships
- References: Project, User (createdBy)

---

## 6. Documents Collection

### Schema
```javascript
{
  filename: String (required),
  originalName: String (required),
  filepath: String (required),
  fileType: String (required),
  fileSize: Number (required),
  project: ObjectId (ref: 'Project', required),
  uploadedBy: ObjectId (ref: 'User', required),
  category: String (enum: 'blueprint', 'contract', 'invoice', 'photo', 'report', 'other'),
  version: Number (default: 1),
  description: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `project`
- `category`
- `uploadedBy`

### Relationships
- References: Project, User (uploadedBy)

---

## 7. Notifications Collection

### Schema
```javascript
{
  user: ObjectId (ref: 'User', required),
  message: String (required),
  type: String (enum: 'task_assigned', 'deadline_reminder', 'material_alert', 'project_update', 'system', 'other'),
  read: Boolean (default: false),
  link: String (optional),
  relatedId: ObjectId (optional),
  relatedType: String (enum: 'project', 'task', 'material', 'expense', 'document', optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `user, read` (compound)
- `createdAt` (descending)

### Relationships
- References: User

---

## Entity Relationship Diagram

```
Users
  ├── Projects (as manager/client)
  ├── Tasks (as assigned worker)
  ├── Expenses (as creator)
  ├── Documents (as uploader)
  └── Notifications (as recipient)

Projects
  ├── Tasks
  ├── Materials
  ├── Expenses
  └── Documents
```

---

## Data Integrity

### Validation Rules
1. **Email**: Must be valid email format, unique across users
2. **Password**: Minimum 6 characters, hashed before storage
3. **Dates**: End date must be after start date (application level)
4. **Progress**: Task progress must be between 0-100
5. **Budget**: Must be non-negative number
6. **Quantities**: Material quantities must be non-negative

### Cascading Deletes
Currently, cascading deletes are handled at application level:
- Deleting a project should handle related tasks, materials, expenses, documents
- Deleting a user should handle assignments and references

---

## Performance Optimization

### Indexes Strategy
1. **Primary Keys**: All collections use MongoDB's default `_id` index
2. **Foreign Keys**: Indexes on all ObjectId reference fields
3. **Query Fields**: Indexes on frequently queried fields (status, date, category)
4. **Compound Indexes**: User + read status for notifications

### Query Optimization
- Use `.select()` to limit returned fields
- Use `.populate()` for referenced documents
- Implement pagination for large datasets
- Use aggregation pipeline for complex queries

---

## Sample Data Structure

### User Document
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "role": "site_worker",
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

### Project Document
```json
{
  "_id": ObjectId("..."),
  "name": "Office Building Construction",
  "description": "New 5-story office building",
  "manager": ObjectId("..."),
  "status": "in_progress",
  "startDate": ISODate("2024-01-01T00:00:00Z"),
  "endDate": ISODate("2024-12-31T00:00:00Z"),
  "budget": 500000,
  "createdAt": ISODate("2024-01-01T00:00:00Z")
}
```

---

## Migration Notes

When setting up the database:
1. Collections are created automatically on first insert
2. Indexes are created automatically by Mongoose
3. Validation is enforced by Mongoose schemas
4. No manual migration scripts required for basic setup

