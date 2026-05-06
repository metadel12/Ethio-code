import React, { useRef, useState } from "react";

export const FileUploader = ({ onUpload, accept = "*", multiple = false, maxSizeMB = 10 }) => {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const file = multiple ? Array.from(files) : files[0];
    const fileToCheck = multiple ? file[0] : file;

    if (fileToCheck.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 100);

    try {
      await onUpload(file);
      setProgress(100);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors
        ${dragOver ? "border-eth-green bg-eth-green/5" : "border-gray-300 dark:border-dark-border"}
        ${uploading ? "pointer-events-none" : ""}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {uploading ? (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-dark2 rounded-full h-2">
            <div
              className="bg-eth-green h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {progress}%</p>
        </div>
      ) : (
        <div>
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            Drop files here or <span className="text-eth-green">click to upload</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Max size: {maxSizeMB}MB {accept !== "*" && `| ${accept}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;