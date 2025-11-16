// src/components/ControlsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Wand2, Download, Circle, Square, Volume2, VolumeX } from 'lucide-react';
import { SceneRecorder } from '../../../shared/utils/sceneRecorder';
import { AudioManager } from './studio/visualizers/manager/AudioManager';
import { VisualizerParams } from './studio/types/visualizer';


interface Props {
  params: VisualizerParams;
  onParamsChange: (u: (p: VisualizerParams) => VisualizerParams) => void;
  onDemoAudio: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  audioManager: AudioManager;
}

export const ControlsPanel: React.FC<Props> = ({
  params,
  onParamsChange,
  onDemoAudio,
  canvasRef,
  audioManager,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const recorderRef = React.useRef<SceneRecorder | null>(new SceneRecorder());

  useEffect(() => {
    // nothing special
  }, [audioManager]);

  const handleRecord = async () => {
    if (!canvasRef.current) {
      alert('Canvas missing');
      return;
    }

    if (!isRecording) {
      try {
        // Get the processed audio stream from audioManager
        let audioStream: MediaStream | undefined;
        if (includeAudio) {
          const stream = audioManager.getProcessedAudioStream();
          if (stream && stream.getAudioTracks().length > 0) {
            audioStream = stream;
            console.log('Using processed audio stream for recording');
          } else {
            console.warn('audioManager has no processed stream or no tracks - recording will be silent');
          }
        }

        await recorderRef.current!.startRecording(canvasRef.current, audioStream);
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording', err);
        alert('Failed to start recording: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      try {
        const blob = await recorderRef.current!.stopRecording();
        setIsRecording(false);

        // download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualizer-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Stop recording failed', err);
        alert('Failed to stop recording');
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)} />
        <span>Record audio</span>
      </label>

      <Button onClick={onDemoAudio} variant="secondary" size="sm" icon={<Wand2 size={16} />}>Demo</Button>

      <Button
        variant={isRecording ? 'danger' : 'primary'}
        onClick={handleRecord}
        icon={isRecording ? <Square size={16} /> : <Circle size={16} />}
      >
        {isRecording ? 'Stop' : 'Record'}
      </Button>

      <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={() => console.log('Export')}>
        Export
      </Button>
    </div>
  );
};
