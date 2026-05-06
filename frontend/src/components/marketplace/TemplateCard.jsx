import React from "react";
import { Link } from "react-router-dom";
import { RatingStars } from "./RatingStars";
import { PriceDisplay } from "./PriceDisplay";

export const TemplateCard = ({ template, onSave, isSaved }) => {
  const {
    id,
    title,
    description,
    category,
    tags,
    price,
    preview_url,
    download_count,
    rating_average,
    rating_count,
    creator_name,
    is_featured,
    is_premium,
  } = template;

  const isFree = price === 0 || price === null || price === undefined;

  return (
    <div className="group bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {is_featured && (
          <span className="bg-gradient-to-r from-eth-green to-eth-gold text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
            Featured
          </span>
        )}
        {is_premium && (
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Premium
          </span>
        )}
      </div>

      <div className="relative aspect-video bg-gray-100 dark:bg-dark2 overflow-hidden">
        {preview_url ? (
          <img
            src={preview_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark2 dark:to-dark3 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isFree && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
            FREE
          </div>
        )}
        <button
          onClick={() => onSave && onSave(id)}
          className={`absolute bottom-3 right-3 p-2 rounded-full ${isSaved ? "bg-red-500 text-white" : "bg-white/90 dark:bg-dark/90 text-gray-700 dark:text-gray-300"
            } hover:bg-red-500 hover:text-white transition-colors shadow-lg backdrop-blur-sm`}
        >
          <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2.5 py-1 bg-eth-green/10 text-eth-green dark:bg-eth-green/20 rounded-full">
            {category || 'Uncategorized'}
          </span>
          <PriceDisplay price={price} size="sm" />
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 text-base">
          <Link to={`/templates/${id}`} className="hover:text-eth-green transition-colors">
            {title}
          </Link>
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
          {description}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-dark3 text-gray-600 dark:text-gray-400 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark3">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="font-medium">{download_count || 0}</span>
            </span>
            <div className="flex items-center gap-1">
              <RatingStars rating={rating_average || 0} count={rating_count || 0} size="xs" showCount={false} />
              {rating_count > 0 && <span className="text-gray-400">({rating_count})</span>}
            </div>
          </div>
          {creator_name && (
            <span className="text-xs text-gray-400 truncate max-w-[100px]" title={creator_name}>
              by {creator_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;