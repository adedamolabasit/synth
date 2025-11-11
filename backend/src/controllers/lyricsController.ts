// src/controllers/lyricsController.ts
import { Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { LyricsResponse, AudioUploadRequest, WordTimestamp, SegmentTimestamp } from '../types';
import fs from 'fs';

const openAIService = new OpenAIService();

export class LyricsController {
  /**
   * Extract lyrics with timestamps from uploaded audio file
   */
  async extractLyrics(req: AudioUploadRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        const response: LyricsResponse = {
          success: false,
          error: 'No audio file provided. Please upload an audio file using the "audio" field name.'
        };
        res.status(400).json(response);
        return;
      }

      console.log(`Processing audio file: ${req.file.originalname} (${req.file.size} bytes)`);

      if (req.file.size === 0) {
        this.cleanupFile(req.file.path);
        const response: LyricsResponse = {
          success: false,
          error: 'Uploaded file is empty'
        };
        res.status(400).json(response);
        return;
      }

      const audioBuffer = fs.readFileSync(req.file.path);
      
      // Get transcription with timestamps
      const transcription = await openAIService.transcribeAudioWithTimestamps(
        audioBuffer, 
        req.file.originalname
      );

      this.cleanupFile(req.file.path);

      const response: LyricsResponse = {
        success: true,
        lyrics: transcription.text.trim(),
        timestamps: transcription.words,
        segments: transcription.segments
      };

      res.json(response);

    } catch (error) {
      console.error('Error extracting lyrics:', error);

      if (req.file?.path) {
        this.cleanupFile(req.file.path);
      }

      const response: LyricsResponse = {
        success: false,
        error: this.getErrorMessage(error)
      };

      res.status(500).json(response);
    }
  }

  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temporary file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred during audio processing';
  }
}