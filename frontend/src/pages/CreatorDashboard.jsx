import React, { useState, useEffect, useRef } from "react";
import { CreatorStats } from "../components/marketplace/CreatorStats";
import { EarningsChart } from "../components/marketplace/EarningsChart";
import { TemplateCard } from "../components/marketplace/TemplateCard";
import { templateService } from "../services/templateService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Modal } from "../components/common/Modal";

export const CreatorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTemplateForUpload, setSelectedTemplateForUpload] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    price: 0,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, templatesData] = await Promise.all([
        templateService.getCreatorDashboard(),
        templateService.getMyTemplates(),
      ]);
      setStats(statsData);
      setTemplates(templatesData);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const template = await templateService.createTemplate(newTemplate);
      setTemplates([template, ...templates]);
      setShowUploadModal(false);
      setNewTemplate({
        title: "",
        description: "",
        category: "",
        tags: [],
        price: 0,
      });
    } catch (e) {
      console.error("Failed to create template:", e);
    }
  };

  const handleUploadFiles = (templateId) => {
    setSelectedTemplateForUpload(templateId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTemplateForUpload) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await templateService.uploadFiles(selectedTemplateForUpload, formData);
      alert("Template file uploaded successfully.");
    } catch (e) {
      console.error("Failed to upload template file:", e);
      alert("File upload failed. Please try again.");
    } finally {
      setSelectedTemplateForUpload(null);
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      await templateService.submitForReview(id);
      loadData();
    } catch (e) {
      console.error("Failed to submit for review:", e);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creator Dashboard</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-eth-green text-white rounded-lg hover:bg-eth-green/90"
          >
            Upload New Template
          </button>
        </div>

        <div className="mb-8">
          <CreatorStats stats={stats} />
        </div>

        <div className="mb-8">
          <EarningsChart />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Templates</h2>

          {templates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start creating and sharing your templates</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-eth-green text-white rounded-lg"
              >
                Create Your First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="relative">
                  <TemplateCard template={template} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {template.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleUploadFiles(template.id)}
                          className="p-1.5 bg-white dark:bg-dark-surface rounded shadow hover:bg-gray-100 dark:hover:bg-dark2"
                          title="Upload Files"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSubmitForReview(template.id)}
                          className="p-1.5 bg-white dark:bg-dark-surface rounded shadow hover:bg-gray-100 dark:hover:bg-dark2"
                          title="Submit for Review"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v-10" />
                          </svg>
                        </button>
                      </>
                    )}
                    {template.status === "pending_review" && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                        Pending Review
                      </span>
                    )}
                    {template.status === "rejected" && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload New Template">
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Category</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={newTemplate.price}
                onChange={(e) => setNewTemplate({ ...newTemplate, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-eth-green text-white rounded-lg">
              Create Template
            </button>
          </div>
        </form>
      </Modal>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".zip,.rar,.tar,.gz"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CreatorDashboard;