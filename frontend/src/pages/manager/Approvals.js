import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Approvals.css';

const Approvals = () => {
  const [expenses, setExpenses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      await api.put(`/expenses/${id}/approve`, { status });
      success(`Expense ${status}`);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update expense');
    }
  };

  const approveMaterial = async (id, approvalStatus) => {
    try {
      await api.put(`/materials/${id}/approve`, { approvalStatus });
      success(`Material ${approvalStatus}`);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update material');
    }
  };

  if (loading) return <div className="loading">Loading approvals...</div>;

  return (
    <div className="approvals">
      <h1>Pending Approvals</h1>

      <section>
        <h2>Expenses</h2>
        {expenses.length === 0 ? (
          <p>No pending expenses</p>
        ) : (
          <table className="approvals-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.project?.name || 'N/A'}</td>
                  <td>{exp.amount}</td>
                  <td>{exp.category}</td>
                  <td>{exp.description}</td>
                  <td>
                    <button onClick={() => approveExpense(exp._id, 'approved')}>Approve</button>
                    <button className="danger" onClick={() => approveExpense(exp._id, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Materials</h2>
        {materials.length === 0 ? (
          <p>No pending materials</p>
        ) : (
          <table className="approvals-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Project</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat._id}>
                  <td>{mat.name}</td>
                  <td>{mat.project?.name || 'N/A'}</td>
                  <td>{mat.quantity} {mat.unit}</td>
                  <td>{mat.status}</td>
                  <td>
                    <button onClick={() => approveMaterial(mat._id, 'approved')}>Approve</button>
                    <button className="danger" onClick={() => approveMaterial(mat._id, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Approvals;

