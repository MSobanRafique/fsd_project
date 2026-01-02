// Document Upload Modal
// Person 1 - Frontend Developer

import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Modal.css';

const DocumentModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [formData, setFormData] = useState({
    project: projectId || '',
    category: 'other',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [projects, setProjects] = useState([]);
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

  const resetForm = useCallback(() => {
    setFormData({
      project: projectId || '',
      category: 'other',
      description: ''
    });
    setFile(null);
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      resetForm();
    }
  }, [isOpen, fetchProjects, resetForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.project) {
      showError('Project is required');
      return;
    }

    if (!file) {
      showError('Please select a file to upload');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('project', formData.project);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);

      await api.post('/documents', uploadData);
      
      showSuccess('Document uploaded successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Document</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="blueprint">Blueprint</option>
                <option value="contract">Contract</option>
                <option value="invoice">Invoice</option>
                <option value="photo">Photo</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
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
              placeholder="Enter document description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">File *</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                required
                className="file-input"
              />
              <label htmlFor="file" className="file-label">
                <FiUpload className="upload-icon" />
                <span>{file ? file.name : 'Choose file or drag and drop'}</span>
                <small>Max size: 10MB</small>
              </label>
            </div>
            {file && (
              <div className="file-info">
                <span>{file.name}</span>
                <span>{(file.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;

