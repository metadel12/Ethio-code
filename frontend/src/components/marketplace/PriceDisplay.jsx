import React from "react";

export const PriceDisplay = ({ price, originalPrice, size = "md" }) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  if (price === 0) {
    return (
      <span className={`font-bold text-green-500 ${sizeClasses[size]}`}>
        Free
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold text-gray-900 dark:text-white ${sizeClasses[size]}`}>
        ${price.toFixed(2)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-gray-500 line-through text-sm">
          ${originalPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;