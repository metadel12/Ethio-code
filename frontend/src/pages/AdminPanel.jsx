import React, { useState, useEffect } from "react";
import { templateService } from "../services/templateService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Modal } from "../components/common/Modal";

export const AdminPanel = () => {
  const [pendingTemplates, setPendingTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadPendingTemplates();
  }, []);

  const loadPendingTemplates = async () => {
    try {
      const data = await templateService.getPendingTemplates();
      setPendingTemplates(data);
    } catch (e) {
      console.error("Failed to load pending templates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await templateService.approveTemplate(id);
      setPendingTemplates(pendingTemplates.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to approve template:", e);
    }
  };

  const handleReject = async () => {
    if (!selectedTemplate) return;
    try {
      await templateService.rejectTemplate(selectedTemplate.id, rejectionReason);
      setPendingTemplates(pendingTemplates.filter((t) => t.id !== selectedTemplate.id));
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (e) {
      console.error("Failed to reject template:", e);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-dark-border">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Pending Approvals</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingTemplates.length}</p>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-dark-border">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">1,234</p>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-dark-border">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Templates</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">567</p>
          </div>
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-dark-border">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$12,345</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Templates</h2>

          {pendingTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
              <p className="text-gray-600 dark:text-gray-400">No pending templates to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-dark-surface p-6 rounded-lg border border-gray-200 dark:border-dark-border"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{template.description}</p>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Category: {template.category}</span>
                        <span>Price: ${template.price}</span>
                        <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                      </div>

                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {template.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-dark2 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleApprove(template.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowRejectModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Template">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Please provide a reason for rejecting "{selectedTemplate?.title}":
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg"
            rows={3}
            placeholder="Template does not meet quality standards..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
            >
              Reject Template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;