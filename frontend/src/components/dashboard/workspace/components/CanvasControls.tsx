import React from "react";
import { Music, Play, Pause } from "lucide-react";
import { Button } from "../../../ui/Button";
import { ControlsPanel } from "./ControlsPanel";
import { SlidersPanel } from "./SlidersPanel";

interface CanvasControlsProps {
  isConnected: boolean;
  audioName: string;
  canPlayAudio: boolean;
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
}) => {
  if (!isConnected) return null;

  return (
    <>
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl px-8 py-4 shadow-2xl">
        {/* Audio Info */}
        {audioName && (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700/30">
              <Music size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-200 font-medium truncate max-w-48">
                {audioName}
              </span>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex gap-4 justify-center items-center">
          <Button
            variant="secondary"
            size="md"
            icon={isPlaying ? <Pause size={22} /> : <Play size={22} />}
            onClick={togglePlayback}
            disabled={!canPlayAudio || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </div>
            ) : isPlaying ? (
              "Pause"
            ) : (
              "Play"
            )}
          </Button>
          
          <ControlsPanel
            params={params}
            onParamsChange={setParams}
            onDemoAudio={onDemoAudio}
            canvasRef={canvasRef}
          />
        </div>

        {/* Visualizer Controls */}
        <div className="flex items-center justify-end min-w-0 flex-1">
          <SlidersPanel params={params} onParamsChange={setParams} />
        </div>
      </div>

      {/* Progress Bar - Moved outside the main controls container */}
      <div className="absolute bottom-4 left-4 right-4">
        <div
          className="w-full h-2 bg-gray-700 rounded cursor-pointer relative"
          onClick={handleSeek}
        >
          <div
            className="bg-green-500 h-2 rounded transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{Math.floor(currentTime)}s</span>
          <span>{Math.floor(duration)}s</span>
        </div>
      </div>
    </>
  );
};