// Task Create/Edit Modal
// Person 1 - Frontend Developer

import React, { useState, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';

const TaskModal = ({ isOpen, onClose, task, projectId, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: projectId || '',
    assignedTo: [],
    priority: 'medium',
    deadline: '',
    status: 'pending',
    progress: 0
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch users for assignment
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.log('Users endpoint not available');
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      project: projectId || '',
      assignedTo: [],
      priority: 'medium',
      deadline: '',
      status: 'pending',
      progress: 0
    });
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchUsers();
      if (task) {
        // Handle both array and single value (for backward compatibility)
        let assignedToValue = [];
        if (task.assignedTo) {
          if (Array.isArray(task.assignedTo)) {
            assignedToValue = task.assignedTo.map(u => u._id || u);
          } else {
            assignedToValue = [task.assignedTo._id || task.assignedTo];
          }
        }
        
        setFormData({
          title: task.title || '',
          description: task.description || '',
          project: task.project?._id || task.project || projectId || '',
          assignedTo: assignedToValue,
          priority: task.priority || 'medium',
          deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
          status: task.status || 'pending',
          progress: task.progress || 0
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, task, projectId, fetchProjects, fetchUsers, resetForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value
    }));
  };

  const handleAssignedToChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      assignedTo: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Task title is required');
      return;
    }

    if (!formData.project) {
      showError('Project is required');
      return;
    }

    if (!formData.assignedTo || formData.assignedTo.length === 0) {
      showError('At least one user must be assigned');
      return;
    }

    if (!formData.deadline) {
      showError('Deadline is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // Remove progress field for admin users
      if (user?.role === 'admin') {
        delete submitData.progress;
      } else {
        submitData.progress = parseInt(formData.progress) || 0;
      }

      if (task) {
        await api.put(`/tasks/${task._id}`, submitData);
        showSuccess('Task updated successfully');
      } else {
        await api.post('/tasks', submitData);
        showSuccess('Task created successfully');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project">Project *</label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                disabled={!!projectId}
              >
                <option value="">Select Project</option>
                {projects.map(proj => (
                  <option key={proj._id} value={proj._id}>{proj.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Assign To * (Select multiple)</label>
              {users.length > 0 ? (
                <select
                  id="assignedTo"
                  name="assignedTo"
                  multiple
                  value={formData.assignedTo}
                  onChange={handleAssignedToChange}
                  required
                  style={{ minHeight: '100px', padding: '8px' }}
                  title="Hold Ctrl (Windows) or Cmd (Mac) to select multiple users"
                >
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={Array.isArray(formData.assignedTo) ? formData.assignedTo.join(',') : formData.assignedTo}
                  onChange={handleChange}
                  required
                  placeholder="User IDs (comma separated)"
                />
              )}
              {formData.assignedTo.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {formData.assignedTo.length} user(s) selected
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {task && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {user?.role !== 'admin' && (
                <div className="form-group">
                  <label htmlFor="progress">Progress (%)</label>
                  <input
                    type="number"
                    id="progress"
                    name="progress"
                    value={formData.progress}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

