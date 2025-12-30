// Materials Page Component
// Person 1 - Frontend Developer

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import MaterialModal from '../../components/modals/MaterialModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Materials.css';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deletingMaterial, setDeletingMaterial] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const canCreateMaterial = user?.role === 'admin' || user?.role === 'project_manager';
  const canDeleteMaterial = user?.role === 'admin' || user?.role === 'project_manager';
  // Site workers can edit materials in projects where they have tasks (backend allows this)
  const canEditMaterial = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'site_worker';

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      showError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = () => {
    setEditingMaterial(null);
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowMaterialModal(true);
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await api.delete(`/materials/${materialId}`);
      showSuccess('Material deleted successfully');
      fetchMaterials();
      setShowDeleteConfirm(false);
      setDeletingMaterial(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleMaterialSuccess = () => {
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(material => {
    return material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (material.category || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusColor = (status) => {
    const colors = {
      available: '#10b981',
      low_stock: '#f59e0b',
      out_of_stock: '#ef4444',
      ordered: '#2563eb'
    };
    return colors[status] || '#64748b';
  };

  return (
    <div className="materials-page">
      <div className="page-header">
        <div>
          <h1>Materials</h1>
          <p className="page-subtitle">Manage project materials and inventory</p>
        </div>
        {canCreateMaterial && (
          <button className="btn btn-primary" onClick={handleCreateMaterial}>
            <FiPlus /> Add Material
          </button>
        )}
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search materials..."
        />
      </div>

      {loading ? (
        <div className="materials-grid">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          type="materials"
          message={searchQuery ? 'No materials match your search criteria.' : undefined}
        />
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-header">
                <h3>{material.name}</h3>
                <div className="material-header-actions">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(material.status) + '20', color: getStatusColor(material.status) }}
                  >
                    {material.status.replace('_', ' ')}
                  </span>
                  {(canEditMaterial || canDeleteMaterial) && (
                    <div className="material-actions">
                      {canEditMaterial && (
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditMaterial(material)}
                          title="Edit material"
                        >
                          <FiEdit2 />
                        </button>
                      )}
                      {canDeleteMaterial && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => {
                            setDeletingMaterial(material);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete material"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="material-info">
                <div className="info-row">
                  <span><strong>Category:</strong> {material.category}</span>
                  <span><strong>Quantity:</strong> {material.quantity} {material.unit}</span>
                </div>
                <div className="info-row">
                  <span><strong>Project:</strong> {material.project?.name || 'N/A'}</span>
                  {material.supplier?.name && (
                    <span><strong>Supplier:</strong> {material.supplier.name}</span>
                  )}
                </div>
                {material.costPerUnit > 0 && (
                  <div className="info-row">
                    <span><strong>Cost per unit:</strong> PKR {material.costPerUnit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <MaterialModal
        isOpen={showMaterialModal}
        onClose={() => {
          setShowMaterialModal(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
        onSuccess={handleMaterialSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingMaterial(null);
        }}
        onConfirm={() => deletingMaterial && handleDeleteMaterial(deletingMaterial._id)}
        title="Delete Material"
        message={`Are you sure you want to delete "${deletingMaterial?.name}"? This action cannot be undone.`}
        confirmText="Delete Material"
        type="danger"
      />
    </div>
  );
};

export default Materials;

