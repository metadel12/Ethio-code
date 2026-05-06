import React, { useState } from "react";

export const ImageCropper = ({ image, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });

  const handleCrop = () => {
    onCrop && onCrop(crop);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 dark:bg-dark2 rounded-lg overflow-hidden" style={{ aspectRatio: 16 / 9 }}>
        {image ? (
          <img src={image} alt="Crop preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image selected
          </div>
        )}
        <div
          className="absolute border-2 border-eth-green bg-black/20 cursor-move"
          style={{
            left: crop.x,
            top: crop.y,
            width: crop.width,
            height: crop.height,
          }}
        >
          <div className="absolute bottom-right w-4 h-4 bg-eth-green rounded-full cursor-se-resize" />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCrop}
          className="px-4 py-2 bg-eth-green text-white rounded-lg hover:bg-eth-green/90 transition-colors"
        >
          Apply Crop
        </button>
        <button
          onClick={() => setCrop({ x: 0, y: 0, width: 200, height: 200 })}
          className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark2 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;