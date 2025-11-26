import { Response } from "express";
import { OpenAIService } from "../services/openaiService";
import {
  LyricsResponse,
  AudioUploadRequest,
  WordTimestamp,
  SegmentTimestamp,
} from "../types";
import fs from "fs";
import { uploadToPinata } from "@/utils/pinata";
import { AudioEntryService } from "@/services/audioEntry.service";
import mongoose from "mongoose";
import { compress } from "@/utils/compress";

const openAIService = new OpenAIService();

export class audioController {
  private USER_ID = new mongoose.Types.ObjectId();

  async uploadAudio(req: AudioUploadRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.params?.walletAddress;

      if (!req.file) {
        const response: LyricsResponse = {
          success: false,
          error:
            'No audio file provided. Please upload an audio file using the "audio" field name.',
        };
        res.status(400).json(response);
        return;
      }

      if (req.file.size === 0) {
        this.cleanupFile(req.file.path);
        const response: LyricsResponse = {
          success: false,
          error: "Uploaded file is empty",
        };
        res.status(400).json(response);
        return;
      }

      const audioBuffer = fs.readFileSync(req.file.path);

      const transcription = await openAIService.transcribeAudioWithTimestamps(
        audioBuffer,
        req.file.originalname
      );

      const saveAudioFile = await uploadToPinata(req.file);

      this.cleanupFile(req.file.path);

      await AudioEntryService.saveAudioEntry({
        userId: this.USER_ID,
        walletAddress: walletAddress as string,
        transcript: compress(transcription.text.trim()),
        lyrics: compress(transcription.text.trim()),
        words: compress(transcription.words as WordTimestamp[]),
        segments: compress(transcription.segments as SegmentTimestamp[]),
        audioHash: saveAudioFile.ipfsHash,
        audioUrl: saveAudioFile.url,
        metadata: {
          size: req.file.size,
          type: req.file.mimetype,
          name: req.file.originalname,
        },
      });

      const response: LyricsResponse = {
        success: true,
        lyrics: transcription.text.trim(),
        timestamps: transcription.words,
        segments: transcription.segments,
      };

      res.json(response);
    } catch (error) {
      if (req.file?.path) {
        this.cleanupFile(req.file.path);
      }

      const response: LyricsResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  async getAllAudio(_req: any, res: Response): Promise<void> {
    const audio = await AudioEntryService.getAllAudio();
    res.json({ success: true, audio });
  }

  async getAudioByWallet(req: any, res: Response): Promise<any> {
    const { walletAddress } = req.params;

    const audio = await AudioEntryService.getAudioByWallet(walletAddress);
    res.json({ success: true, audio });
  }

  async getAudioById(req: any, res: Response): Promise<any> {
    const { id } = req.params;

    const audio = await AudioEntryService.getAudioById(id);
    if (!audio) {
      return res.status(404).json({ success: false, error: "Audio not found" });
    }
    res.json({ success: true, audio });
  }

  async deleteAudio(req: any, res: Response): Promise<any> {
    const { id } = req.params;

    const deleted = await AudioEntryService.deleteAudio(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Audio not found" });
    }

    res.json({ success: true, message: "Audio deleted successfully" });
  }

  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {}
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error occurred during audio processing";
  }
}
