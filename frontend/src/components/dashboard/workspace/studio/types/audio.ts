export interface AudioFile {
  _id: string;
  name: string;
  size: number;
  url: string;
  type: string;
  uploadedAt: Date;
  transcript?: string;
  lyrics?: string;
  audioHash?: string;
  metadata?: {
    size: number;
    name: string;
    type: string;
  };
  createdAt: string;
  audioUrl?: string;
  words?: string;
  segments?: string;
}

export interface AIGenerationParams {
  prompt: string;
  duration: number;
  genre: string;
  mood: string;
  instruments: string[];
  bpm: number;
  style: string;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface AIGenerationResponse {
  success: boolean;
  audio?: AudioFile;
  error?: string;
  jobId?: string;
  status?: string;
}

export interface AudioUploadPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: "left" | "right";
}