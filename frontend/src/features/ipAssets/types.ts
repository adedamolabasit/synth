import { LicenseTerms, IpCreator } from "@story-protocol/core-sdk";

export interface Collaborator {
  id: string;
  walletAddress: string;
  role: "audio" | "visual" | "both";
  revenueShare: number;
  contribution?: string;
}

export interface RegisteredIpAssetParams {
  ipId: `0x${string}` | undefined;
  status: "registered" | "notRegistered";
  tokenId: bigint | undefined;
}

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoHash: string;
  walletAddress: string;
  metadata: {
    name: string;
    size: number;
    type: string;
    duration?: number;
    description?: string;
  };
  createdAt: string;
  ipRegistration?: RegisteredIpAssetParams;
  publication: "draft" | "published";
  collaborators?: Collaborator[];
  licenseTerms?: LicenseTerms[];
  revenue?: number;
}

export interface RegisterIPModalProps {
  video: Video;
  onClose: () => void;
  updateVideoIpRegistration: (
    video: Video,
    ipRegistration: RegisteredIpAssetParams
  ) => void;
}

export interface IPRegistrationData {
  title: string;
  video: Video;
  description?: string;
  creators?: IpCreator[];
  licenseTerms?: LicenseTerms;
}
