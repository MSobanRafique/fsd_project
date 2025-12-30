// Profile Page Component
// Frontend Developer - Person 1

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiSave, FiX, FiTrash2, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, deleteAccount, logout, changePassword } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  React.useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
    }
  }, [user]);

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(user.name || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(user.name || '');
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      showError('Name cannot be empty');
      return;
    }

    setLoading(true);

    const result = await updateProfile({ name: editedName.trim() });

    if (result.success) {
      setIsEditing(false);
      showSuccess('Profile updated successfully');
    } else {
      showError(result.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);

    const result = await deleteAccount();

    if (result.success) {
      showSuccess('Account deleted successfully');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1000);
    } else {
      showError(result.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    }

    setDeleteLoading(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      showSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      setPasswordErrors({});
    } else {
      showError(result.message || 'Failed to change password');
    }

    setPasswordLoading(false);
  };

  const handlePasswordCancel = () => {
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-content">
            {isEditing ? (
              <div className="edit-name-container">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-name-input"
                  autoFocus
                />
                <div className="edit-actions">
                  <button
                    onClick={handleSave}
                    className="btn-icon btn-save"
                    disabled={loading}
                    title="Save"
                  >
                    <FiSave />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-icon btn-cancel"
                    disabled={loading}
                    title="Cancel"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <div className="name-display">
                <h2>{user.name}</h2>
                <button
                  onClick={handleEdit}
                  className="btn-icon btn-edit"
                  title="Edit name"
                >
                  <FiEdit2 />
                </button>
              </div>
            )}
            <p className="profile-role">{user.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-section">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          {user.phone && (
            <div className="info-section">
              <label>Phone</label>
              <p>{user.phone}</p>
            </div>
          )}
          {user.address && (
            <div className="info-section">
              <label>Address</label>
              <p>{user.address}</p>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3><FiLock /> Change Password</h3>
            {!showPasswordChange && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordChange && (
            <form onSubmit={handlePasswordSubmit} className="password-change-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.currentPassword ? 'input-error' : ''}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <span className="error-message">{passwordErrors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.newPassword ? 'input-error' : ''}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <span className="error-message">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.confirmPassword ? 'input-error' : ''}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="error-message">{passwordErrors.confirmPassword}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePasswordCancel}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-actions">
          <button
            onClick={handleDeleteClick}
            className="btn-delete-account"
            disabled={deleteLoading}
          >
            <FiTrash2 />
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed."
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Profile;

