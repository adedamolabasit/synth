import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Circle, Square } from "lucide-react";
import { SceneRecorder } from "../../../studio/utils/sceneRecorder";
import { VisualizerParams } from "../../../shared/types/visualizer.types";
import { useAudio } from "../../../provider/AudioContext";
import { useVisualizer } from "../../../provider/VisualizerContext";

interface Props {
  params: VisualizerParams;
  onParamsChange: (u: (p: VisualizerParams) => VisualizerParams) => void;
  onDemoAudio: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ControlsPanel: React.FC<Props> = ({ canvasRef }) => {
  const { setShowDownloadModal, setVideoBlob } = useVisualizer();
  const recorderRef = React.useRef<SceneRecorder | null>(new SceneRecorder());
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
        console.error("Failed to start recording", err);
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
        console.error("Stop recording failed", err);
        alert("Failed to stop recording");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={handleRecord}
        icon={isRecording ? <Square size={16} /> : <Circle size={16} />}
        disabled={!currentAudio && !isRecording}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
};
