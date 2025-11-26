import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import {
  LyricsData,
} from "../types";
import { validateEnv } from "@/utils/envValidator";

dotenv.config();

validateEnv();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: `${process.env.OPENAI_API_KEY}`,
    });
  }

  async transcribeAudioWithTimestamps(
    audioBuffer: Buffer,
    filename: string
  ): Promise<LyricsData> {
    try {
      const tempPath = `./tmp-${Date.now()}-${filename}`;
      fs.writeFileSync(tempPath, audioBuffer);

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        language: "en",
      });

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

  async generateMusic(requestData: any): Promise<Buffer> {
    try {
      const {
        prompt,
        duration,
        genre,
        mood,
        instruments,
        bpm,
        style,
        temperature,
        top_p,
        top_k,
      } = requestData;

      const fullPrompt = `
      Create a ${genre || ""} music track.
      Mood: ${mood || ""}.
      Instruments: ${instruments || ""}.
      BPM: ${bpm || ""}.
      Style: ${style || ""}.
      Duration: ${duration}s.
      Description: ${prompt}.
      temperature: ${temperature} || 1,
      top_p: ${top_p} || 1,
      top_k: ${top_k} || 50,
    `.trim();

      const response = await this.openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        input: fullPrompt,
        voice: "echo",
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());

      return audioBuffer;
    } catch (error) {
      console.error("OpenAI music generation error:", error);
      throw new Error("Failed to generate music");
    }
  }
}
