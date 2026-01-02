import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiCheckSquare, FiDollarSign, FiPackage, FiFile, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching manager stats', error);
    }
  }, []);

  const fetchRecentProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
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
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching pending items', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentProjects(),
      fetchPendingItems()
    ]);
    setLoading(false);
  }, [fetchStats, fetchRecentProjects, fetchPendingItems]);

  useEffect(() => {
    // Initial load
    loadAllData();

    // Set up live updates every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchPendingItems();
    }, 30000); // Update every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [loadAllData, fetchStats, fetchPendingItems]);

  // Format currency
  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <div className="manager-dashboard-loading">Loading manager dashboard...</div>;
  }

  if (!stats) {
    return <div className="manager-dashboard-error">Failed to load manager dashboard</div>;
  }

  const budgetUtilization = stats.budget?.total > 0 
    ? ((stats.budget?.spent / stats.budget?.total) * 100).toFixed(1)
    : 0;

  const totalPending = pendingExpenses.length + pendingMaterials.length;

  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Assign tasks, update project status, approve expenses/materials.</p>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {formatTime(lastUpdate)} • Auto-refreshing every 30s
            </p>
          )}
        </div>
        <div className="dashboard-actions">
          <Link to="/manager/approvals" className="btn btn-primary">
            <FiAlertCircle /> Pending Approvals {totalPending > 0 && `(${totalPending})`}
          </Link>
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
            <h3>My Projects</h3>
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
          <div className="stat-icon-wrapper approvals">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{totalPending}</p>
            <p className="stat-subtitle">
              {pendingExpenses.length} expenses • {pendingMaterials.length} materials
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
          <Link to="/tasks" className="action-card">
            <FiCheckSquare className="action-icon" />
            <h3>Assign Tasks</h3>
            <p>Create and assign tasks to workers.</p>
          </Link>
          <Link to="/projects" className="action-card">
            <FiFolder className="action-icon" />
            <h3>Update Project Status</h3>
            <p>Manage project details and milestones.</p>
          </Link>
          <Link to="/manager/approvals" className="action-card">
            <FiDollarSign className="action-icon" />
            <h3>Approve Expenses</h3>
            <p>Review and approve pending expenses.</p>
          </Link>
          <Link to="/materials" className="action-card">
            <FiPackage className="action-icon" />
            <h3>Approve Materials</h3>
            <p>Review material requests and inventory.</p>
          </Link>
          <Link to="/expenses" className="action-card">
            <FiDollarSign className="action-icon" />
            <h3>View Expenses</h3>
            <p>Track project expenses.</p>
          </Link>
          <Link to="/documents" className="action-card">
            <FiFile className="action-icon" />
            <h3>Documents</h3>
            <p>Manage project documents.</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Projects */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">My Projects</h2>
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
              <div className="empty-state">No projects assigned</div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Pending Approvals</h2>
            <Link to="/manager/approvals" className="section-link">View All</Link>
          </div>
          <div className="pending-approvals">
            {pendingExpenses.length > 0 && (
              <div className="pending-group">
                <h3 className="pending-group-title">
                  <FiDollarSign /> Expenses ({pendingExpenses.length})
                </h3>
                <div className="pending-list">
                  {pendingExpenses.map((expense) => (
                    <Link key={expense._id} to="/manager/approvals" className="pending-item">
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
                    <Link key={material._id} to="/manager/approvals" className="pending-item">
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

export default ManagerDashboard;
