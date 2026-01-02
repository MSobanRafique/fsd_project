import React, { useEffect, useState, useCallback } from 'react';
import { FiDollarSign, FiPackage, FiCheck, FiX, FiClock, FiFolder, FiTag } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import './Approvals.css';

const Approvals = () => {
  const [expenses, setExpenses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [expRes, matRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/materials')
      ]);
      setExpenses(expRes.data.filter(e => e.status === 'pending'));
      setMaterials(matRes.data.filter(m => m.approvalStatus === 'pending'));
    } catch (err) {
      error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const approveExpense = async (id, status) => {
    setProcessing({ ...processing, [`exp-${id}`]: true });
    try {
      await api.put(`/expenses/${id}/approve`, { status });
      success(`Expense ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      // Optimistically remove from list
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update expense');
      fetchData(); // Refresh on error
    } finally {
      setProcessing({ ...processing, [`exp-${id}`]: false });
    }
  };

  const approveMaterial = async (id, approvalStatus) => {
    setProcessing({ ...processing, [`mat-${id}`]: true });
    try {
      await api.put(`/materials/${id}/approve`, { approvalStatus });
      success(`Material ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      // Optimistically remove from list
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update material');
      fetchData(); // Refresh on error
    } finally {
      setProcessing({ ...processing, [`mat-${id}`]: false });
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatCategory = (category) => {
    if (!category) return 'N/A';
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const totalPending = expenses.length + materials.length;

  if (loading) {
    return (
      <div className="approvals">
        <div className="approvals-header">
          <h1>Pending Approvals</h1>
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="approvals">
      <div className="approvals-header">
        <div>
          <h1>Pending Approvals</h1>
          <p className="approvals-subtitle">
            Review and approve pending expenses and material requests
          </p>
        </div>
        {totalPending > 0 && (
          <div className="approvals-badge">
            <FiClock /> {totalPending} Pending
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <section className="approvals-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <FiDollarSign className="section-icon" />
            <h2>Expenses</h2>
            {expenses.length > 0 && (
              <span className="section-count">{expenses.length}</span>
            )}
          </div>
        </div>

        {expenses.length === 0 ? (
          <EmptyState 
            type="expenses" 
            title="No Pending Expenses"
            message="All expenses have been reviewed. New pending expenses will appear here."
          />
        ) : (
          <div className="approvals-table-wrapper">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th><FiFolder /> Project</th>
                  <th><FiDollarSign /> Amount</th>
                  <th><FiTag /> Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td className="project-cell">
                      <span className="project-name">{exp.project?.name || 'N/A'}</span>
                    </td>
                    <td className="amount-cell">
                      <span className="amount-value">{formatCurrency(exp.amount)}</span>
                    </td>
                    <td>
                      <span className="category-badge">{formatCategory(exp.category)}</span>
                    </td>
                    <td className="description-cell">
                      {exp.description || 'No description'}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-approve"
                        onClick={() => approveExpense(exp._id, 'approved')}
                        disabled={processing[`exp-${exp._id}`]}
                      >
                        <FiCheck /> {processing[`exp-${exp._id}`] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => approveExpense(exp._id, 'rejected')}
                        disabled={processing[`exp-${exp._id}`]}
                      >
                        <FiX /> {processing[`exp-${exp._id}`] ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Materials Section */}
      <section className="approvals-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <FiPackage className="section-icon" />
            <h2>Materials</h2>
            {materials.length > 0 && (
              <span className="section-count">{materials.length}</span>
            )}
          </div>
        </div>

        {materials.length === 0 ? (
          <EmptyState 
            type="materials" 
            title="No Pending Materials"
            message="All material requests have been reviewed. New pending requests will appear here."
          />
        ) : (
          <div className="approvals-table-wrapper">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th><FiFolder /> Project</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat._id}>
                    <td className="material-name-cell">
                      <strong>{mat.name}</strong>
                    </td>
                    <td className="project-cell">
                      <span className="project-name">{mat.project?.name || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="quantity-badge">
                        {mat.quantity} {mat.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${mat.status}`}>
                        {formatStatus(mat.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-approve"
                        onClick={() => approveMaterial(mat._id, 'approved')}
                        disabled={processing[`mat-${mat._id}`]}
                      >
                        <FiCheck /> {processing[`mat-${mat._id}`] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => approveMaterial(mat._id, 'rejected')}
                        disabled={processing[`mat-${mat._id}`]}
                      >
                        <FiX /> {processing[`mat-${mat._id}`] ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Approvals;

