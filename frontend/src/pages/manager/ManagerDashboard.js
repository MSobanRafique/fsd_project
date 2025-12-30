import React from 'react';
import { Link } from 'react-router-dom';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  return (
    <div className="manager-dashboard">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p>Assign tasks, update project status, approve expenses/materials.</p>
      </div>

      <div className="quick-actions">
        <Link className="action-card" to="/tasks">
          <h3>Assign Tasks</h3>
          <p>Create and assign tasks to workers.</p>
        </Link>
        <Link className="action-card" to="/projects">
          <h3>Update Project Status</h3>
          <p>Manage project details and milestones.</p>
        </Link>
        <Link className="action-card" to="/expenses">
          <h3>Approve Expenses</h3>
          <p>Review and approve pending expenses.</p>
        </Link>
        <Link className="action-card" to="/materials">
          <h3>Approve Materials</h3>
          <p>Review material requests and inventory.</p>
        </Link>
      </div>
    </div>
  );
};

export default ManagerDashboard;

