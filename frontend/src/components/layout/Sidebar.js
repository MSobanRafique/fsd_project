// Sidebar Navigation Component
// Frontend Developer - Person 1

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiLayout, 
  FiFolder, 
  FiCheckSquare, 
  FiPackage, 
  FiDollarSign,
  FiFile,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const buildMenu = () => {
    const common = [
      { path: '/profile', label: 'Profile', icon: <FiUser /> },
    ];

    if (user?.role === 'admin') {
      return [
        { path: '/admin', label: 'Admin', icon: <FiLayout /> },
        { path: '/projects', label: 'Projects', icon: <FiFolder /> },
        { path: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
        { path: '/materials', label: 'Materials', icon: <FiPackage /> },
        { path: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
        { path: '/documents', label: 'Documents', icon: <FiFile /> },
        ...common
      ];
    }

    if (user?.role === 'project_manager') {
      return [
        { path: '/manager', label: 'Manager', icon: <FiLayout /> },
        { path: '/projects', label: 'Projects', icon: <FiFolder /> },
        { path: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
        { path: '/materials', label: 'Materials', icon: <FiPackage /> },
        { path: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
        { path: '/documents', label: 'Documents', icon: <FiFile /> },
        ...common
      ];
    }

    // client or site_worker
    return [
      { path: '/portal', label: 'My Workspace', icon: <FiLayout /> },
      { path: '/projects', label: 'Projects', icon: <FiFolder /> },
      { path: '/tasks', label: 'Tasks', icon: <FiCheckSquare /> },
      { path: '/expenses', label: 'Expenses', icon: <FiDollarSign /> },
      { path: '/documents', label: 'Documents', icon: <FiFile /> },
      ...common
    ];
  };

  const menuItems = buildMenu();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

