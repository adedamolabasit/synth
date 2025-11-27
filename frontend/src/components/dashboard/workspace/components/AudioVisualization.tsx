import { Music } from "lucide-react";
import { CanvasControls } from "./CanvasControls";

interface AudioVisualizationProps {
  isConnected: boolean;
  audioName: string;
  canPlayAudio: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  togglePlayback: () => void;
  handleDemoAudio: () => void;
  progress: number;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  audioError: string;
  hasDefaultAudio: boolean;
  currentAudio: any;
  params: any;
  setParams: (updater: any) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  isConnected,
  audioName,
  canPlayAudio,
  isPlaying,
  isLoading,
  togglePlayback,
  handleDemoAudio,
  progress,
  currentTime,
  duration,
  handleSeek,
  audioError,
  hasDefaultAudio,
  currentAudio,
  params,
  setParams,
  canvasRef,
}) => {
  return (
    <>
      <CanvasControls
        isConnected={isConnected}
        audioName={audioName}
        canPlayAudio={canPlayAudio}
        isPlaying={isPlaying}
        isLoading={isLoading}
        togglePlayback={togglePlayback}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        handleSeek={handleSeek}
        params={params}
        setParams={setParams}
        canvasRef={canvasRef}
        onDemoAudio={handleDemoAudio}
      />

      {audioError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
          {audioError}
        </div>
      )}

      {!currentAudio && !hasDefaultAudio && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-8 max-w-md">
            <Music size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Select Audio to Visualize
            </h3>
            <p className="text-slate-300 mb-4">
              Upload a new audio or select one from the Audio Player on the
              left to see it come to life with dynamic visualizations.
            </p>
          </div>
        </div>
      )}
    </>
  );
};