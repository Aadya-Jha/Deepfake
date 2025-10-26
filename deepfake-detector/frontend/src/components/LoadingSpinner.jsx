import React from 'react';

const LoadingSpinner = ({ status, filename }) => {
  const getStatusMessage = () => {
    if (!status) return 'Initializing...';
    
    switch (status.status) {
      case 'queued':
        return 'Video uploaded successfully, queued for processing...';
      case 'processing':
        if (status.progress < 30) return 'Extracting frames from video...';
        if (status.progress < 60) return 'Analyzing video properties...';
        if (status.progress < 90) return 'Running AI detection on frames...';
        return 'Finalizing results...';
      default:
        return 'Processing video...';
    }
  };

  const getProgressColor = () => {
    if (!status) return 'bg-cyan-500';
    
    if (status.progress < 30) return 'bg-blue-500';
    if (status.progress < 60) return 'bg-cyan-500';
    if (status.progress < 90) return 'bg-blue-600';
    return 'bg-emerald-500';
  };

  // Ensure progress only moves forward
  const [maxProgress, setMaxProgress] = React.useState(0);
  const currentProgress = status?.progress || 0;
  const progress = Math.max(maxProgress, currentProgress);
  
  React.useEffect(() => {
    if (currentProgress > maxProgress) {
      setMaxProgress(currentProgress);
    }
  }, [currentProgress, maxProgress]);

  return (
    <div className="text-center space-y-8 animate-fade-in">
      {/* Main Loading Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 border-8 border-gray-800 border-t-cyan-500 rounded-full animate-spin shadow-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-white">
          Analyzing Video
        </h3>
        <p className="text-lg text-gray-300">
          {getStatusMessage()}
        </p>
        {filename && (
          <p className="text-sm text-gray-400 font-medium">
            File: {filename}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner border border-gray-700">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor()} shadow-lg`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-semibold">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8">
          <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Processing Steps
          </h4>
          <div className="space-y-4">
            {/* Step 1: Frame Extraction */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 30 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 
                progress >= 10 ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 
                'bg-gray-700 text-gray-400 border border-gray-600'
              }`}>
                {progress >= 30 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">1</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Extract Frames</p>
                <p className="text-xs text-gray-400">Extracting key frames from video</p>
              </div>
            </div>

            {/* Step 2: Video Analysis */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 60 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 
                progress >= 30 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 
                'bg-gray-700 text-gray-400 border border-gray-600'
              }`}>
                {progress >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">2</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Analyze Properties</p>
                <p className="text-xs text-gray-400">Processing video metadata and properties</p>
              </div>
            </div>

            {/* Step 3: AI Detection */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 90 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 
                progress >= 60 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 
                'bg-gray-700 text-gray-400 border border-gray-600'
              }`}>
                {progress >= 90 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">3</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">AI Detection</p>
                <p className="text-xs text-gray-400">Running Vision Transformer analysis</p>
              </div>
            </div>

            {/* Step 4: Generate Results */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 
                progress >= 90 ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-400/30' : 
                'bg-gray-700 text-gray-400 border border-gray-600'
              }`}>
                {progress >= 100 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">4</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Generate Results</p>
                <p className="text-xs text-gray-400">Compiling final analysis report</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-sm text-gray-300 max-w-2xl mx-auto bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            This process typically takes 1-3 minutes depending on video length and complexity.
            Please keep this tab open while processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;