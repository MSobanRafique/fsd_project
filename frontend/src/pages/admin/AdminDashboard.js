import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load admin dashboard</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, projects, and view system overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-value">{stats.projects.total}</p>
          <p className="stat-subtitle">{stats.projects.active} active</p>
        </div>
        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-value">{stats.users?.total || 0}</p>
          <p className="stat-subtitle">Admins/Managers/Workers/Clients</p>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p className="stat-value">{stats.tasks.total}</p>
          <p className="stat-subtitle">{stats.tasks.completed} completed</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

