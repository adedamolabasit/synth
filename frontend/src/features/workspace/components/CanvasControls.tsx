import React, { useState } from "react";
import {
  Music,
  Play,
  Pause,
  Video,
  Music2,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Slider } from "../../../components/ui/Slider";
import { formatTime } from "../utils";
import {
  categories,
  defaultCameraParams,
  sliderConfigs,
  defaultParams,
} from "../config/indes";

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
  onRecordVideo?: () => void;
  isRecording?: boolean;
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
  onRecordVideo,
  isRecording,
}) => {
  if (!isConnected) return null;

  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("basic");

  if (!params.cameraDistance) {
    setParams((prev: any) => ({ ...prev, ...defaultCameraParams }));
  }

  const handleToggleLyrics = () => {
    setParams((prev: any) => ({
      ...prev,
      showLyrics: !prev.showLyrics,
    }));
  };

  const resetToDefault = (key: string) => {
    const defaultValue = defaultParams[key as keyof typeof defaultParams];
    setParams((prev: any) => ({ ...prev, [key]: defaultValue }));
  };


  const renderControl = (key: string, config: any) => {
    const value = params[key];

    if (config.isToggle) {
      return (
        <div key={key} className="flex items-center justify-between py-1 px-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">{config.icon}</span>
            <div>
              <label className="text-xs font-medium text-slate-300 block">
                {config.label}
              </label>
              <button
                onClick={() => resetToDefault(key)}
                className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors mt-0.5"
              >
                Reset
              </button>
            </div>
          </div>
          <div
            onClick={() =>
              setParams((prev: any) => ({ ...prev, [key]: !value }))
            }
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer ${
              value ? "bg-cyan-600" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-1 py-1 px-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-base">{config.icon}</span>
            <div>
              <label className="text-xs font-medium text-slate-300 block">
                {config.label}
              </label>
              <button
                onClick={() => resetToDefault(key)}
                className="text-[10px] text-slate-500 hover:text-slate-400 mt-0.5"
              >
                Reset
              </button>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-slate-800/50 px-1 py-0.5 rounded text-slate-300">
            {typeof value === "number"
              ? value.toFixed(config.step < 1 ? 1 : 0)
              : value}
          </span>
        </div>
        <Slider
          value={value}
          min={config.min}
          max={config.max}
          step={config.step}
          onChange={(v: number) =>
            setParams((prev: any) => ({ ...prev, [key]: v }))
          }
          showValue={false}
        />
      </div>
    );
  };

  const categoryControls = Object.entries(sliderConfigs)
    .filter(([_, config]) => config.category === activeCategory)
    .map(([key, config]) => renderControl(key, config));

  return (
    <>
      <div className="absolute  w-[90%] bottom-0 left-1/2 -translate-x-1/2 max-w-4xl group ">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-3">
              {audioName && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Music className="text-emerald-400" size={16} />
                  <p className="text-xs text-slate-200 font-semibold truncate">
                    {audioName}
                  </p>
                </div>
              )}

              <button
                onClick={togglePlayback}
                disabled={!canPlayAudio || isLoading}
                className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white" />
                )}
              </button>

              <button
                onClick={handleToggleLyrics}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                  params.showLyrics
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800/90 border border-slate-700/50"
                }`}
              >
                <Music2 size={14} />
                {params.showLyrics ? "Lyrics ON" : "Lyrics OFF"}
              </button>

              {onRecordVideo && (
                <button
                  onClick={onRecordVideo}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                    isRecording
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/50 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Video size={14} />
                  {isRecording ? "Stop" : "Record"}
                </button>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/50 text-xs"
              >
                <Settings size={14} />
                Settings
                {showSettings ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            </div>

            {showSettings && (
              <div className="mt-2 pt-2 border-t border-slate-700/50 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-1 mb-2 text-xs">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md flex-1 justify-center text-xs ${
                        activeCategory === category.id
                          ? "bg-slate-800/80 text-white border border-slate-600/50"
                          : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 border border-slate-700/30"
                      }`}
                    >
                      <category.icon size={12} className={category.color} />
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">{categoryControls}</div>
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="relative">
              <div
                className="w-full h-1.5 bg-slate-800/80 rounded-full cursor-pointer overflow-hidden border border-slate-700/50"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-900 transition-all duration-100"
                  style={{
                    left: `${progress}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                <span className="bg-slate-800/50 px-2 py-0.5 rounded">
                  {formatTime(currentTime)}
                </span>
                <span className="bg-slate-800/50 px-2 py-0.5 rounded">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
