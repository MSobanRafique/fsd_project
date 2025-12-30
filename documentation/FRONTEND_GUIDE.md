# BuildWise Frontend Development Guide

## Overview
The frontend is built using React 18.2.0 with a clean, modern design approach. The application follows a laptop-first responsive design with a light theme.

## Technology Stack

- **React**: 18.2.0
- **React Router DOM**: 6.16.0 (for routing)
- **Axios**: 1.5.0 (for API calls)
- **React Icons**: 4.11.0 (for icons)
- **CSS3**: Custom styling with CSS variables

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.js
│   │       ├── Navbar.css
│   │       ├── Sidebar.js
│   │       └── Sidebar.css
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Auth.css
│   │   ├── Dashboard.js
│   │   ├── Dashboard.css
│   │   ├── projects/
│   │   │   ├── Projects.js
│   │   │   ├── Projects.css
│   │   │   ├── ProjectDetail.js
│   │   │   └── ProjectDetail.css
│   │   ├── tasks/
│   │   │   ├── Tasks.js
│   │   │   └── Tasks.css
│   │   ├── materials/
│   │   │   ├── Materials.js
│   │   │   └── Materials.css
│   │   ├── expenses/
│   │   │   ├── Expenses.js
│   │   │   └── Expenses.css
│   │   ├── documents/
│   │   │   ├── Documents.js
│   │   │   └── Documents.css
│   │   ├── Profile.js
│   │   └── Profile.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Component Architecture

### Layout Components

#### Navbar
- Fixed top navigation bar
- Shows user name and role
- Logout functionality
- Responsive design

#### Sidebar
- Left sidebar navigation
- Active route highlighting
- Icons for each menu item
- Collapses on mobile devices

### Page Components

#### Authentication Pages
- **Login**: User login form
- **Register**: User registration form
- Form validation and error handling

#### Dashboard
- Overview statistics
- Cards showing key metrics
- Charts and progress indicators
- Role-based data display

#### Projects
- List view of all projects
- Project cards with key information
- Status badges with color coding
- Link to project details

#### Tasks
- List of tasks
- Progress bars
- Status indicators
- Filtering capabilities

#### Materials
- Material inventory
- Stock status indicators
- Category organization

#### Expenses
- Expense list
- Total expenses summary
- Category breakdown

#### Documents
- Document list
- Download functionality
- File metadata display

## Styling Approach

### CSS Variables
All colors, spacing, and typography use CSS variables defined in `index.css`:

```css
:root {
  --primary-color: #2563eb;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --spacing-md: 1.5rem;
  /* ... more variables */
}
```

### Design Principles
1. **Light Theme**: Clean, professional light colors
2. **Laptop First**: Designed for laptop screens, responsive for mobile
3. **Consistent Spacing**: Using CSS variables for spacing
4. **Card-based Layout**: Information organized in cards
5. **Subtle Shadows**: Box shadows for depth
6. **Smooth Transitions**: Hover effects and animations

### Responsive Breakpoints
- Desktop: 1024px and above
- Tablet: 768px - 1023px
- Mobile: Below 768px

## State Management

### Authentication Context
Uses React Context API for global authentication state:

```javascript
const { user, login, register, logout } = useAuth();
```

### Component State
- Local component state using `useState` hook
- Data fetching with `useEffect` hook
- API calls through service layer

## API Integration

### API Service Layer
All API calls go through `src/services/api.js`:

```javascript
import api from '../services/api';

// GET request
const response = await api.get('/projects');

// POST request
const response = await api.post('/auth/login', { email, password });
```

### Authentication
- JWT token stored in localStorage
- Token automatically added to request headers
- Automatic redirect to login on 401 errors

## Routing

### Route Configuration
Routes defined in `App.js`:

```javascript
<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/projects/:id" element={<ProjectDetail />} />
  {/* ... more routes */}
</Routes>
```

### Protected Routes
- All routes except login/register require authentication
- Unauthenticated users redirected to login
- Route protection handled in `App.js`

## User Roles and Permissions

### Role-Based UI
- Different data displayed based on user role
- Admin: Full access
- Project Manager: Project management
- Site Worker: Task updates
- Client: View only

### Role Handling
Role information comes from user object:
```javascript
const { user } = useAuth();
const userRole = user?.role; // 'admin', 'project_manager', etc.
```

## Error Handling

### API Errors
- Errors caught in try-catch blocks
- Error messages displayed to users
- Network errors handled gracefully

### Loading States
- Loading indicators during data fetch
- Disabled buttons during form submission
- Loading spinners for better UX

## Best Practices

1. **Component Organization**: Group related components together
2. **Reusable Components**: Extract common UI patterns
3. **CSS Modules**: Consider CSS modules for larger projects
4. **Error Boundaries**: Implement error boundaries for production
5. **Performance**: Use React.memo for expensive components
6. **Accessibility**: Semantic HTML, ARIA labels where needed

## Development Workflow

1. Create component file (`.js`)
2. Create corresponding CSS file (`.css`)
3. Import and use in parent component
4. Test in browser
5. Ensure responsive design works
6. Check browser console for errors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Build and Deployment

### Development
```bash
npm start
```
Runs on http://localhost:3000

### Production Build
```bash
npm run build
```
Creates optimized build in `build/` directory

### Deployment
- Build static files
- Serve via web server (Nginx, Apache)
- Configure API URL for production backend

