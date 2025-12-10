export interface CanvasControlsProps {
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
