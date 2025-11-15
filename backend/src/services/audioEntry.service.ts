import { AudioEntry } from "@/model/audioEntry.model";
import mongoose from "mongoose";
import { SegmentTimestamp, WordTimestamp } from "@/types";

export interface SaveAudioEntryData {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  transcript: string;
  lyrics: string;
  words: string;
  segments: string;
  audioHash: string;
  audioUrl: string;
  metadata: {
    size: number;
    name: string;
    type: string;
  };
}

export class AudioEntryService {
  static async saveAudioEntry(data: SaveAudioEntryData) {
    const newEntry = new AudioEntry({
      user: data.userId,
      walletAddress: data.walletAddress,
      transcript: data.transcript,
      lyrics: data.lyrics,
      words: data.words,
      segments: data.segments,
      audioHash: data.audioHash,
      audioUrl: data.audioUrl,
      metadata: data.metadata,
    });

    return await newEntry.save();
  }

  static async getAllAudio() {
    return await AudioEntry.find().sort({ createdAt: -1 });
  }

  static async getAudioByWallet(walletAddress: string) {
    return await AudioEntry.find({ walletAddress }).sort({ createdAt: -1 });
  }

  static async getAudioById(id: string) {
    return await AudioEntry.findById(id);
  }

  static async deleteAudio(id: string) {
    return await AudioEntry.findByIdAndDelete(id);
  }
}
