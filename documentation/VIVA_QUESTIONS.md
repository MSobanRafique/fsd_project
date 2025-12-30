# BuildWise - Viva Questions and Answers

## Project Overview Questions

### Q1: What is BuildWise?
**Answer:** BuildWise is a full-stack web application for managing construction projects. It helps track projects, tasks, materials, expenses, and documents for construction companies. The system supports multiple user roles including admin, project managers, site workers, and clients.

### Q2: Why did you choose this project?
**Answer:** Construction project management is a real-world problem that requires tracking multiple aspects like tasks, resources, budgets, and timelines. It demonstrates skills in database design, API development, and frontend architecture. The system handles complex relationships between entities and role-based access control.

---

## Technology Stack Questions

### Q3: What technologies did you use and why?
**Answer:**
- **Frontend:** React for component-based UI, React Router for navigation, Axios for API calls
- **Backend:** Node.js with Express.js for RESTful API, provides scalability and JavaScript consistency
- **Database:** MongoDB for flexible schema and document storage, suitable for varied data structures
- **Authentication:** JWT tokens for stateless authentication
- **Styling:** CSS3 with custom variables for maintainable, responsive design

### Q4: Why MongoDB instead of SQL database?
**Answer:** MongoDB's document-based structure fits well with our data model where projects, tasks, and materials have varied attributes. It allows flexible schema evolution and easy nesting of related data. For construction projects with varying requirements, MongoDB provides better flexibility than rigid SQL schemas.

---

## Architecture Questions

### Q5: Explain the system architecture.
**Answer:** The system follows a three-tier architecture:
1. **Presentation Layer:** React frontend running in the browser
2. **Application Layer:** Node.js/Express backend providing RESTful APIs
3. **Data Layer:** MongoDB database storing all data

Frontend makes HTTP requests to backend API endpoints. Backend validates requests, processes business logic, and interacts with MongoDB. Responses are sent back as JSON, which React uses to update the UI.

### Q6: How does authentication work?
**Answer:** 
- User registers/logs in with email and password
- Backend validates credentials and generates JWT token
- Token is stored in localStorage on frontend
- Token is included in Authorization header for protected routes
- Backend middleware verifies token on each request
- Token contains user ID and role information

---

## Database Questions

### Q7: Explain your database schema design.
**Answer:** We have 7 main collections:
1. **Users:** Stores user accounts with roles
2. **Projects:** Construction projects with manager, client, budget, timeline
3. **Tasks:** Project tasks linked to projects and assigned users
4. **Materials:** Construction materials with quantities, suppliers, stock status
5. **Expenses:** Financial records linked to projects
6. **Documents:** File uploads (blueprints, contracts, invoices)
7. **Notifications:** User notifications for alerts and updates

Relationships use MongoDB ObjectId references. Indexes are created on frequently queried fields for performance.

### Q8: How do you handle relationships between entities?
**Answer:** We use MongoDB ObjectId references:
- Projects reference Users (manager, client)
- Tasks reference Projects and Users (assignedTo)
- Materials, Expenses, Documents reference Projects
- Mongoose `.populate()` method loads referenced documents
- Application-level validation ensures referential integrity

---

## Frontend Questions

### Q9: Explain your frontend structure and component hierarchy.
**Answer:**
- **Layout Components:** Navbar (fixed top), Sidebar (navigation menu)
- **Page Components:** Dashboard, Projects, Tasks, Materials, Expenses, Documents, Profile
- **Context:** AuthContext for global authentication state
- **Services:** API service layer for backend communication
- **Routing:** React Router handles navigation and protected routes

Components are organized by feature. Each page component handles its own state and data fetching.

### Q10: How did you implement responsive design?
**Answer:** 
- Laptop-first approach with CSS Grid and Flexbox
- CSS variables for consistent spacing and colors
- Media queries for mobile devices (below 768px)
- Sidebar transforms to horizontal menu on mobile
- Card layouts adapt from multi-column to single column
- Touch-friendly button sizes and spacing

---

## Backend Questions

### Q11: Explain your API design and RESTful principles.
**Answer:** 
- RESTful endpoints with proper HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs: `/api/projects`, `/api/tasks`, etc.
- Status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found)
- JSON request/response format
- Query parameters for filtering (e.g., `?project=id`)
- Consistent error response format

### Q12: How do you handle role-based access control?
**Answer:**
- User roles stored in database: admin, project_manager, site_worker, client
- Middleware checks user role before allowing access
- `authorize()` middleware restricts routes to specific roles
- Frontend filters data based on user role
- Project managers see only their projects
- Site workers see only assigned tasks
- Admins have full access

### Q13: How do you handle file uploads?
**Answer:**
- Multer middleware handles multipart/form-data
- Files stored in `uploads/` directory with unique filenames
- File metadata stored in Documents collection
- Original filename, file path, size, and type stored in database
- Download endpoint streams files to client
- File deletion removes both database record and physical file

---

## Security Questions

### Q14: What security measures did you implement?
**Answer:**
1. **Password Hashing:** bcryptjs hashes passwords before storage
2. **JWT Tokens:** Secure token-based authentication
3. **Input Validation:** Mongoose schema validation
4. **CORS:** Configured for specific origins
5. **Protected Routes:** Middleware protects sensitive endpoints
6. **Role-Based Access:** Users can only access authorized data
7. **File Upload Limits:** File size restrictions (10MB)
8. **Error Handling:** Generic error messages prevent information leakage

### Q15: How do you prevent SQL injection or similar attacks?
**Answer:** 
- Using MongoDB with Mongoose ODM, which provides parameterized queries
- Input validation at schema level
- No raw query string concatenation
- Mongoose automatically escapes special characters
- JWT token verification prevents unauthorized access
- File upload validation (type and size checks)

