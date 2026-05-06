import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TemplateGallery } from "../components/marketplace/TemplateGallery";
import { RatingStars } from "../components/marketplace/RatingStars";
import { PriceDisplay } from "../components/marketplace/PriceDisplay";
import { ReviewList } from "../components/marketplace/ReviewList";
import { ReviewForm } from "../components/marketplace/ReviewForm";
import { templateService } from "../services/templateService";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export const TemplateDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [template, setTemplate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [relatedTemplates, setRelatedTemplates] = useState([]);

  useEffect(() => {
    loadTemplate();
    loadReviews();
  }, [id]);

  const loadTemplate = async () => {
    try {
      const data = await templateService.getTemplate(id);
      setTemplate(data);
      loadRelated(data.category);
    } catch (e) {
      console.error("Failed to load template:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadRelated = async (category) => {
    try {
      const data = await templateService.searchTemplates({ category, per_page: 6 });
      setRelatedTemplates(data.items.filter((t) => t.id !== parseInt(id)));
    } catch (e) {
      console.error("Failed to load related templates:", e);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await templateService.getReviews(id);
      setReviews(data);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    // TODO: Integrate with payment service
  };

  const handleSubmitReview = async (data) => {
    try {
      await templateService.createReview(id, data);
      setShowReviewForm(false);
      loadReviews();
    } catch (e) {
      console.error("Failed to submit review:", e);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!template) return <div className="p-8">Template not found</div>;

  const images = template.preview_url ? [template.preview_url] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TemplateGallery images={images} title={template.title} />

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{template.description}</p>
            </div>

            {template.file_size && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">File Details</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Size: {(template.file_size / 1024 / 1024).toFixed(2)} MB</li>
                  <li>Type: {template.file_type?.toUpperCase()}</li>
                  <li>Version: {template.version}</li>
                </ul>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews ({reviews.length})</h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 text-sm bg-eth-green text-white rounded-lg hover:bg-eth-green/90"
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-6 p-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                  <ReviewForm onSubmit={handleSubmitReview} />
                </div>
              )}

              <ReviewList reviews={reviews} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-dark2 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-bold">
                      {template.creator_name?.[0] || "C"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{template.creator_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Creator</div>
                  </div>
                </div>

                <div className="mb-4">
                  <RatingStars rating={template.rating_average} count={template.rating_count} size="md" />
                </div>

                <PriceDisplay price={template.price} size="lg" />

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handlePurchase}
                    className="w-full py-3 bg-eth-green text-white rounded-lg font-semibold hover:bg-eth-green/90 transition-colors"
                  >
                    {template.price === 0 ? "Download Free" : "Purchase & Download"}
                  </button>

                  <button className="w-full py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark2 transition-colors">
                    Save to Collection
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Installation</h4>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Download the template file</li>
                    <li>Extract to your project directory</li>
                    <li>Follow the included documentation</li>
                    <li>Customize to your needs</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedTemplates.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Related Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTemplates.map((t) => (
                <div key={t.id} className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                  <h3 className="font-medium text-gray-900 dark:text-white">{t.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <RatingStars rating={t.rating_average} size="xs" />
                    <span className="text-eth-green font-medium">${t.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDetailPage;