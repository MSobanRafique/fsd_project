// Material Create/Edit Modal
// Person 1 - Frontend Developer

import React, { useState, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Modal.css';

const MaterialModal = ({ isOpen, onClose, material, projectId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: '',
    unit: 'pieces',
    project: projectId || '',
    costPerUnit: '',
    minThreshold: '10',
    supplierName: '',
    supplierContact: ''
  });
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
      name: '',
      category: 'other',
      quantity: '',
      unit: 'pieces',
      project: projectId || '',
      costPerUnit: '',
      minThreshold: '10',
      supplierName: '',
      supplierContact: ''
    });
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (material) {
        setFormData({
          name: material.name || '',
          category: material.category || 'other',
          quantity: material.quantity || '',
          unit: material.unit || 'pieces',
          project: material.project?._id || material.project || projectId || '',
          costPerUnit: material.costPerUnit || '',
          minThreshold: material.minThreshold || '10',
          supplierName: material.supplier?.name || '',
          supplierContact: material.supplier?.contact || ''
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, material, projectId, fetchProjects, resetForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError('Material name is required');
      return;
    }

    if (!formData.project) {
      showError('Project is required');
      return;
    }

    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      showError('Valid quantity is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        project: formData.project,
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : 0,
        minThreshold: parseFloat(formData.minThreshold) || 10,
        supplier: {
          name: formData.supplierName.trim(),
          contact: formData.supplierContact.trim()
        }
      };

      if (material) {
        await api.put(`/materials/${material._id}`, submitData);
        showSuccess('Material updated successfully');
      } else {
        await api.post('/materials', submitData);
        showSuccess('Material added successfully');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{material ? 'Edit Material' : 'Add Material'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Material Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter material name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="cement">Cement</option>
                <option value="steel">Steel</option>
                <option value="brick">Brick</option>
                <option value="wood">Wood</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="paint">Paint</option>
                <option value="other">Other</option>
              </select>
            </div>

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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="bags">Bags</option>
                <option value="pieces">Pieces</option>
                <option value="meters">Meters</option>
                <option value="liters">Liters</option>
                <option value="sqft">Square Feet (sqft)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costPerUnit">Cost Per Unit (PKR)</label>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minThreshold">Minimum Threshold</label>
              <input
                type="number"
                id="minThreshold"
                name="minThreshold"
                value={formData.minThreshold}
                onChange={handleChange}
                min="0"
                placeholder="10"
              />
              <small>Alert when quantity drops below this</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supplierName">Supplier Name</label>
              <input
                type="text"
                id="supplierName"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplierContact">Supplier Contact</label>
              <input
                type="text"
                id="supplierContact"
                name="supplierContact"
                value={formData.supplierContact}
                onChange={handleChange}
                placeholder="Phone or email"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialModal;

