// Documents Page Component
// Person 1 - Frontend Developer

import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import DocumentModal from '../../components/modals/DocumentModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const canUploadDocument = user?.role === 'admin' || user?.role === 'project_manager';
  const canDeleteDocument = user?.role === 'admin' || user?.role === 'project_manager';

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Check if response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid file response');
      }
      
      // Create blob URL and download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showSuccess('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.status === 404 ? 'File not found on server' : 'Failed to download document');
      showError(errorMessage);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`/documents/${documentId}`);
      showSuccess('Document deleted successfully');
      fetchDocuments();
      setShowDeleteConfirm(false);
      setDeletingDocument(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDocumentSuccess = () => {
    fetchDocuments();
  };

  const filteredDocuments = documents.filter(doc => {
    return doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="page-subtitle">Manage project documents and files</p>
        </div>
        {canUploadDocument && (
          <button className="btn btn-primary" onClick={() => setShowDocumentModal(true)}>
            <FiPlus /> Upload Document
          </button>
        )}
      </div>

      <div className="page-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search documents..."
        />
      </div>

      {loading ? (
        <div className="documents-list">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          type="documents"
          message={searchQuery ? 'No documents match your search criteria.' : undefined}
        />
      ) : (
        <div className="documents-list">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="document-card">
              <div className="document-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div className="document-info">
                <h3>{doc.originalName}</h3>
                <p className="document-meta">
                  {doc.project?.name || 'N/A'} | {doc.category} | 
                  {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'Size unknown'}
                </p>
                <p className="document-uploaded">
                  Uploaded by {doc.uploadedBy?.name || 'N/A'} on {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="document-actions">
                <button 
                  className="btn-download"
                  onClick={() => handleDownload(doc._id, doc.originalName)}
                  title="Download"
                >
                  <FiDownload /> Download
                </button>
                {canDeleteDocument && (
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => {
                      setDeletingDocument(doc);
                      setShowDeleteConfirm(true);
                    }}
                    title="Delete document"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSuccess={handleDocumentSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingDocument(null);
        }}
        onConfirm={() => deletingDocument && handleDeleteDocument(deletingDocument._id)}
        title="Delete Document"
        message={`Are you sure you want to delete "${deletingDocument?.originalName}"? This action cannot be undone.`}
        confirmText="Delete Document"
        type="danger"
      />
    </div>
  );
};

export default Documents;

