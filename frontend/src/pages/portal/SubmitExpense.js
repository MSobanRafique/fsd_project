import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './SubmitExpense.css';

const SubmitExpense = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ project: '', category: 'labor', amount: '', description: '' });
  const { success, error } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch {
        error('Failed to load projects');
      }
    };
    fetchProjects();
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.amount || !form.description) {
      error('Project, amount, and description are required');
      return;
    }
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      success('Expense submitted (pending approval)');
      setForm({ project: '', category: 'labor', amount: '', description: '' });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit expense');
    }
  };

  return (
    <div className="submit-expense">
      <h1>Submit Expense / Work Update</h1>
      <form className="expense-form" onSubmit={handleSubmit}>
        <select
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}
          required
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
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
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitExpense;

