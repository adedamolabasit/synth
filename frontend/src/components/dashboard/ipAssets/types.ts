export interface Collaborator {
  id: string;
  walletAddress: string;
  role: "audio" | "visual" | "both";
  revenueShare: number;
  contribution?: string;
}

export interface LicenseTerm {
  id: string;
  name: string;
  type: string;
  duration: string;
  terms: string;
  createdAt: string;
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
  ipRegistered?: boolean;
  publication: "draft" | "published";
  collaborators?: Collaborator[];
  licenseTerms?: LicenseTerm[];
  revenue?: number;
}

export interface RegisterIPModalProps {
  video: Video;
  onRegister: (registrationData: IPRegistrationData) => void;
  onClose: () => void;
}

export interface IPRegistrationData {
  title: string;
  video: Video;
  description?: string;
  creators?: Array<{
    name: string;
    address: string;
    contributionPercent: number;
  }>;
  licenseTerms?: {
    commercialRevShare: number;
    defaultMintingFee: string;
    currency: string;
  };
}
