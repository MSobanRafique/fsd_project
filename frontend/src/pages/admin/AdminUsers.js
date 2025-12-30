import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'project_manager' });
  const { success, error } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/admin/users', form);
      success('User created');
      setForm({ name: '', email: '', password: '', role: 'project_manager' });
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/auth/admin/users/${id}`);
      success('User deleted');
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <h1>User Management</h1>
        <p>Create or remove managers, workers, and clients.</p>
      </div>

      <form className="admin-user-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        >
          <option value="project_manager">Project Manager</option>
          <option value="site_worker">Worker</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create User</button>
      </form>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;

