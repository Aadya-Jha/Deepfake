import React, { useState, useCallback } from "react";
import VideoUploader from "./components/VideoUploader";
import ResultsDisplay from "./components/ResultsDisplay";
import Dashboard from "./components/Dashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import { uploadVideo, checkJobStatus, getJobResults } from "./services/api";
import "./styles/App.css";

function App() {
  const [currentView, setCurrentView] = useState("upload"); // 'upload', 'processing', 'results'
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Handle video upload
  const handleVideoUpload = useCallback(async (file) => {
    try {
      setError(null);
      setCurrentView("processing");

      // Upload video
      const response = await uploadVideo(file);
      const newJobId = response.job_id;
      setJobId(newJobId);

      // Start polling for status
      pollJobStatus(newJobId);
    } catch (err) {
      setError(err.message || "Upload failed");
      setCurrentView("upload");
    }
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const status = await checkJobStatus(jobId);
      setJobStatus(status);

      if (status.status === "completed") {
        // Get results
        const resultsData = await getJobResults(jobId);
        setResults(resultsData.results);
        setCurrentView("results");
      } else if (status.status === "error") {
        setError(status.error || "Processing failed");
        setCurrentView("upload");
      } else {
        // Continue polling
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      setError(err.message || "Status check failed");
      setCurrentView("upload");
    }
  }, []);

  // Reset to upload view
  const handleReset = useCallback(() => {
    setCurrentView("upload");
    setJobId(null);
    setJobStatus(null);
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-md shadow-xl border-b border-cyan-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Detectify
                </h1>
                <p className="text-xs text-gray-400 font-medium">Deepfake Detection AI</p>
              </div>
            </div>
            {currentView !== "upload" && (
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 hover:-translate-y-0.5 font-semibold"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-l-4 border-red-500 rounded-xl shadow-lg p-4 animate-slide-down border border-red-500/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-400">Error</h3>
                <div className="mt-1 text-sm text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload View */}
        {currentView === "upload" && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Upload Video for Deepfake Analysis
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Upload a video file to analyze whether it contains deepfake
                content. Our AI model will examine each frame and provide
                detailed results.
              </p>
            </div>

            <VideoUploader onUpload={handleVideoUpload} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="group text-center p-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Video Analysis
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced frame-by-frame analysis using Vision Transformer
                  technology
                </p>
              </div>

              <div className="group text-center p-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Detailed Results
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Get confidence scores, frame analysis, and interactive
                  visualizations
                </p>
              </div>

              <div className="group text-center p-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Fast Processing
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Quick analysis with real-time progress updates and efficient
                  processing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing View */}
        {currentView === "processing" && (
          <div className="max-w-2xl mx-auto">
            <LoadingSpinner status={jobStatus} filename={jobStatus?.filename} />
          </div>
        )}

        {/* Results View */}
        {currentView === "results" && results && (
          <div className="space-y-8">
            <ResultsDisplay results={results} />
            <Dashboard results={results} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
