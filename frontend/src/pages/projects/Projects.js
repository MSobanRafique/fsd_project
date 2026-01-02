// Projects List Page
// Frontend Developer - Person 1

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ProjectModal from '../../components/modals/ProjectModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const canCreateProject = !authLoading && user && user.role === 'admin';
  const canDeleteProject = !authLoading && user && user.role === 'admin';

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Helper to get manager names for search
      const getManagerNames = (manager) => {
        if (!manager) return '';
        if (Array.isArray(manager)) {
          return manager.map(m => m?.name || '').join(' ').toLowerCase();
        }
        return (manager?.name || '').toLowerCase();
      };
      
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (project.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           getManagerNames(project.manager).includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const handleCreateProject = () => {
    // Double-check permission before opening modal
    if (!canCreateProject) {
      showError('You do not have permission to create projects. Only admins can create projects.');
      return;
    }
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      showSuccess('Project deleted successfully');
      fetchProjects();
      setShowDeleteConfirm(false);
      setDeletingProject(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleProjectSuccess = () => {
    fetchProjects();
  };

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
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Manage and track your construction projects</p>
        </div>
        {canCreateProject && (
          <button className="btn btn-primary" onClick={handleCreateProject}>
            <FiPlus /> Create Project
          </button>
        )}
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects by name, description, or manager..."
        />
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="projects-grid">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          type="projects"
          message={searchQuery || statusFilter !== 'all' 
            ? 'No projects match your search criteria. Try adjusting your filters.'
            : undefined}
        />
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            // Check if user is in manager array
            const isManager = Array.isArray(project.manager) 
              ? project.manager.some(m => (m._id || m).toString() === user?._id)
              : (project.manager?._id || project.manager)?.toString() === user?._id;
            const canEdit = user?.role === 'admin' || (user?.role === 'project_manager' && isManager);
            
            return (
              <div key={project._id} className="project-card-wrapper">
                <Link 
                  to={`/projects/${project._id}`}
                  className="project-card"
                >
                  <div className="project-header">
                    <h2>{project.name}</h2>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
              <p className="project-description">{project.description || 'No description'}</p>
              <div className="project-footer">
                <div className="project-info">
                  <span className="info-item">
                    <strong>Manager{Array.isArray(project.manager) && project.manager.length > 1 ? 's' : ''}:</strong> {
                      Array.isArray(project.manager) 
                        ? project.manager.map(m => m?.name || 'N/A').join(', ') 
                        : (project.manager?.name || 'N/A')
                    }
                  </span>
                  <span className="info-item">
                    <strong>Budget:</strong> PKR {project.budget?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="project-dates">
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                  <span>→</span>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>
                </Link>
                {(canEdit || canDeleteProject) && (
                  <div className="project-actions">
                    {canEdit && (
                      <button
                        className="btn-icon btn-edit"
                        onClick={(e) => handleEditProject(project, e)}
                        title="Edit project"
                      >
                        <FiEdit2 />
                      </button>
                    )}
                    {canDeleteProject && (
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingProject(project);
                          setShowDeleteConfirm(true);
                        }}
                        title="Delete project"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="no-results">
          <p>No projects found matching your criteria.</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={handleProjectSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingProject(null);
        }}
        onConfirm={() => deletingProject && handleDeleteProject(deletingProject._id)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone and will affect all related tasks, materials, expenses, and documents.`}
        confirmText="Delete Project"
        type="danger"
      />
    </div>
  );
};

export default Projects;

