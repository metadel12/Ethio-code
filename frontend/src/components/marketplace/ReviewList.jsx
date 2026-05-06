import React from "react";
import { RatingStars } from "./RatingStars";

const formatDistanceToNow = (date, options = {}) => {
  const addSuffix = options.addSuffix !== false;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  const interval = intervals.find((item) => seconds >= item.seconds) || intervals[intervals.length - 1];
  const value = Math.floor(seconds / interval.seconds) || 0;
  const formatted = `${value} ${interval.label}${value !== 1 ? "s" : ""}`;

  return addSuffix ? `${formatted} ago` : formatted;
};

export const ReviewList = ({ reviews, onReply }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 dark:border-dark-border pb-6 last:border-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-dark2 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {review.user_name?.[0] || "U"}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{review.user_name || "Anonymous"}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  {review.is_verified_purchase && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-300">{review.comment}</p>

          {review.response && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-dark2 rounded-lg">
              <div className="font-medium text-sm text-gray-900 dark:text-white">Creator Response</div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{review.response}</p>
            </div>
          )}

          {onReply && review.response && (
            <button
              onClick={() => onReply(review)}
              className="mt-2 text-sm text-eth-green hover:underline"
            >
              Reply to review
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;