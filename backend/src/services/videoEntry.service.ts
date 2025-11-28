import { VideoEntry } from "@/model/videoEntry.model";
import mongoose from "mongoose";

export type PilFlavoursType =
  | "nonCommercialSocialRemix"
  | "commercialUse"
  | "commercialRemix"
  | "creativeCommonAttribution";

export interface SaveVideoEntryData {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  videoHash: string;
  videoUrl: string;
  thumbnailHash?: string;
  thumbnailUrl?: string;
  metadata: {
    size: number;
    name: string;
    type: string;
    duration?: number;
    resolution?: string;
  };
  ipRegistration?: {
    ipId: string;
    status: "registered" | "notRegistered";
    tokenId: string;
  };
  publication: "draft" | "published";
}

export class VideoEntryService {
  static async saveVideoEntry(data: SaveVideoEntryData) {
    try {
      const newEntry = new VideoEntry({
        user: data.userId,
        walletAddress: data.walletAddress,
        videoHash: data.videoHash,
        videoUrl: data.videoUrl,
        thumbnailHash: data.thumbnailHash,
        thumbnailUrl: data.thumbnailUrl,
        metadata: data.metadata,
        publication: data.publication,
        ipRegistration: data?.ipRegistration,
      });

      const savedEntry = await newEntry.save();
      return savedEntry;
    } catch (error) {
      throw error;
    }
  }

  static async getAllVideos() {
    try {
      const videos = await VideoEntry.find().sort({ createdAt: -1 });
      return videos;
    } catch (error) {
      throw error;
    }
  }

  static async getVideosByWallet(walletAddress: string) {
    try {
      const videos = await VideoEntry.find({ walletAddress }).sort({
        createdAt: -1,
      });
      return videos;
    } catch (error) {
      throw error;
    }
  }

  static async getVideoById(id: string) {
    try {
      const video = await VideoEntry.findById(id);
      return video;
    } catch (error) {
      throw error;
    }
  }

  static async updateVideo(id: string, updateData: any) {
    try {
      const updatedVideo = await VideoEntry.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return updatedVideo;
    } catch (error) {
      throw error;
    }
  }

  static async deleteVideo(id: string) {
    try {
      const video = await VideoEntry.findByIdAndDelete(id);
      return video;
    } catch (error) {
      throw error;
    }
  }
}
