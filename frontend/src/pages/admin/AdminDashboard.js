import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiCheckSquare, FiDollarSign, FiPackage, FiFile, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats', error);
    }
  }, []);

  const fetchRecentProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects?limit=5');
      setRecentProjects(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent projects', error);
    }
  }, []);

  const fetchPendingItems = useCallback(async () => {
    try {
      const [expensesRes, materialsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/materials')
      ]);
      // Filter pending items on frontend
      const pendingExp = expensesRes.data.filter(e => e.status === 'pending').slice(0, 5);
      const pendingMat = materialsRes.data.filter(m => m.approvalStatus === 'pending').slice(0, 5);
      setPendingExpenses(pendingExp);
      setPendingMaterials(pendingMat);
    } catch (error) {
      console.error('Error fetching pending items', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentProjects(),
        fetchPendingItems()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchRecentProjects, fetchPendingItems]);

  // Format currency
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading admin dashboard...</div>;
  }

  if (!stats) {
    return <div className="admin-dashboard-error">Failed to load admin dashboard</div>;
  }

  const budgetUtilization = stats.budget?.total > 0 
    ? ((stats.budget?.spent / stats.budget?.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>View projects and system overview.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/projects" className="btn btn-secondary">
            <FiFolder /> View Projects
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper projects">
            <FiFolder />
          </div>
          <div className="stat-content">
            <h3>Total Projects</h3>
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

        <div className="stat-card">
          <div className="stat-icon-wrapper notifications">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>Notifications</h3>
            <p className="stat-value">{stats.notifications?.unread || 0}</p>
            <p className="stat-subtitle">Unread notifications</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/projects" className="action-card">
            <FiFolder className="action-icon" />
            <h3>View Projects</h3>
            <p>Manage all projects</p>
          </Link>
          <Link to="/tasks" className="action-card">
            <FiCheckSquare className="action-icon" />
            <h3>Manage Tasks</h3>
            <p>View and assign tasks</p>
          </Link>
          <Link to="/expenses" className="action-card">
            <FiDollarSign className="action-icon" />
            <h3>View Expenses</h3>
            <p>Track project expenses</p>
          </Link>
          <Link to="/materials" className="action-card">
            <FiPackage className="action-icon" />
            <h3>Manage Materials</h3>
            <p>Track inventory and materials</p>
          </Link>
          <Link to="/documents" className="action-card">
            <FiFile className="action-icon" />
            <h3>Documents</h3>
            <p>Manage project documents</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Projects */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link to="/projects" className="section-link">View All</Link>
          </div>
          <div className="recent-list">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="recent-item">
                  <div className="recent-item-content">
                    <h4>{project.name}</h4>
                    <p className="recent-item-meta">
                      <span className={`status-badge status-${project.status}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                      {project.budget && (
                        <span className="budget-info">{formatCurrency(project.budget)}</span>
                      )}
                    </p>
                  </div>
                  <FiTrendingUp className="recent-item-icon" />
                </Link>
              ))
            ) : (
              <div className="empty-state">No projects yet</div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Pending Approvals</h2>
            <Link to="/manager" className="section-link">View All</Link>
          </div>
          <div className="pending-approvals">
            {pendingExpenses.length > 0 && (
              <div className="pending-group">
                <h3 className="pending-group-title">
                  <FiDollarSign /> Expenses ({pendingExpenses.length})
                </h3>
                <div className="pending-list">
                  {pendingExpenses.map((expense) => (
                    <Link key={expense._id} to="/expenses" className="pending-item">
                      <div className="pending-item-content">
                        <h4>{expense.description}</h4>
                        <p className="pending-item-meta">
                          <span>{formatCurrency(expense.amount)}</span>
                          <span className="pending-badge">Pending</span>
                        </p>
                      </div>
                      <FiClock className="pending-item-icon" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {pendingMaterials.length > 0 && (
              <div className="pending-group">
                <h3 className="pending-group-title">
                  <FiPackage /> Materials ({pendingMaterials.length})
                </h3>
                <div className="pending-list">
                  {pendingMaterials.map((material) => (
                    <Link key={material._id} to="/materials" className="pending-item">
                      <div className="pending-item-content">
                        <h4>{material.name}</h4>
                        <p className="pending-item-meta">
                          <span>{material.quantity} {material.unit}</span>
                          <span className="pending-badge">Pending</span>
                        </p>
                      </div>
                      <FiClock className="pending-item-icon" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {pendingExpenses.length === 0 && pendingMaterials.length === 0 && (
              <div className="empty-state">No pending approvals</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
