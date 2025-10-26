import React, { useState, useCallback, useRef } from 'react';

const VideoUploader = ({ onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const supportedFormats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  // Validate file
  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error('File size must be less than 100MB');
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
    }

    return true;
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
    } catch (error) {
      alert(error.message);
    }
  }, [validateFile]);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle upload
  const handleUpload = useCallback(() => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  }, [selectedFile, onUpload]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Drag and Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-cyan-400 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 scale-105 shadow-xl shadow-cyan-500/20'
            : 'border-gray-700 hover:border-cyan-500 hover:bg-gray-800/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center shadow-lg border border-cyan-500/30">
              <svg
                className="w-10 h-10 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-white mb-2">
                Drop your video here
              </p>
              <p className="text-gray-300 mb-4">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-2 hover:decoration-cyan-300 transition-all"
                >
                  browse files
                </button>
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">MP4</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">AVI</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">MOV</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">MKV</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">WMV</span>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Maximum file size: <span className="font-semibold text-white">100MB</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <div>
              <p className="text-xl font-bold text-white mb-2">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-400 mb-6 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Size: {formatFileSize(selectedFile.size)}
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-300 bg-gray-800 border-2 border-gray-700 rounded-xl hover:bg-gray-700 transition-all duration-200 hover:border-gray-600"
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  className="px-8 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 border border-transparent rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                >
                  Analyze Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-8 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How it works
        </h3>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">
              1
            </span>
            <p className="pt-0.5">Upload your video file (max 100MB)</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">
              2
            </span>
            <p className="pt-0.5">Our AI extracts and analyzes key frames from the video</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">
              3
            </span>
            <p className="pt-0.5">Get detailed results with confidence scores and visualizations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;