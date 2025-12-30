import React from 'react';
import { Link } from 'react-router-dom';
import './ClientWorkerDashboard.css';

const ClientWorkerDashboard = () => {
  return (
    <div className="portal-dashboard">
      <div className="dashboard-header">
        <h1>My Workspace</h1>
        <p>View your projects and tasks, update progress, and submit expenses.</p>
      </div>

      <div className="quick-actions">
        <Link className="action-card" to="/tasks">
          <h3>My Tasks</h3>
          <p>View and update progress on assigned tasks.</p>
        </Link>
        <Link className="action-card" to="/projects">
          <h3>Project Details</h3>
          <p>Check project status and milestones.</p>
        </Link>
        <Link className="action-card" to="/expenses">
          <h3>Submit Expenses</h3>
          <p>Log expenses or work updates for your projects.</p>
        </Link>
        <Link className="action-card" to="/documents">
          <h3>Shared Documents</h3>
          <p>Access files shared with you.</p>
        </Link>
      </div>
    </div>
  );
};

export default ClientWorkerDashboard;

