export interface AudioFile {
  _id: string;
  name: string;
  url: string;
  audioUrl: string;
  size: number;
  type: string;
  uploadedAt: Date;
  metadata?: {
    name: string;
    size: number;
    type: string;
  };
  createdAt?: string;
  id?: string;
}

export interface AudioUploadPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: "left" | "right";
}

export interface UploadProgress {
  percentage: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
}