---

## Module-Specific Questions

### Q16: Explain the Dashboard module.
**Answer:** Dashboard aggregates data from all modules:
- Project statistics (total, active, completed)
- Task overview (total, completed, pending, in progress)
- Budget summary (total, spent, remaining)
- Material alerts (low stock items)
- Unread notifications count
- Role-based data filtering

Data fetched from backend `/api/dashboard/stats` endpoint which queries multiple collections.

### Q17: How does the Task Tracking module work?
**Answer:**
- Tasks linked to projects and assigned to users
- Tasks have status (pending, in_progress, completed, on_hold)
- Progress tracked as percentage (0-100)
- Deadlines for time management
- Priority levels (low, medium, high, urgent)
- Workers update progress through their interface
- Managers create and assign tasks

### Q18: Explain Material Management.
**Answer:**
- Materials linked to specific projects
- Categories: cement, steel, brick, wood, electrical, plumbing, paint, other
- Quantity tracking with units (kg, tons, bags, pieces, etc.)
- Minimum threshold triggers low stock alerts
- Status updates automatically (available, low_stock, out_of_stock)
- Supplier information stored
- Cost per unit for budgeting

### Q19: How does Budget and Expense Tracking work?
**Answer:**
- Projects have allocated budgets
- Expenses recorded with category, amount, description, date
- Expense categories: labor, materials, equipment, transportation, utilities, permits, other
- Dashboard shows: total budget, spent amount, remaining
- Expense summary API provides category-wise breakdown
- Payment methods tracked (cash, card, bank transfer, check)
- Receipts can be uploaded as documents

---

## Coding Questions

### Q20: How did you organize code for three developers?
**Answer:**
- **Person 1 (Frontend):** All React components, CSS, frontend logic
- **Person 2 (Backend):** All API routes, controllers, middleware, server configuration
- **Person 3 (Database):** All Mongoose models, schemas, database documentation

Clear separation of concerns with well-defined interfaces (API contracts). Each developer worked independently on their layer, communicating through API specifications.

### Q21: How do you handle errors in the application?
**Answer:**
- **Frontend:** Try-catch blocks around API calls, error messages displayed to users
- **Backend:** Error handling middleware catches and formats errors
- **API:** Consistent error response format with status codes
- **Database:** Mongoose validation errors caught and returned
- **Network:** Axios interceptors handle network errors and redirect to login

### Q22: Explain state management in your React app.
**Answer:**
- **Global State:** AuthContext for authentication (user, token, login/logout functions)
- **Local State:** useState hook for component-specific data
- **Data Fetching:** useEffect hook fetches data on component mount
- **API Integration:** Service layer (api.js) handles all HTTP requests
- Context API used for shared authentication state across components

---

## Testing and Deployment Questions

### Q23: How would you test this application?
**Answer:**
- **Manual Testing:** Test all user flows for each role
- **API Testing:** Use Postman/Thunder Client to test endpoints
- **Database Testing:** Verify data integrity and relationships
- **Security Testing:** Test authentication, authorization, input validation
- **Performance Testing:** Check response times, database query performance
- **Frontend Testing:** Test responsive design, form validation, error handling

### Q24: How would you deploy this application?
**Answer:**
- **Backend:** Deploy Node.js app using PM2 process manager on VPS/cloud server
- **Frontend:** Build static files, serve via Nginx or Apache
- **Database:** MongoDB on same server or MongoDB Atlas cloud
- **Environment Variables:** Configure production environment variables
- **HTTPS:** Set up SSL certificates
- **Domain:** Configure DNS and reverse proxy
- **Monitoring:** Set up logging and monitoring tools

---

## Future Enhancements Questions

### Q25: What improvements would you make?
**Answer:**
1. **Real-time Updates:** WebSocket for live notifications
2. **Advanced Reporting:** PDF report generation
3. **Mobile App:** React Native mobile application
4. **File Storage:** Cloud storage (AWS S3) for documents
5. **Email Notifications:** Send email alerts for deadlines
6. **Advanced Analytics:** Charts and graphs library (Chart.js)
7. **Search Functionality:** Full-text search across projects
8. **Bulk Operations:** Import/export data functionality
9. **Activity Logs:** Track all user actions
10. **Multi-language Support:** Internationalization

---

## General Questions

### Q26: What challenges did you face?
**Answer:**
1. **Database Relationships:** Ensuring proper references and data consistency
2. **Role-Based Access:** Filtering data based on user roles
3. **File Uploads:** Handling file storage and downloads
4. **State Management:** Managing authentication state across components
5. **Responsive Design:** Making UI work on all screen sizes
6. **Error Handling:** Consistent error handling across frontend and backend

### Q27: What did you learn from this project?
**Answer:**
- Full-stack development workflow
- RESTful API design principles
- Database schema design and relationships
- Authentication and authorization implementation
- React component architecture
- Responsive web design
- Project planning and module breakdown
- Team collaboration on different layers

### Q28: How does your system handle concurrent users?
**Answer:**
- MongoDB handles concurrent reads efficiently
- JWT tokens enable stateless authentication (scalable)
- No server-side sessions (scalable architecture)
- Express.js handles multiple concurrent requests
- Database indexes optimize query performance
- Can scale horizontally with load balancer if needed

---

## Tips for Viva

1. **Know Your Code:** Be familiar with all modules you worked on
2. **Understand Flow:** Know how data flows from frontend to database
3. **Be Honest:** If you don't know something, admit it
4. **Explain Clearly:** Use diagrams or examples when explaining
5. **Show Enthusiasm:** Demonstrate passion for the project
6. **Be Prepared:** Practice explaining key concepts
7. **Stay Calm:** Take time to think before answering
8. **Ask for Clarification:** If question is unclear, ask for clarification

