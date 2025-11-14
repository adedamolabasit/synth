// src/types/index.ts
export interface AudioUploadRequest extends Express.Request {
  file?: Express.Multer.File;
}

export interface LyricsResponse {
  success: boolean;
  lyrics?: string;
  error?: string;
  timestamps?: WordTimestamp[];
  segments?: SegmentTimestamp[];
}

export interface OpenAITranscriptionResponse {
  text: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}


export interface SegmentTimestamp {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordTimestamp[];
}

export interface LyricsData {
  text: string;
  words?: WordTimestamp[];
  segments?: SegmentTimestamp[];
}

export interface SyncedLyrics {
  text: string;
  startTime: number;
  endTime: number;
  words?: WordTimestamp[];
}