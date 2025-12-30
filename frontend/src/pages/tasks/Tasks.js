// Tasks Page Component
// Frontend Developer - Person 1

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import TaskModal from '../../components/modals/TaskModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const canCreateTask = user?.role === 'admin' || user?.role === 'project_manager';
  const canDeleteTask = user?.role === 'admin' || user?.role === 'project_manager';
  // Site workers can edit tasks assigned to them (backend allows this)
  const canEditTask = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'site_worker';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      showSuccess('Task deleted successfully');
      fetchTasks();
      setShowDeleteConfirm(false);
      setDeletingTask(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTaskSuccess = () => {
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#64748b',
      in_progress: '#2563eb',
      completed: '#10b981',
      on_hold: '#f59e0b'
    };
    return colors[status] || '#64748b';
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">Manage and track project tasks</p>
        </div>
        {canCreateTask && (
          <button className="btn btn-primary" onClick={handleCreateTask}>
            <FiPlus /> Create Task
          </button>
        )}
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks..."
        />
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="tasks-list">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          type="tasks"
          message={searchQuery || statusFilter !== 'all' 
            ? 'No tasks match your search criteria.'
            : undefined}
        />
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-header-actions">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  {(canEditTask || canDeleteTask) && (
                    <div className="task-actions">
                      {canEditTask && (
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditTask(task)}
                          title="Edit task"
                        >
                          <FiEdit2 />
                        </button>
                      )}
                      {canDeleteTask && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => {
                            setDeletingTask(task);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete task"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="task-description">{task.description || 'No description'}</p>
              <div className="task-info">
                <span><strong>Project:</strong> {task.project?.name || 'N/A'}</span>
                <span><strong>Assigned to:</strong> {task.assignedTo?.name || 'N/A'}</span>
                <span><strong>Progress:</strong> {task.progress}%</span>
                <span><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSuccess={handleTaskSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingTask(null);
        }}
        onConfirm={() => deletingTask && handleDeleteTask(deletingTask._id)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        type="danger"
      />
    </div>
  );
};

export default Tasks;

