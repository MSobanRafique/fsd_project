import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import Tasks from './pages/tasks/Tasks';
import Materials from './pages/materials/Materials';
import Expenses from './pages/expenses/Expenses';
import Documents from './pages/documents/Documents';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ClientWorkerDashboard from './pages/portal/ClientWorkerDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Approvals from './pages/manager/Approvals';
import SubmitExpense from './pages/portal/SubmitExpense';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const roleHome = {
    admin: '/admin',
    project_manager: '/manager',
    site_worker: '/portal',
    client: '/portal'
  };

  const RoleRoute = ({ roles, element }) => {
    if (!roles.includes(user.role)) {
      return <Navigate to={roleHome[user.role] || '/dashboard'} replace />;
    }
    return element;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="app-body">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Routes>
              <Route path="/" element={<Navigate to={roleHome[user.role] || '/dashboard'} replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Module dashboards */}
              <Route path="/admin" element={<RoleRoute roles={['admin']} element={<AdminDashboard />} />} />
              <Route path="/admin/users" element={<RoleRoute roles={['admin']} element={<AdminUsers />} />} />
              <Route path="/manager" element={<RoleRoute roles={['project_manager', 'admin']} element={<ManagerDashboard />} />} />
              <Route path="/manager/approvals" element={<RoleRoute roles={['project_manager', 'admin']} element={<Approvals />} />} />
              <Route path="/portal" element={<RoleRoute roles={['site_worker', 'client', 'project_manager', 'admin']} element={<ClientWorkerDashboard />} />} />
              <Route path="/portal/submit-expense" element={<RoleRoute roles={['site_worker', 'client', 'project_manager', 'admin']} element={<SubmitExpense />} />} />

              {/* Shared feature routes */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to={roleHome[user.role] || '/dashboard'} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

