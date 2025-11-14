import OpenAI from "openai";
import fs from "fs";
import { OpenAITranscriptionResponse, WordTimestamp, SegmentTimestamp , LyricsData} from "../types";
import dotenv from "dotenv";

dotenv.config();



export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey:"",
    });
  }

  async transcribeAudioWithTimestamps(
    audioBuffer: Buffer,
    filename: string
  ): Promise<LyricsData> {
    try {
      // ✅ Write buffer to temp file
      const tempPath = `./tmp-${Date.now()}-${filename}`;
      fs.writeFileSync(tempPath, audioBuffer);

      // ✅ Stream file directly to OpenAI
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        language: "en",
      });

      // ✅ Clean up after sending
      // fs.unlinkSync(tempPath);

      return {
        text: transcription.text,
        words: transcription.words || [],
        segments: transcription.segments || [],
      };
    } catch (error) {
      console.error("OpenAI transcription error:", error);
      throw new Error("Failed to transcribe audio with timestamps");
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      m4a: "audio/mp4",
      mp4: "audio/mp4",
    };
    return mimeTypes[ext || ""] || "audio/mpeg";
  }
}
