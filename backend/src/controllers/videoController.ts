import { Request, Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import { VideoEntryService } from "@/services/videoEntry.service";
import { uploadToPinata } from "@/utils/pinata";

interface VideoUploadRequest extends Request {
  file?: Express.Multer.File;
}

interface VideoResponse {
  success: boolean;
  error?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoHash?: string;
}

interface VideosResponse {
  success: boolean;
  error?: string;
  videos?: any[];
  total?: number;
}

interface VideoDetailResponse {
  success: boolean;
  error?: string;
  video?: any;
}

export class VideoController {
  private readonly DUMMY_USER_ID =
    process.env.DUMMY_USER_ID || "507f1f77bcf86cd799439011"; // Valid ObjectId format
  private readonly DUMMY_WALLET =
    process.env.DUMMY_WALLET || "0x0000000000000000000000000000000000000000";

  private cleanupFile(path: string): void {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred during video processing";
  }

  private formatVideoResponse(video: any) {
    return {
      id: video._id,
      userId: video.user,
      walletAddress: video.walletAddress,
      videoHash: video.videoHash,
      videoUrl: video.videoUrl,
      thumbnailHash: video.thumbnailHash,
      thumbnailUrl: video.thumbnailUrl,
      metadata: video.metadata,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    };
  }

  async uploadVideo(req: VideoUploadRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        const response: VideoResponse = {
          success: false,
          error: 'No video file provided. Please upload a video file using the "video" field name.',
        };
        res.status(400).json(response);
        return;
      }

      if (req.file.size === 0) {
        this.cleanupFile(req.file.path);
        const response: VideoResponse = {
          success: false,
          error: "Uploaded file is empty",
        };
        res.status(400).json(response);
        return;
      }

      // Validate file type
      const allowedVideoTypes = [
        "video/mp4",
        "video/mpeg",
        "video/avi",
        "video/mov",
        "video/wmv",
        "video/webm",
      ];
      if (!allowedVideoTypes.includes(req.file.mimetype)) {
        this.cleanupFile(req.file.path);
        const response: VideoResponse = {
          success: false,
          error: "Invalid file type. Please upload a video file (MP4, MPEG, AVI, MOV, WMV, WebM).",
        };
        res.status(400).json(response);
        return;
      }

      console.log('Uploading video to Pinata...');
      // Upload video to Pinata
      const saveVideoFile = await uploadToPinata(req.file);

      // Generate and upload thumbnail (optional)
      let thumbnailData = null;
      try {
        thumbnailData = await this.generateThumbnail(req.file.path);
      } catch (error) {
        console.warn("Thumbnail generation failed:", error);
      }

      // Clean up temporary file
      this.cleanupFile(req.file.path);

      console.log('Saving video entry to database...');
      // Save to database
      const videoEntry = await VideoEntryService.saveVideoEntry({
        userId: new mongoose.Types.ObjectId(this.DUMMY_USER_ID),
        walletAddress: this.DUMMY_WALLET,
        videoHash: saveVideoFile.ipfsHash,
        videoUrl: saveVideoFile.url,
        thumbnailHash: thumbnailData?.ipfsHash,
        thumbnailUrl: thumbnailData?.url,
        metadata: {
          size: req.file.size,
          type: req.file.mimetype,
          name: req.file.originalname,
        },
      });

      console.log('Video saved successfully:', videoEntry._id);

      const response: VideoResponse = {
        success: true,
        videoUrl: saveVideoFile.url,
        thumbnailUrl: thumbnailData?.url,
        videoHash: saveVideoFile.ipfsHash,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in uploadVideo:', error);
      if (req.file?.path) {
        this.cleanupFile(req.file.path);
      }

      const response: VideoResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  async getAllVideos(req: Request, res: Response): Promise<void> {
    try {
      console.log('Fetching all videos...');
      const videos = await VideoEntryService.getAllVideos();
      console.log(`Found ${videos.length} videos`);
      
      const response: VideosResponse = {
        success: true,
        videos: videos.map(video => this.formatVideoResponse(video)),
        total: videos.length
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getAllVideos:', error);
      const response: VideosResponse = {
        success: false,
        error: this.getErrorMessage(error)
      };

      res.status(500).json(response);
    }
  }

  async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('Fetching video by ID:', id);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Invalid video ID format"
        };
        res.status(400).json(response);
        return;
      }

      const video = await VideoEntryService.getVideoById(id);

      if (!video) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Video not found"
        };
        res.status(404).json(response);
        return;
      }

      const response: VideoDetailResponse = {
        success: true,
        video: this.formatVideoResponse(video)
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getVideoById:', error);
      const response: VideoDetailResponse = {
        success: false,
        error: this.getErrorMessage(error)
      };

      res.status(500).json(response);
    }
  }

  async getVideosByWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      console.log('Fetching videos by wallet:', walletAddress);

      if (!walletAddress) {
        const response: VideosResponse = {
          success: false,
          error: "Wallet address is required"
        };
        res.status(400).json(response);
        return;
      }

      const videos = await VideoEntryService.getVideosByWallet(walletAddress);
      console.log(`Found ${videos.length} videos for wallet ${walletAddress}`);

      const response: VideosResponse = {
        success: true,
        videos: videos.map(video => this.formatVideoResponse(video)),
        total: videos.length
      };

      res.json(response);
    } catch (error) {
      console.error('Error in getVideosByWallet:', error);
      const response: VideosResponse = {
        success: false,
        error: this.getErrorMessage(error)
      };

      res.status(500).json(response);
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('Deleting video:', id);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Invalid video ID format"
        };
        res.status(400).json(response);
        return;
      }

      const video = await VideoEntryService.deleteVideo(id);

      if (!video) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Video not found"
        };
        res.status(404).json(response);
        return;
      }

      console.log('Video deleted successfully:', id);
      const response: VideoDetailResponse = {
        success: true,
        video: this.formatVideoResponse(video)
      };

      res.json(response);
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      const response: VideoDetailResponse = {
        success: false,
        error: this.getErrorMessage(error)
      };

      res.status(500).json(response);
    }
  }

  private async generateThumbnail(
    videoPath: string
  ): Promise<{ ipfsHash: string; url: string } | null> {
    // Implement thumbnail generation logic here
    // For now, return null as this is optional
    return null;
  }
}

export const videoController = new VideoController();