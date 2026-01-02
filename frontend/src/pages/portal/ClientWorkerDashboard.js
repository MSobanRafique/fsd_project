import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiCheckSquare, FiDollarSign, FiFile, FiTrendingUp, FiClock, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import './ClientWorkerDashboard.css';

const ClientWorkerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
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

  const fetchRecentTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setRecentTasks(response.data.slice(0, 5));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching recent tasks', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentProjects(),
      fetchRecentTasks()
    ]);
    setLoading(false);
  }, [fetchStats, fetchRecentProjects, fetchRecentTasks]);

  useEffect(() => {
    loadAllData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAllData, fetchStats, fetchRecentTasks]);

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
      <div className="portal-dashboard">
        <div className="dashboard-header">
          <h1>My Workspace</h1>
        </div>
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="portal-dashboard">
        <div className="dashboard-error">Failed to load dashboard data</div>
      </div>
    );
  }

  const budgetUtilization = stats.budget?.total > 0 
    ? ((stats.budget?.spent / stats.budget?.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="portal-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Workspace</h1>
          <p>View your projects and tasks, update progress, and submit expenses.</p>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {formatTime(lastUpdate)} • Auto-refreshing every 30s
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
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
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/tasks" className="action-card">
            <FiCheckSquare className="action-icon" />
            <h3>My Tasks</h3>
            <p>View and update progress on assigned tasks.</p>
          </Link>
          <Link to="/projects" className="action-card">
            <FiFolder className="action-icon" />
            <h3>Project Details</h3>
            <p>Check project status and milestones.</p>
          </Link>
          <Link to="/portal/submit-expense" className="action-card">
            <FiDollarSign className="action-icon" />
            <h3>Submit Expenses</h3>
            <p>Log expenses or work updates for your projects.</p>
          </Link>
          <Link to="/documents" className="action-card">
            <FiFile className="action-icon" />
            <h3>Shared Documents</h3>
            <p>Access files shared with you.</p>
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
              <EmptyState 
                type="projects" 
                title="No Projects"
                message="You don't have any projects assigned yet."
              />
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <Link to="/tasks" className="section-link">View All</Link>
          </div>
          <div className="recent-list">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <Link key={task._id} to={`/tasks`} className="recent-item">
                  <div className="recent-item-content">
                    <h4>{task.title}</h4>
                    <p className="recent-item-meta">
                      <span className={`status-badge status-${task.status}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className="date-info">
                          <FiClock /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <FiCheckSquare className="recent-item-icon" />
                </Link>
              ))
            ) : (
              <EmptyState 
                type="tasks" 
                title="No Tasks"
                message="You don't have any tasks assigned yet."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWorkerDashboard;

