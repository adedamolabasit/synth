import React, { useState } from "react";
import { Button } from "../../ui/Button";
import {
  Wand2,
  Download,
  Circle,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SceneRecorder } from "../../../shared/utils/sceneRecorder";
import { VisualizerParams } from "../../../shared/types/visualizer.types";
import { useAudio } from "../../../provider/AudioContext";

interface Props {
  params: VisualizerParams;
  onParamsChange: (u: (p: VisualizerParams) => VisualizerParams) => void;
  onDemoAudio: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ControlsPanel: React.FC<Props> = ({
  params,
  onDemoAudio,
  canvasRef,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const recorderRef = React.useRef<SceneRecorder | null>(new SceneRecorder());
  const { getAudioManager, isPlaying, currentAudio } = useAudio();

  const handleRecord = async () => {
    if (!canvasRef.current) {
      alert("Canvas missing");
      return;
    }

    if (!isRecording) {
      try {
        let audioStream: MediaStream | undefined;

        if (includeAudio) {
          const audioManager = getAudioManager();
          const stream = audioManager.getProcessedAudioStream();
          if (stream && stream.getAudioTracks().length > 0) {
            audioStream = stream;
            console.log(
              "Using AudioManager processed audio stream for recording"
            );
          } else {
            console.warn(
              "No audio stream available - recording will be silent"
            );
          }
        }

        await recorderRef.current!.startRecording(
          canvasRef.current,
          audioStream
        );
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording", err);
        alert(
          "Failed to start recording: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    } else {
      try {
        const blob = await recorderRef.current!.stopRecording();
        setIsRecording(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visualizer-${
          currentAudio?.name || "recording"
        }-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Stop recording failed", err);
        alert("Failed to stop recording");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeAudio"
          checked={includeAudio}
          onChange={(e) => setIncludeAudio(e.target.checked)}
          className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
        />
        <label
          htmlFor="includeAudio"
          className="text-sm text-slate-300 cursor-pointer"
        >
          Include Audio
        </label>
      </div>

      <Button
        onClick={onDemoAudio}
        variant="secondary"
        size="sm"
        icon={<Wand2 size={16} />}
        disabled={isRecording}
      >
        Demo Audio
      </Button>

      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={handleRecord}
        icon={isRecording ? <Square size={16} /> : <Circle size={16} />}
        disabled={!currentAudio && !isRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={<Download size={16} />}
        onClick={() => {
          const settings = JSON.stringify(params, null, 2);
          const blob = new Blob([settings], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `visualizer-settings-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export Settings
      </Button>

      <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-slate-700/50 rounded-full">
        {isPlaying ? (
          <Volume2 size={14} className="text-green-400" />
        ) : (
          <VolumeX size={14} className="text-slate-400" />
        )}
        <span className="text-xs text-slate-300 max-w-32 truncate">
          {currentAudio ? currentAudio.name : "No Audio"}
        </span>
      </div>
    </div>
  );
};
