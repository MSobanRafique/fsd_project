// Expense Create/Edit Modal
// Person 1 - Frontend Developer

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Modal.css';

const ExpenseModal = ({ isOpen, onClose, expense, projectId, onSuccess }) => {
  const [formData, setFormData] = useState({
    project: projectId || '',
    category: 'other',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (expense) {
        setFormData({
          project: expense.project?._id || expense.project || projectId || '',
          category: expense.category || 'other',
          amount: expense.amount || '',
          description: expense.description || '',
          date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          paymentMethod: expense.paymentMethod || 'cash'
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, expense, projectId]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      project: projectId || '',
      category: 'other',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.project) {
      showError('Project is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('Valid amount is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        project: formData.project,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        paymentMethod: formData.paymentMethod
      };

      if (expense) {
        await api.put(`/expenses/${expense._id}`, submitData);
        showSuccess('Expense updated successfully');
      } else {
        await api.post('/expenses', submitData);
        showSuccess('Expense recorded successfully');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Record Expense'}</h2>
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
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="labor">Labor</option>
                <option value="materials">Materials</option>
                <option value="equipment">Equipment</option>
                <option value="transportation">Transportation</option>
                <option value="utilities">Utilities</option>
                <option value="permits">Permits</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Enter expense description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount (PKR) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update Expense' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;

