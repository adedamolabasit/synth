import React from "react";
import { Music, Play, Pause, Video, Music2, Zap } from "lucide-react";
import { Button } from "../../../ui/Button";
import { Slider } from "../../../ui/Slider";

interface CanvasControlsProps {
  isConnected: boolean;
  audioName: string;
  canPlayAudio?: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  togglePlayback: () => void;
  progress: number;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  params: any;
  setParams: (updater: any) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDemoAudio: () => void;
  onRecordVideo?: () => void;
  isRecording?: boolean; // Add this line
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  isConnected,
  audioName,
  canPlayAudio,
  isPlaying,
  isLoading,
  togglePlayback,
  progress,
  currentTime,
  duration,
  handleSeek,
  params,
  setParams,
  canvasRef,
  onDemoAudio,
  onRecordVideo,
  isRecording,
}) => {
  if (!isConnected) return null;

  const handleToggleLyrics = () => {
    setParams((prev: any) => ({
      ...prev,
      showLyrics: !prev.showLyrics,
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setParams((prev: any) => ({
      ...prev,
      speed: speed,
    }));
  };

  return (
    <>
      {/* Main Control Bar */}
      <div className="absolute xl:bottom-20 bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-6">
            {/* Left Section: Audio Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {audioName && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl px-4 py-3 border border-slate-700/50 shadow-lg">
                    <Music
                      size={18}
                      className="text-emerald-400 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Now Playing
                      </p>
                      <p className="text-sm text-slate-200 font-semibold truncate max-w-56">
                        {audioName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center Section: Playback Controls */}
            <div className="flex items-center gap-4">
              {/* Demo Audio Button */}
              <button
                onClick={onDemoAudio}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/50 transition-all duration-200 group/tooltip relative"
                title="Demo Audio"
              >
                <Music2 size={18} className="text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">Demo</span>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  <span className="text-xs text-slate-300">
                    Load Demo Audio
                  </span>
                </div>
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={togglePlayback}
                disabled={!canPlayAudio || isLoading}
                className="relative group/play"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-70 group-hover/play:opacity-90 transition-opacity"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 border-2 border-white/20">
                  {isLoading ? (
                    <div className="w-8 h-8 border-3 border-white/80 border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={28} className="text-white" />
                  ) : (
                    <Play size={28} className="text-white ml-1" />
                  )}
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 opacity-0 group-hover/play:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <span className="text-xs text-slate-300">
                    {isPlaying ? "Pause" : "Play"} Audio & Visualizer
                  </span>
                </div>
              </button>

              {/* Record Video Button */}
              <button
                onClick={onRecordVideo}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 group/tooltip relative ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                    : "bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/50 text-slate-400 hover:text-slate-200"
                }`}
                title="Record Video"
              >
                <Video
                  size={18}
                  className={isRecording ? "text-red-400" : "text-red-400"}
                />
                <span className="text-xs font-medium">
                  {isRecording ? "Stop" : "Record"}
                </span>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  <span className="text-xs text-slate-300">
                    {isRecording ? "Stop Recording" : "Record Scene with Audio"}
                  </span>
                </div>
              </button>
            </div>

            {/* Right Section: Visualizer Controls */}
            <div className="flex items-center gap-6 min-w-0 flex-1 justify-end">
              {/* Lyrics Toggle */}
              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <button
                  onClick={handleToggleLyrics}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    params.showLyrics
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800/60 text-slate-400 hover:bg-slate-800/90 border border-slate-700/50"
                  }`}
                >
                  <Music2 size={16} />
                  <span className="text-sm font-medium">
                    Lyrics {params.showLyrics ? "ON" : "OFF"}
                  </span>
                </button>
                <div className="text-xs text-slate-500 text-center">
                  Toggle lyrics display
                </div>
              </div>

              {/* Speed Control */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium text-slate-300">
                      Speed
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                    {params.speed.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={params.speed}
                  onChange={handleSpeedChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Slow</span>
                  <span className="text-slate-400">
                    Adjust during recording
                  </span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl">
        <div className="relative">
          <div
            className="w-full h-2.5 bg-slate-800/80 backdrop-blur-sm rounded-full cursor-pointer overflow-hidden border border-slate-700/50 shadow-lg"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all duration-100"
              style={{
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-slate-400 mt-3 px-1">
            <span className="font-medium bg-slate-800/50 px-3 py-1 rounded-lg">
              {formatTime(currentTime)}
            </span>
            <span className="font-medium bg-slate-800/50 px-3 py-1 rounded-lg">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
