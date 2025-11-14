import mongoose, { Document } from "mongoose";
import { IUser } from "./userEntry.model";
import { WordTimestamp, SegmentTimestamp } from "@/types";

export interface IAudioEntry extends Document {
  user: mongoose.Types.ObjectId | IUser;
  walletAddress: string;
  transcript: string;
  lyrics: string;
  words: string;
  segments: string;
  audioHash: string;
  audioUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const AudioEntrySchema = new mongoose.Schema<IAudioEntry>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10000,
    },
    lyrics: {
      type: String,
      required: true,
    },
    words: {
      type: String,
      minlength: 10,
      maxlength: 10000,
    },
    segments: {
      type: String,
      minlength: 10,
      maxlength: 10000,
    },
    audioHash: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const AudioEntry = mongoose.model<IAudioEntry>(
  "AudioEntry",
  AudioEntrySchema
);
