import React, { useState, useRef } from "react";
import { Button } from "../../../ui/Button";
import { Circle, Square } from "lucide-react";
import { SceneRecorder } from "../../../../studio/utils/sceneRecorder";
import { useAudio } from "../../../../provider/AudioContext";
import { useVisualizer } from "../../../../provider/VisualizerContext";
import { VisualizerParams } from "../../../../shared/types/visualizer.types";
import { Mic } from "lucide-react";
import { Switch } from "../../../ui/Switch";

interface ControlsPanelProps {
  params: VisualizerParams;
  onParamsChange: (updater: (prev: VisualizerParams) => VisualizerParams) => void;
  onDemoAudio: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
  params, 
  onParamsChange,
  canvasRef 
}) => {
  const { setShowDownloadModal, setVideoBlob } = useVisualizer();
  const recorderRef = useRef<SceneRecorder | null>(new SceneRecorder());
  const { currentAudio, getAudioManager } = useAudio();
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = async () => {
    if (!canvasRef.current) {
      alert("Canvas missing");
      return;
    }

    if (!isRecording) {
      try {
        let audioStream: MediaStream | undefined = undefined;

        const audioManager = getAudioManager();
        if (audioManager) {
          const stream = audioManager.getProcessedAudioStream();
          if (stream && stream.getAudioTracks().length > 0) {
            audioStream = stream;
          }
        }

        await recorderRef.current!.startRecording(
          canvasRef.current,
          audioStream
        );

        setIsRecording(true);
      } catch (err) {
        alert(
          "Failed to start recording: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    } else {
      try {
        const blob = await recorderRef.current!.stopRecording();
        setVideoBlob(blob);
        setShowDownloadModal(true);

        setIsRecording(false);
      } catch (err) {
        alert("Failed to stop recording");
        setIsRecording(false);
      }
    }
  };

  const toggleLyrics = (enabled: boolean) => {
    console.log('Toggling lyrics to:', enabled);
    onParamsChange((prev) => ({
      ...prev,
      showLyrics: enabled
    }));
  };

  return (
    <div className="flex items-center gap-4">
      {/* Lyrics Toggle */}
      <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/30">
        <Mic size={16} className="text-cyan-400" />
        <span className="text-sm text-slate-300 whitespace-nowrap">Lyrics</span>
        <Switch
          checked={params.showLyrics ?? false} // FIXED: Default to false
          onChange={toggleLyrics}
        />
      </div>

      {/* Record Button */}
      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={handleRecord}
        icon={isRecording ? <Square size={16} /> : <Circle size={16} />}
        disabled={!currentAudio && !isRecording}
        className="whitespace-nowrap"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
};