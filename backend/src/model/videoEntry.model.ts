import mongoose, { Document } from "mongoose";
import { IUser } from "./userEntry.model";

export interface VideoMetadata {
  size: number;
  name: string;
  type: string;
  duration?: number;
  resolution?: string;
}

export interface IVideoEntry extends Document {
  user: mongoose.Types.ObjectId | IUser;
  walletAddress: string;
  videoHash: string;
  videoUrl: string;
  thumbnailHash?: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const VideoEntrySchema = new mongoose.Schema<IVideoEntry>(
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
    videoHash: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailHash: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    metadata: {
      size: { type: Number, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      duration: { type: Number },
      resolution: { type: String },
    },
  },
  { timestamps: true }
);

export const VideoEntry = mongoose.model<IVideoEntry>(
  "VideoEntry",
  VideoEntrySchema
);