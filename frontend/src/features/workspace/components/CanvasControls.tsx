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
  RefreshCw,
  Eye,
  Target,
} from "lucide-react";
import { Slider } from "../../../components/ui/Slider";
import { formatTime } from "../utils";
import {
  categories,
  defaultCameraParams,
  sliderConfigs,
  presets,
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
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDemoAudio: () => void;
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
  onDemoAudio,
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
    if (typeof defaultValue === "number") {
      setParams((prev: any) => ({ ...prev, [key]: defaultValue }));
    } else if (typeof defaultValue === "boolean") {
      setParams((prev: any) => ({ ...prev, [key]: defaultValue }));
    }
  };

  const applyCameraPreset = (preset: string) => {
    setParams((prev: any) => ({
      ...prev,
      ...presets[preset as keyof typeof presets],
    }));
  };

  const renderControl = (key: string, config: any) => {
    const value = params[key];

    if (config.isToggle) {
      return (
        <div key={key} className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-3">
            <span className="text-lg">{config.icon}</span>
            <div>
              <label className="text-sm font-medium text-slate-300 block">
                {config.label}
              </label>
              <button
                onClick={() => resetToDefault(key)}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors mt-1"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              onClick={() =>
                setParams((prev: any) => ({ ...prev, [key]: !value }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                value ? "bg-cyan-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2 py-2 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{config.icon}</span>
            <div>
              <label className="text-sm font-medium text-slate-300 block">
                {config.label}
              </label>
              <button
                onClick={() => resetToDefault(key)}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors mt-1"
              >
                Reset
              </button>
            </div>
          </div>
          <span className="text-sm font-semibold bg-slate-800/50 px-2 py-1 rounded text-slate-300">
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
        <div className="flex justify-between text-xs text-slate-500">
          <span>{config.min}</span>
          <span className="text-slate-400">{config.label}</span>
          <span>{config.max}</span>
        </div>
      </div>
    );
  };

  const categoryControls = Object.entries(sliderConfigs)
    .filter(([_, config]) => config.category === activeCategory)
    .map(([key, config]) => renderControl(key, config));

  return (
    <>
      <div className="absolute xl:bottom-20 bottom-10 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-6 mb-4">
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

            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-6 min-w-0 flex-1 justify-end">
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

              <div className="flex flex-col gap-2 min-w-[150px]">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-slate-300" />
                    <span className="text-sm font-medium text-slate-300">
                      Settings
                    </span>
                  </div>
                  {showSettings ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 flex-1 justify-center ${
                      activeCategory === category.id
                        ? "bg-slate-800/80 text-white border border-slate-600/50"
                        : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 border border-slate-700/30"
                    }`}
                  >
                    <category.icon size={14} className={category.color} />
                    <span className="text-sm font-medium">
                      {category.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 max-h-64 overflow-y-auto">
                <div className="space-y-4">
                  {activeCategory === "camera" && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">
                          Camera Presets
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "default", label: "Default", icon: "🎯" },
                          { id: "close-up", label: "Close-up", icon: "🔍" },
                          { id: "wide-angle", label: "Wide", icon: "🌐" },
                          { id: "top-down", label: "Top Down", icon: "⬇️" },
                          { id: "low-angle", label: "Low Angle", icon: "⬆️" },
                          { id: "orbiting", label: "Orbiting", icon: "🔄" },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => applyCameraPreset(preset.id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/40 hover:bg-blue-500/20 border border-slate-700/30 transition-all duration-200"
                          >
                            <span className="text-lg">{preset.icon}</span>
                            <span className="text-xs text-slate-300">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {categoryControls}

                  {activeCategory === "basic" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Basic parameters control the overall behavior and
                        intensity of the visualizer
                      </div>
                    </div>
                  )}

                  {activeCategory === "camera" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Adjust camera position, angle, and movement behavior
                      </div>
                    </div>
                  )}

                  {activeCategory === "animation" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Animation settings control how elements move and respond
                        over time
                      </div>
                    </div>
                  )}

                  {activeCategory === "visual" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Visual settings control the appearance, size, and
                        complexity of elements
                      </div>
                    </div>
                  )}

                  {activeCategory === "audio" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Audio processing settings affect how sound is analyzed
                        and visualized
                      </div>
                    </div>
                  )}

                  {activeCategory === "effects" && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <div className="text-xs text-slate-500 italic">
                        Toggle various visual and audio effects on or off
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Eye size={12} />
                  Active:{" "}
                  {categories.find((c) => c.id === activeCategory)?.label}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      Object.entries(sliderConfigs)
                        .filter(
                          ([_, config]) => config.category === activeCategory
                        )
                        .forEach(([key]) => resetToDefault(key));
                    }}
                    className="text-xs bg-slate-800/50 hover:bg-slate-800/70 text-slate-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Reset Category
                  </button>
                  <button
                    onClick={() => {
                      Object.keys(sliderConfigs).forEach(resetToDefault);
                    }}
                    className="text-xs bg-slate-800/70 hover:bg-slate-800/90 text-slate-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
