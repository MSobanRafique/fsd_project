// Empty State Component
// Professional empty state with helpful messages
// Person 1 - Frontend Developer

import React from 'react';
import { FiInbox, FiFolder, FiFile, FiPackage, FiDollarSign, FiCheckSquare } from 'react-icons/fi';
import './EmptyState.css';

const EmptyState = ({ 
  type = 'default', 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon: CustomIcon 
}) => {
  const icons = {
    default: <FiInbox />,
    projects: <FiFolder />,
    tasks: <FiCheckSquare />,
    documents: <FiFile />,
    materials: <FiPackage />,
    expenses: <FiDollarSign />
  };

  const defaultMessages = {
    projects: {
      title: 'No Projects Yet',
      message: 'Get started by creating your first project. Click the button below to begin.'
    },
    tasks: {
      title: 'No Tasks Found',
      message: 'There are no tasks assigned yet. Tasks will appear here once created.'
    },
    documents: {
      title: 'No Documents',
      message: 'No documents have been uploaded yet. Upload your first document to get started.'
    },
    materials: {
      title: 'No Materials',
      message: 'No materials have been added yet. Add materials to track your inventory.'
    },
    expenses: {
      title: 'No Expenses',
      message: 'No expenses have been recorded yet. Start tracking expenses for your projects.'
    }
  };

  const content = defaultMessages[type] || { title: title || 'No Data', message: message || 'There is no data to display.' };
  const IconComponent = CustomIcon || icons[type] || icons.default;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {IconComponent}
      </div>
      <h3 className="empty-state-title">{content.title}</h3>
      <p className="empty-state-message">{content.message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

