// Toast Notification Component
// Professional toast notification system
// Person 1 - Frontend Developer

import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    warning: <FiAlertCircle />,
    info: <FiInfo />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <FiX />
      </button>
    </div>
  );
};

export default Toast;

