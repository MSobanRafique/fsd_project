# BuildWise Frontend

This is the frontend React application for BuildWise Construction Project Tracker.

## Developed by: Person 1 - Frontend Developer

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/          # Reusable components
│   └── layout/         # Layout components (Navbar, Sidebar)
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── projects/      # Project pages
│   ├── tasks/         # Task pages
│   ├── materials/     # Material pages
│   ├── expenses/      # Expense pages
│   └── documents/     # Document pages
├── context/           # React Context (Auth)
├── services/          # API service layer
├── App.js             # Main app component
└── index.js           # Entry point
```

## Features

- Responsive design (laptop-first approach)
- Light theme with professional color scheme
- User authentication
- Role-based navigation
- Dashboard with statistics
- Project management
- Task tracking
- Material management
- Expense tracking
- Document management

## Technology Stack

- React 18.2.0
- React Router DOM 6.16.0
- Axios for API calls
- React Icons for icons
- CSS3 for styling

## Design Principles

- Clean and modern UI
- Light theme (no purple gradients)
- Laptop-first responsive design
- Accessible and user-friendly
- Consistent spacing and typography

