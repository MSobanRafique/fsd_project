import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FiFolder, 
  FiUsers, 
  FiCheckSquare, 
  FiDollarSign, 
  FiPackage, 
  FiTrendingUp,
  FiSettings,
  FiUserPlus,
  FiBarChart2,
  FiBell
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/auth/users').catch(() => ({ data: [] }))
        ]);
        
        setStats(statsResponse.data);
        
        // Calculate user statistics by role
        const users = usersResponse.data || [];
        const userStatsData = {
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          managers: users.filter(u => u.role === 'project_manager').length,
          workers: users.filter(u => u.role === 'site_worker').length,
          clients: users.filter(u => u.role === 'client').length
        };
        setUserStats(userStatsData);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p>Failed to load admin dashboard</p>
        </div>
      </div>
    );
  }

  const taskCompletionRate = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
    : 0;

  const budgetUtilization = stats.budget.total > 0
    ? Math.round((stats.budget.spent / stats.budget.total) * 100)
    : 0;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Comprehensive overview of your BuildWise system</p>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn primary" 
            onClick={() => navigate('/admin/users')}
          >
            <FiUserPlus /> Manage Users
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card projects">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiFolder />
            </div>
          </div>
          <div className="stat-content">
            <h3>Projects</h3>
            <p className="stat-value">{stats.projects.total}</p>
            <div className="stat-details">
              <span className="stat-badge active">{stats.projects.active} active</span>
              {stats.projects.completed > 0 && (
                <span className="stat-badge completed">{stats.projects.completed} completed</span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card users">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiUsers />
            </div>
          </div>
          <div className="stat-content">
            <h3>Users</h3>
            <p className="stat-value">{userStats?.total || 0}</p>
            <div className="stat-details">
              {userStats && (
                <>
                  <span className="stat-badge">{userStats.managers} managers</span>
                  <span className="stat-badge">{userStats.workers} workers</span>
                  <span className="stat-badge">{userStats.clients} clients</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card tasks">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiCheckSquare />
            </div>
          </div>
          <div className="stat-content">
            <h3>Tasks</h3>
            <p className="stat-value">{stats.tasks.total}</p>
            <div className="stat-details">
              <span className="stat-badge success">{stats.tasks.completed} completed</span>
              <span className="stat-badge warning">{stats.tasks.pending} pending</span>
              {stats.tasks.inProgress > 0 && (
                <span className="stat-badge info">{stats.tasks.inProgress} in progress</span>
              )}
            </div>
            {taskCompletionRate > 0 && (
              <div className="stat-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${taskCompletionRate}%` }}
                  ></div>
                </div>
                <span className="progress-text">{taskCompletionRate}% complete</span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-stat-card budget">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
          </div>
          <div className="stat-content">
            <h3>Budget</h3>
            <p className="stat-value">PKR {stats.budget.total.toLocaleString()}</p>
            <div className="stat-details">
              <span className="stat-badge spent">PKR {stats.budget.spent.toLocaleString()} spent</span>
              <span className="stat-badge remaining">PKR {stats.budget.remaining.toLocaleString()} remaining</span>
            </div>
            {budgetUtilization > 0 && (
              <div className="stat-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill budget" 
                    style={{ width: `${budgetUtilization}%` }}
                  ></div>
                </div>
                <span className="progress-text">{budgetUtilization}% utilized</span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-stat-card materials">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiPackage />
            </div>
          </div>
          <div className="stat-content">
            <h3>Materials</h3>
            <p className="stat-value">{stats.materials.total}</p>
            <div className="stat-details">
              {stats.materials.lowStock > 0 ? (
                <span className="stat-badge danger">{stats.materials.lowStock} low stock</span>
              ) : (
                <span className="stat-badge success">All stocked</span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card notifications">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">
              <FiBell />
            </div>
          </div>
          <div className="stat-content">
            <h3>Notifications</h3>
            <p className="stat-value">{stats.notifications?.unread || 0}</p>
            <div className="stat-details">
              <span className="stat-badge">Unread notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Insights */}
      <div className="admin-content-grid">
        <div className="admin-card quick-actions">
          <div className="card-header">
            <h2>
              <FiSettings /> Quick Actions
            </h2>
          </div>
          <div className="card-content">
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin/users')}
            >
              <FiUsers />
              <span>Manage Users</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/projects')}
            >
              <FiFolder />
              <span>View Projects</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/tasks')}
            >
              <FiCheckSquare />
              <span>Manage Tasks</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/expenses')}
            >
              <FiDollarSign />
              <span>View Expenses</span>
            </button>
          </div>
        </div>

        <div className="admin-card insights">
          <div className="card-header">
            <h2>
              <FiBarChart2 /> System Insights
            </h2>
          </div>
          <div className="card-content">
            <div className="insight-item">
              <div className="insight-label">Project Activity</div>
              <div className="insight-value">
                {stats.projects.active > 0 ? (
                  <span className="positive">
                    <FiTrendingUp /> {stats.projects.active} active projects
                  </span>
                ) : (
                  <span className="neutral">No active projects</span>
                )}
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Task Completion</div>
              <div className="insight-value">
                <span className={taskCompletionRate >= 70 ? 'positive' : taskCompletionRate >= 40 ? 'warning' : 'negative'}>
                  {taskCompletionRate}%
                </span>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Budget Utilization</div>
              <div className="insight-value">
                <span className={budgetUtilization <= 80 ? 'positive' : budgetUtilization <= 95 ? 'warning' : 'negative'}>
                  {budgetUtilization}%
                </span>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-label">Material Status</div>
              <div className="insight-value">
                {stats.materials.lowStock > 0 ? (
                  <span className="negative">⚠️ {stats.materials.lowStock} items need attention</span>
                ) : (
                  <span className="positive">✓ All materials stocked</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

