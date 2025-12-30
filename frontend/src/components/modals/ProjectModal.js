// Project Create/Edit Modal
// Person 1 - Frontend Developer

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Modal.css';

const ProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    location: '',
    status: 'planning',
    manager: '',
    client: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const { success: showSuccess, error: showError } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          budget: project.budget || '',
          location: project.location || '',
          status: project.status || 'planning',
          manager: project.manager?._id || project.manager || '',
          client: project.client?._id || project.client || ''
        });
      } else {
        resetForm();
      }
      setDateError('');
    }
  }, [isOpen, project]);

  const fetchUsers = async () => {
    try {
      // Fetch users for manager/client selection
      // Note: This endpoint might need to be created
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      // If endpoint doesn't exist, we'll handle it gracefully
      console.log('Users endpoint not available');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      location: '',
      status: 'planning',
      manager: '',
      client: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Validate dates in real-time
      if (name === 'startDate' || name === 'endDate') {
        validateDates(updated.startDate, updated.endDate);
      }
      
      return updated;
    });
  };

  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set time to midnight for accurate comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      if (end < start) {
        setDateError('End date cannot be before start date');
      } else if (end.getTime() === start.getTime()) {
        setDateError('End date must be after start date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Project name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showError('Start date and end date are required');
      return;
    }

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      showError('End date cannot be before start date');
      setDateError('End date cannot be before start date');
      return;
    }

    if (end.getTime() === start.getTime()) {
      showError('End date must be after start date');
      setDateError('End date must be after start date');
      return;
    }

    if (dateError) {
      showError(dateError);
      return;
    }

    // Verify user role before making request
    if (!project && user?.role !== 'admin') {
      showError('Only administrators can create projects. Please log in as an admin.');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        manager: formData.manager || undefined,
        client: formData.client || undefined
      };

      if (project) {
        await api.put(`/projects/${project._id}`, submitData);
        showSuccess('Project updated successfully');
      } else {
        // Double-check role before creating
        if (user?.role !== 'admin') {
          showError('Only administrators can create projects. Your current role: ' + (user?.role || 'unknown'));
          setLoading(false);
          return;
        }
        await api.post('/projects', submitData);
        showSuccess('Project created successfully');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save project';
      console.error('Project save error:', error);
      
      // If it's a 403 error, provide more context
      if (error.response?.status === 403) {
        showError(`${errorMessage}. Current user role: ${user?.role || 'unknown'}. Please ensure you're logged in as an admin.`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter project description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                max={formData.endDate || undefined}
              />
              {formData.endDate && formData.startDate && new Date(formData.startDate) > new Date(formData.endDate) && (
                <span className="error-message" style={{ display: 'block', marginTop: '4px' }}>
                  Start date cannot be after end date
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || undefined}
              />
              {dateError && (
                <span className="error-message" style={{ display: 'block', marginTop: '4px' }}>
                  {dateError}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget (PKR)</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter project location"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manager">Project Manager</label>
              {users.length > 0 ? (
                <select
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                >
                  <option value="">Select Manager (or leave empty for self)</option>
                  {users.filter(u => u.role === 'project_manager').map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="Manager ID (or leave empty for self)"
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="client">Client (Optional)</label>
              {users.length > 0 ? (
                <select
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                >
                  <option value="">Select Client</option>
                  {users.filter(u => u.role === 'client').map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Client user ID"
                />
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

