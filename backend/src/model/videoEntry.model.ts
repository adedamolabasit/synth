import mongoose, { Document } from "mongoose";
import { IUser } from "./userEntry.model";

export interface VideoMetadata {
  size: number;
  name: string;
  type: string;
  duration?: number;
  resolution?: string;
}

export type PilFlavoursType =
  | "nonCommercialSocialRemix"
  | "commercialUse"
  | "commercialRemix"
  | "creativeCommonAttribution";

export interface IVideoEntry extends Document {
  user: mongoose.Types.ObjectId | IUser;
  walletAddress: string;
  videoHash: string;
  videoUrl: string;
  thumbnailHash?: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  ipRegistration?: {
    ip: {
      ipId: string;
      status: "registered" | "notRegistered" | "pending";
      licenseTermsIds: string;
      tokenId: string;
      fee: number;
      revShare: number;
      license: {
        pilFlavors: PilFlavoursType;
      };
    }[];
  };
  publication: "draft" | "published";
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
    ipRegistration: {
      ip: [
        {
          type: {
            ipId: { type: String, required: true },
            status: {
              type: String,
              enum: ["registered", "notRegistered", "pending"],
              required: true,
            },
            licenseTermsIds: { type: String, required: true },
            tokenId: { type: String, required: true },
            fee: { type: Number, required: false },
            revShare: { type: Number, required: false },
            license: {
              pilFlavors: {
                type: String,
                enum: [
                  "nonCommercialSocialRemix",
                  "commercialUse",
                  "commercialRemix",
                  "creativeCommonAttribution",
                ],
                required: false,
              },
            },
          },
          required: false,
          default: null,
        },
      ],
    },
    publication: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
  },
  { timestamps: true }
);

export const VideoEntry = mongoose.model<IVideoEntry>(
  "VideoEntry",
  VideoEntrySchema
);
