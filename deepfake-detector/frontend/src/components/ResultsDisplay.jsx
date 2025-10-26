import React from 'react';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const {
    overall_prediction,
    fake_percentage,
    total_frames_analyzed,
    fake_frames_count,
    real_frames_count,
    video_info
  } = results;

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (mb) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  // Get confidence level
  const getConfidenceLevel = (percentage) => {
    if (percentage >= 80 || percentage <= 20) return 'High';
    if (percentage >= 60 || percentage <= 40) return 'Medium';
    return 'Low';
  };

  // Get prediction color (updated for flipped logic)
  const getPredictionColor = () => {
    return overall_prediction === 'Fake' ? 'text-pink-400' : 'text-green-400';
  };

  // Get background color for main result (updated for flipped logic)
  const getBackgroundColor = () => {
    return overall_prediction === 'Fake' ? 'bg-pink-500/10 border-pink-500/30' : 'bg-green-500/10 border-green-500/30';
  };

  const confidenceLevel = getConfidenceLevel(fake_percentage);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Main Result Card */}
      <div className={`rounded-2xl border-2 p-10 text-center shadow-2xl ${getBackgroundColor()}`}>
        <div className="space-y-4">
          {/* Prediction Icon */}
          <div className="flex justify-center">
            {overall_prediction === 'Fake' ? (
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Main Result */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">
              Video appears to be{' '}
              <span className={getPredictionColor()}>
                {overall_prediction}
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              {fake_percentage.toFixed(1)}% of frames detected as deepfake content
            </p>
          </div>

          {/* Confidence Level */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-800/80 border-2 border-gray-700 shadow-md">
            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
              confidenceLevel === 'High' ? 'bg-green-500' :
              confidenceLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-white">{confidenceLevel} Confidence</span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Frames */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-10 0h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-400">Frames Analyzed</p>
              <p className="text-2xl font-bold text-white">{total_frames_analyzed}</p>
            </div>
          </div>
        </div>

        {/* Fake Frames */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-400">Fake Frames</p>
              <p className="text-2xl font-bold text-white">{fake_frames_count}</p>
            </div>
          </div>
        </div>

        {/* Real Frames */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-400">Real Frames</p>
              <p className="text-2xl font-bold text-white">{real_frames_count}</p>
            </div>
          </div>
        </div>

        {/* Fake Percentage */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-400">Fake Percentage</p>
              <p className="text-2xl font-bold text-white">{fake_percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Video Information
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-400">Duration</p>
              <p className="text-lg text-white">{formatDuration(video_info.duration)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Frame Rate</p>
              <p className="text-lg text-white">{video_info.fps.toFixed(1)} FPS</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Resolution</p>
              <p className="text-lg text-white">{video_info.width} × {video_info.height}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Frames</p>
              <p className="text-lg text-white">{video_info.frame_count.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">File Size</p>
              <p className="text-lg text-white">{formatFileSize(video_info.size_mb)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis Summary
        </h3>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Analyzed {total_frames_analyzed} frames using Vision Transformer AI model
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Detection confidence: {confidenceLevel} ({fake_percentage > 50 ? (100 - fake_percentage).toFixed(1) : fake_percentage.toFixed(1)}% margin)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Frame-by-frame analysis reveals {fake_frames_count} potentially manipulated frames out of {total_frames_analyzed} analyzed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;