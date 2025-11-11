// src/services/openaiService.ts
import OpenAI from 'openai';
import { OpenAITranscriptionResponse, WordTimestamp } from '../types';
import dotenv from "dotenv";

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async transcribeAudioWithTimestamps(audioBuffer: Buffer, filename: string): Promise<{
    text: string;
    words: WordTimestamp[];
    segments: any[];
  }> {
    try {
      const file = new File([audioBuffer], filename, { 
        type: this.getMimeType(filename) 
      });

      // Request detailed transcription with timestamps
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
        response_format: "verbose_json", // Changed from "text"
        timestamp_granularities: ["word", "segment"], // Request word-level timestamps
        language: "en"
      });

      return {
        text: transcription.text,
        words: transcription.words || [],
        segments: transcription.segments || []
      };
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw new Error('Failed to transcribe audio with timestamps');
    }
  }

  // Keep the original method for backward compatibility
  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
    const result = await this.transcribeAudioWithTimestamps(audioBuffer, filename);
    return result.text;
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'mp4': 'audio/mp4'
    };
    return mimeTypes[ext || ''] || 'audio/mpeg';
  }
}