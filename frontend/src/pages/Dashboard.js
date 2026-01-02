// Dashboard Page Component
// Person 1 - Frontend Developer

import React, { useState, useEffect, useCallback } from 'react';
import { FiFolder, FiCheckSquare, FiDollarSign, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">Failed to load dashboard data</div>
      </div>
    );
  }

  const budgetUtilization = stats.budget?.total > 0 
    ? ((stats.budget?.spent / stats.budget?.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your projects.</p>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {formatTime(lastUpdate)} • Auto-refreshing every 30s
            </p>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper projects">
            <FiFolder />
          </div>
          <div className="stat-content">
            <h3>Projects</h3>
            <p className="stat-value">{stats.projects?.total || 0}</p>
            <p className="stat-subtitle">
              {stats.projects?.active || 0} active • {stats.projects?.completed || 0} completed
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper tasks">
            <FiCheckSquare />
          </div>
          <div className="stat-content">
            <h3>Tasks</h3>
            <p className="stat-value">{stats.tasks?.total || 0}</p>
            <p className="stat-subtitle">
              {stats.tasks?.completed || 0} completed • {stats.tasks?.pending || 0} pending
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper budget">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Budget</h3>
            <p className="stat-value">{formatCurrency(stats.budget?.total || 0)}</p>
            <p className="stat-subtitle">
              {formatCurrency(stats.budget?.spent || 0)} spent • {budgetUtilization}% utilized
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper materials">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>Materials</h3>
            <p className="stat-value">{stats.materials?.total || 0}</p>
            <p className="stat-subtitle">
              {stats.materials?.lowStock || 0} low stock items
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h2>Tasks Overview</h2>
          <div className="task-stats">
            <div className="task-stat-item">
              <span className="task-label">Completed</span>
              <span className="task-value">{stats.tasks?.completed || 0}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-label">In Progress</span>
              <span className="task-value">{stats.tasks?.inProgress || 0}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-label">Pending</span>
              <span className="task-value">{stats.tasks?.pending || 0}</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>Budget Overview</h2>
          <div className="budget-stats">
            <div className="budget-item">
              <span className="budget-label">Total Budget</span>
              <span className="budget-value">{formatCurrency(stats.budget?.total || 0)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Spent</span>
              <span className="budget-value spent">{formatCurrency(stats.budget?.spent || 0)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className="budget-value remaining">{formatCurrency(stats.budget?.remaining || 0)}</span>
            </div>
            <div className="budget-progress">
              <div 
                className="budget-progress-bar" 
                style={{ width: `${budgetUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

