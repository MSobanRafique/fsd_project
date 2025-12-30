// Navigation Bar Component
// Person 1 - Frontend Developer

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button 
            className="drawer-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu />
          </button>
          <Link to="/dashboard" className="navbar-brand">
            <h1>BuildWise</h1>
          </Link>
        </div>
        <div className="navbar-menu">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <div className="navbar-user">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

