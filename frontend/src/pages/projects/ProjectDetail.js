// Project Detail Page
// Person 1 - Frontend Developer

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: '#64748b',
      in_progress: '#2563eb',
      on_hold: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <div>
          <h1>{project.name}</h1>
          <p className="project-meta">
            Manager{Array.isArray(project.manager) && project.manager.length > 1 ? 's' : ''}: {
              Array.isArray(project.manager) 
                ? project.manager.map(m => m?.name || 'N/A').join(', ') 
                : (project.manager?.name || 'N/A')
            } | 
            Status: <span style={{ color: getStatusColor(project.status) }}>
              {project.status.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      <div className="project-detail-content">
        <div className="project-info-card">
          <h2>Project Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Description</label>
              <p>{project.description || 'No description provided'}</p>
            </div>
            <div className="info-item">
              <label>Start Date</label>
              <p>{new Date(project.startDate).toLocaleDateString()}</p>
            </div>
            <div className="info-item">
              <label>End Date</label>
              <p>{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
            <div className="info-item">
              <label>Budget</label>
              <p>PKR {project.budget?.toLocaleString() || '0'}</p>
            </div>
            {project.location && (
              <div className="info-item">
                <label>Location</label>
                <p>{project.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

