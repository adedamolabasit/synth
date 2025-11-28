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
  private USER_ID = new mongoose.Types.ObjectId();

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
      publication: video.publication,
      ipRegistration: video.ipRegistration,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };
  }

  async uploadVideo(req: VideoUploadRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.params?.walletAddress;
      if (!req.file) {
        const response: VideoResponse = {
          success: false,
          error:
            'No video file provided. Please upload a video file using the "video" field name.',
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
          error:
            "Invalid file type. Please upload a video file (MP4, MPEG, AVI, MOV, WMV, WebM).",
        };
        res.status(400).json(response);
        return;
      }

      const saveVideoFile = await uploadToPinata(req.file);

      let thumbnailData = null;
      try {
        thumbnailData = await this.generateThumbnail();
      } catch (error) {}

      this.cleanupFile(req.file.path);

      await VideoEntryService.saveVideoEntry({
        userId: this.USER_ID,
        walletAddress: walletAddress,
        videoHash: saveVideoFile.ipfsHash,
        videoUrl: saveVideoFile.url,
        thumbnailHash: thumbnailData?.ipfsHash,
        thumbnailUrl: thumbnailData?.url,
        metadata: {
          size: req.file.size,
          type: req.file.mimetype,
          name: req.file.originalname,
        },
        ipRegistration: {
          ipId: "",
          status: "notRegistered",
          tokenId: "",
        },
        publication: "draft",
      });

      const response: VideoResponse = {
        success: true,
        videoUrl: saveVideoFile.url,
        thumbnailUrl: thumbnailData?.url,
        videoHash: saveVideoFile.ipfsHash,
      };

      res.json(response);
    } catch (error) {
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

  async getAllVideos(_req: Request, res: Response): Promise<void> {
    try {
      const videos = await VideoEntryService.getAllVideos();

      const response: VideosResponse = {
        success: true,
        videos: videos.map((video) => this.formatVideoResponse(video)),
        total: videos.length,
      };

      res.json(response);
    } catch (error) {
      const response: VideosResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Invalid video ID format",
        };
        res.status(400).json(response);
        return;
      }

      const video = await VideoEntryService.getVideoById(id);

      if (!video) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Video not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: VideoDetailResponse = {
        success: true,
        video: this.formatVideoResponse(video),
      };

      res.json(response);
    } catch (error) {
      const response: VideoDetailResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  async getVideosByWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        const response: VideosResponse = {
          success: false,
          error: "Wallet address is required",
        };
        res.status(400).json(response);
        return;
      }

      const videos = await VideoEntryService.getVideosByWallet(walletAddress);

      const response: VideosResponse = {
        success: true,
        videos: videos.map((video) => this.formatVideoResponse(video)),
        total: videos.length,
      };

      res.json(response);
    } catch (error) {
      const response: VideosResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  async updateVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: "Invalid video ID" });
        return;
      }

      const updates = req.body;

      const updatedVideo = await VideoEntryService.updateVideo(id, updates);

      if (!updatedVideo) {
        res.status(404).json({ success: false, error: "Video not found" });
        return;
      }

      res.json({
        success: true,
        video: updatedVideo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: this.getErrorMessage(error),
      });
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Invalid video ID format",
        };
        res.status(400).json(response);
        return;
      }

      const video = await VideoEntryService.deleteVideo(id);

      if (!video) {
        const response: VideoDetailResponse = {
          success: false,
          error: "Video not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: VideoDetailResponse = {
        success: true,
        video: this.formatVideoResponse(video),
      };

      res.json(response);
    } catch (error) {
      const response: VideoDetailResponse = {
        success: false,
        error: this.getErrorMessage(error),
      };

      res.status(500).json(response);
    }
  }

  private async generateThumbnail(): Promise<{
    ipfsHash: string;
    url: string;
  } | null> {
    return null;
  }
}

export const videoController = new VideoController();
