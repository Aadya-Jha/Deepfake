import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import VideoPlayer from "./VideoPlayer";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ results }) => {
  // Safe defaults to keep hooks unconditional
  const frame_results = results?.frame_results ?? [];
  const fake_percentage = results?.fake_percentage ?? 0;
  const total_frames_analyzed =
    results?.total_frames_analyzed ?? frame_results.length ?? 0;
  const fake_frames_count = results?.fake_frames_count ?? 0;
  const real_frames_count = results?.real_frames_count ?? 0;
  const video_info = results?.video_info ?? {
    fps: 0,
    width: 0,
    height: 0,
    duration: 0,
    frame_count: 0,
  };
  const video_url = results?.video_url ?? null;
  const overall_prediction = results?.overall_prediction ?? "Real";

  // Prepare data for timeline chart
  const timelineData = useMemo(() => {
    const labels = frame_results.map(
      (frame) => `${(frame.timestamp ?? 0).toFixed(1)}s`
    );
    const confidenceData = frame_results.map(
      (frame) => (frame.confidence ?? 0) * 100
    );
    const predictionData = frame_results.map((frame) =>
      frame.prediction === "Fake" ? 100 : 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Confidence Level (%)",
          data: confidenceData,
          borderColor: "rgb(6, 182, 212)",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Deepfake Detection",
          data: predictionData,
          borderColor: "rgb(236, 72, 153)",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          borderWidth: 2,
          fill: false,
          stepped: true,
        },
      ],
    };
  }, [frame_results]);

  // ✅ Safe, unconditional useMemo
  const confidenceDistribution = useMemo(() => {
    const ranges = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"];
    const counts = [0, 0, 0, 0, 0];

    frame_results.forEach((frame) => {
      const confidence = (frame.confidence ?? 0) * 100;
      if (confidence <= 20) counts[0]++;
      else if (confidence <= 40) counts[1]++;
      else if (confidence <= 60) counts[2]++;
      else if (confidence <= 80) counts[3]++;
      else counts[4]++;
    });

    return {
      labels: ranges,
      datasets: [
        {
          label: "Number of Frames",
          data: counts,
          backgroundColor: [
            "rgba(236, 72, 153, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(96, 165, 250, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(6, 182, 212, 0.8)",
          ],
          borderColor: [
            "rgb(236, 72, 153)",
            "rgb(245, 158, 11)",
            "rgb(96, 165, 250)",
            "rgb(34, 197, 94)",
            "rgb(6, 182, 212)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [frame_results]);

  // ✅ Another safe, unconditional useMemo
  const overallData = useMemo(
    () => ({
      labels: ["Real Frames", "Fake Frames"],
      datasets: [
        {
          data: [real_frames_count, fake_frames_count],
          backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(236, 72, 153, 0.8)"],
          borderColor: ["rgb(34, 197, 94)", "rgb(236, 72, 153)"],
          borderWidth: 2,
        },
      ],
    }),
    [real_frames_count, fake_frames_count]
  );

  // Chart options with dark theme
  const chartTextColor = "#E5E7EB"; // gray-200
  const chartGridColor = "#374151"; // gray-700
  
  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: "Frame-by-Frame Analysis Timeline",
        color: chartTextColor,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: chartGridColor,
        },
        title: {
          display: true,
          text: "Time (seconds)",
          color: chartTextColor,
        },
      },
      y: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: chartGridColor,
        },
        title: {
          display: true,
          text: "Confidence Level (%)",
          color: chartTextColor,
        },
        min: 0,
        max: 100,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: "Confidence Level Distribution",
        color: chartTextColor,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: chartGridColor,
        },
        title: {
          display: true,
          text: "Confidence Range",
          color: chartTextColor,
        },
      },
      y: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: chartGridColor,
        },
        title: {
          display: true,
          text: "Number of Frames",
          color: chartTextColor,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: "Overall Frame Classification",
        color: chartTextColor,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Calculate statistics safely
  const confidences = frame_results.map((f) => f?.confidence ?? 0);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : 0;
  const maxConfidence = confidences.length > 0 ? Math.max(...confidences) : 0;
  const minConfidence = confidences.length > 0 ? Math.min(...confidences) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Interactive Analysis Dashboard
        </h2>
        <p className="text-lg text-gray-300">
          Detailed frame-by-frame analysis and statistics
        </p>
      </div>

      {/* Video Player Section */}
      {video_url && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8 overflow-hidden">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Analyzed Video
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="space-y-4">
              <VideoPlayer
                videoUrl={video_url}
                className="w-full"
                fps={video_info.fps}
                overallPrediction={overall_prediction}
              />
              <div className="text-sm text-gray-400 text-center">
                Original uploaded video with detection results and FPS overlay
              </div>
            </div>

            {/* Video Information */}
            <div className="space-y-4">
              <div className="bg-gray-800/80 rounded-xl p-5 shadow-md border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detection Results
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Overall Classification:
                    </span>
                    <span
                      className={`font-semibold ${
                        overall_prediction === "Fake"
                          ? "text-pink-400"
                          : "text-green-400"
                      }`}
                    >
                      {overall_prediction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Confidence:</span>
                    <span className="font-semibold text-white">
                      {fake_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Frames Analyzed:</span>
                    <span className="font-semibold text-white">
                      {total_frames_analyzed}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/80 rounded-xl p-5 shadow-md border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Video Properties
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Frame Rate:</span>
                    <span className="font-semibold text-white">
                      {video_info.fps.toFixed?.(1) ??
                        Number(video_info.fps).toFixed(1)}{" "}
                      FPS
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Resolution:</span>
                    <span className="font-semibold text-white">
                      {video_info.width} × {video_info.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="font-semibold text-white">
                      {Math.floor(video_info.duration / 60)}:
                      {String(Math.floor(video_info.duration % 60)).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Frames:</span>
                    <span className="font-semibold text-white">
                      {Number(video_info.frame_count).toLocaleString?.() ??
                        String(video_info.frame_count)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/80 rounded-xl p-5 shadow-md border border-gray-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Frame Classification
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-pink-400">Fake Frames:</span>
                    <span className="font-semibold text-pink-400">
                      {fake_frames_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Real Frames:</span>
                    <span className="font-semibold text-green-400">
                      {real_frames_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="text-4xl font-bold text-cyan-400 mb-3">
            {(avgConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Average Confidence</div>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="text-4xl font-bold text-emerald-400 mb-3">
            {(maxConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Highest Confidence</div>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="text-4xl font-bold text-amber-400 mb-3">
            {(minConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Lowest Confidence</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Chart */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
          <div style={{ height: 320 }}>
            <Line data={timelineData} options={timelineOptions} />
          </div>
        </div>

        {/* Overall Classification Pie Chart */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
          <div style={{ height: 320 }}>
            <Doughnut data={overallData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Confidence Distribution Bar Chart */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
        <div style={{ height: 320 }}>
          <Bar data={confidenceDistribution} options={barOptions} />
        </div>
      </div>

      {/* Frame Details Table */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Frame-by-Frame Details
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Detailed analysis results for each analyzed frame
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Frame #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Probability
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              {frame_results.slice(0, 20).map((frame, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {(frame.frame_number ?? index) + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {(frame.timestamp ?? 0).toFixed(2)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        frame.prediction === "Fake"
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {frame.prediction ?? "Real"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {((frame.confidence ?? 0) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {((frame.probability ?? 0) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {frame_results.length > 20 && (
            <div className="px-6 py-4 bg-gray-900/50 text-center text-sm text-gray-400">
              Showing first 20 frames of {frame_results.length} total analyzed
              frames
            </div>
          )}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Technical Analysis Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">Detection Model</h4>
            <ul className="space-y-1">
              <li>• Vision Transformer (ViT) based architecture</li>
              <li>• Pre-trained on ImageNet with custom deepfake head</li>
              <li>• Input resolution: 224×224 pixels</li>
              <li>• Binary classification (Real vs Fake)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Analysis Process</h4>
            <ul className="space-y-1">
              <li>• Frame extraction from uploaded video</li>
              <li>• Preprocessing and normalization</li>
              <li>• Individual frame classification</li>
              <li>• Confidence scoring and aggregation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
