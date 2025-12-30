// Expenses Page Component
// Frontend Developer - Person 1

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import ExpenseModal from '../../components/modals/ExpenseModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const canCreateExpense = user?.role === 'admin' || user?.role === 'project_manager';
  const canDeleteExpense = user?.role === 'admin' || user?.role === 'project_manager';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      showSuccess('Expense deleted successfully');
      fetchExpenses();
      setShowDeleteConfirm(false);
      setDeletingExpense(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleExpenseSuccess = () => {
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter(expense => {
    return expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (expense.category || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p className="page-subtitle">Track and manage project expenses</p>
        </div>
        <div className="header-actions">
          {canCreateExpense && (
            <button className="btn btn-primary" onClick={handleCreateExpense}>
              <FiPlus /> Record Expense
            </button>
          )}
          <div className="total-expenses">
            Total: <strong>PKR {totalAmount.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search expenses..."
        />
      </div>

      {loading ? (
        <div className="expenses-list">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <EmptyState
          type="expenses"
          message={searchQuery ? 'No expenses match your search criteria.' : undefined}
        />
      ) : (
        <div className="expenses-list">
          {filteredExpenses.map((expense) => (
            <div key={expense._id} className="expense-card">
              <div className="expense-header">
                <div>
                  <h3>{expense.description}</h3>
                  <p className="expense-meta">
                    {expense.project?.name || 'N/A'} | {expense.category} | {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="expense-header-right">
                  <div className="expense-amount">
                    PKR {expense.amount.toLocaleString()}
                  </div>
                  {(canCreateExpense || canDeleteExpense) && (
                    <div className="expense-actions">
                      {canCreateExpense && (
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditExpense(expense)}
                          title="Edit expense"
                        >
                          <FiEdit2 />
                        </button>
                      )}
                      {canDeleteExpense && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => {
                            setDeletingExpense(expense);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete expense"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="expense-footer">
                <span>Created by: {expense.createdBy?.name || 'N/A'}</span>
                {expense.paymentMethod && (
                  <span>Payment: {expense.paymentMethod.replace('_', ' ')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSuccess={handleExpenseSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingExpense(null);
        }}
        onConfirm={() => deletingExpense && handleDeleteExpense(deletingExpense._id)}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense record? This action cannot be undone.`}
        confirmText="Delete Expense"
        type="danger"
      />
    </div>
  );
};

export default Expenses;

