// Dashboard Page Component
// Person 1 - Frontend Developer

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your projects.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Projects</h3>
            <p className="stat-value">{stats.projects.total}</p>
            <p className="stat-subtitle">{stats.projects.active} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tasks">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tasks</h3>
            <p className="stat-value">{stats.tasks.total}</p>
            <p className="stat-subtitle">{stats.tasks.completed} completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon budget">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Budget</h3>
            <p className="stat-value">PKR {stats.budget.total.toLocaleString()}</p>
            <p className="stat-subtitle">PKR {stats.budget.remaining.toLocaleString()} remaining</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon materials">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Materials</h3>
            <p className="stat-value">{stats.materials.total}</p>
            <p className="stat-subtitle">{stats.materials.lowStock} low stock</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h2>Tasks Overview</h2>
          <div className="task-stats">
            <div className="task-stat-item">
              <span className="task-label">Completed</span>
              <span className="task-value">{stats.tasks.completed}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-label">In Progress</span>
              <span className="task-value">{stats.tasks.inProgress}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-label">Pending</span>
              <span className="task-value">{stats.tasks.pending}</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>Budget Overview</h2>
          <div className="budget-stats">
            <div className="budget-item">
              <span className="budget-label">Total Budget</span>
              <span className="budget-value">PKR {stats.budget.total.toLocaleString()}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Spent</span>
              <span className="budget-value spent">PKR {stats.budget.spent.toLocaleString()}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className="budget-value remaining">PKR {stats.budget.remaining.toLocaleString()}</span>
            </div>
            <div className="budget-progress">
              <div 
                className="budget-progress-bar" 
                style={{ width: `${(stats.budget.spent / stats.budget.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

