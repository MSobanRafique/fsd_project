# BuildWise Database Schema Documentation

**Developed by: Person 3 - Database Team**

This document describes the database structure for BuildWise Construction Project Tracker system.

## Database: MongoDB
**Connection String:** `mongodb://localhost:27017/buildwise`

## Collections (Tables)

### 1. Users Collection
Stores user account information and authentication data.

**Schema:**
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'admin', 'project_manager', 'site_worker', 'client'),
  profilePic: String,
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- email (unique)

**Relationships:**
- Referenced by: Projects (manager, client), Tasks (assignedTo), Expenses (createdBy), Documents (uploadedBy), Notifications (user)

---

### 2. Projects Collection
Stores project information and metadata.

**Schema:**
```javascript
{
  name: String (required),
  description: String,
  manager: ObjectId (ref: User, required),
  status: String (enum: 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'),
  startDate: Date (required),
  endDate: Date (required),
  budget: Number (min: 0),
  location: String,
  client: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- manager
- status

**Relationships:**
- References: User (manager, client)
- Referenced by: Tasks (project), Materials (project), Expenses (project), Documents (project)

---

### 3. Tasks Collection
Stores task information with progress tracking.

**Schema:**
```javascript
{
  title: String (required),
  description: String,
  project: ObjectId (ref: Project, required),
  assignedTo: ObjectId (ref: User, required),
  status: String (enum: 'pending', 'in_progress', 'completed', 'on_hold'),
  progress: Number (0-100, default: 0),
  priority: String (enum: 'low', 'medium', 'high', 'urgent'),
  deadline: Date (required),
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- project
- assignedTo
- status
- deadline

**Relationships:**
- References: Project, User (assignedTo)

---

### 4. Materials Collection
Manages construction materials and resources.

**Schema:**
```javascript
{
  name: String (required),
  category: String (enum: 'cement', 'steel', 'brick', 'wood', 'electrical', 'plumbing', 'paint', 'other'),
  quantity: Number (required, min: 0),
  unit: String (enum: 'kg', 'tons', 'bags', 'pieces', 'meters', 'liters', 'sqft', 'other'),
  project: ObjectId (ref: Project, required),
  supplier: {
    name: String,
    contact: String
  },
  costPerUnit: Number (min: 0),
  status: String (enum: 'available', 'low_stock', 'out_of_stock', 'ordered'),
  minThreshold: Number (min: 0, default: 10),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- project
- category
- status

**Relationships:**
- References: Project

---

### 5. Expenses Collection
Tracks project expenses and costs.

**Schema:**
```javascript
{
  project: ObjectId (ref: Project, required),
  category: String (enum: 'labor', 'materials', 'equipment', 'transportation', 'utilities', 'permits', 'other'),
  amount: Number (required, min: 0),
  description: String (required),
  date: Date (required, default: now),
  createdBy: ObjectId (ref: User, required),
  receipt: String,
  paymentMethod: String (enum: 'cash', 'card', 'bank_transfer', 'check'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- project
- date (descending)
- category

**Relationships:**
- References: Project, User (createdBy)

---

### 6. Documents Collection
Manages project documents, blueprints, and files.

**Schema:**
```javascript
{
  filename: String (required),
  originalName: String (required),
  filepath: String (required),
  fileType: String (required),
  fileSize: Number (required),
  project: ObjectId (ref: Project, required),
  uploadedBy: ObjectId (ref: User, required),
  category: String (enum: 'blueprint', 'contract', 'invoice', 'photo', 'report', 'other'),
  version: Number (default: 1),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- project
- category
- uploadedBy

**Relationships:**
- References: Project, User (uploadedBy)

---

### 7. Notifications Collection
Stores system notifications for users.

**Schema:**
```javascript
{
  user: ObjectId (ref: User, required),
  message: String (required),
  type: String (enum: 'task_assigned', 'deadline_reminder', 'material_alert', 'project_update', 'system', 'other'),
  read: Boolean (default: false),
  link: String,
  relatedId: ObjectId,
  relatedType: String (enum: 'project', 'task', 'material', 'expense', 'document'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- user, read (compound)
- createdAt (descending)

**Relationships:**
- References: User

---

## Data Relationships Summary

```
Users
  ├── Projects (manager, client)
  ├── Tasks (assignedTo)
  ├── Expenses (createdBy)
  ├── Documents (uploadedBy)
  └── Notifications (user)

Projects
  ├── Tasks
  ├── Materials
  ├── Expenses
  └── Documents
```

## Database Design Decisions

1. **User Roles**: Stored as enum in Users collection for easy querying and validation
2. **References**: Using MongoDB ObjectId references for relationships
3. **Indexing**: Strategic indexes on frequently queried fields for performance
4. **Timestamps**: All collections use Mongoose timestamps (createdAt, updatedAt)
5. **Validation**: Schema-level validation ensures data integrity
6. **Password Security**: Passwords are hashed using bcrypt before storage

## Initial Setup

1. Ensure MongoDB is installed and running
2. Create database: `use buildwise`
3. Collections will be created automatically when first document is inserted
4. Indexes will be created automatically by Mongoose

## Notes

- All IDs are MongoDB ObjectIds
- Date fields use JavaScript Date objects
- Password field is excluded from queries by default (select: false)
- File paths for documents are stored relative to uploads directory

