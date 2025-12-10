import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { VideoPlayerHeader } from "./VideoPlayerHeader";
import { VideoGallery } from "./VideoGallery";
import { VideoDetailView } from "./VideoDetailView";
import { VideoSidebar } from "./VideoSidebar";
import { LoadingState } from "./LoadingState";
import { useVideos } from "../hooks/useVideos";
import { useVideoThumbnails } from "../hooks/useVideoThumbnails";
import { useVideoHover } from "../hooks/useVideoHover";
import { LicenseTerms } from "@story-protocol/core-sdk";
import { getFilteredVideos } from "../utils/videoUtils";

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
  likes?: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  ipRegistration?: RegisteredIpAssetParams;
  publication: "draft" | "published";
  collaborators?: Collaborator[];
  licenseTerms?: LicenseTerms[];
  revenue?: number;
}

export const VideoPlayer = () => {
  const { user } = useDynamicContext();
  const isConnected = !!user;

  const [activeTab, setActiveTab] = useState<"all" | "your">("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { videos, loading } = useVideos();
  const { videoThumbnails, generateThumbnails } = useVideoThumbnails(videos);
  const { hoveredVideo, handleVideoHover, handleVideoHoverEnd, previewRefs } =
    useVideoHover();

  useEffect(() => {
    if (videos.length > 0) {
      generateThumbnails();
    }
  }, [videos, generateThumbnails]);

  const handleTabChange = (tab: "all" | "your") => {
    if (tab === "your" && !isConnected) return;
    setActiveTab(tab);
    setSelectedVideo(null);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const handleBackToGallery = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  const filteredVideos = getFilteredVideos(videos, activeTab);

  return (
    <div className="h-full overflow-y-scroll bg-slate-900/50">
      <VideoPlayerHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isConnected={isConnected}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {selectedVideo ? (
          <VideoDetailView
            video={selectedVideo}
            videoThumbnails={videoThumbnails}
            onBack={handleBackToGallery}
            onClose={handleCloseVideo}
          />
        ) : (
          <VideoGallery
            activeTab={activeTab}
            isConnected={isConnected}
            videos={filteredVideos}
            videoThumbnails={videoThumbnails}
            hoveredVideo={hoveredVideo}
            previewRefs={previewRefs}
            onVideoClick={handleVideoClick}
            onVideoHover={handleVideoHover}
            onVideoHoverEnd={handleVideoHoverEnd}
          />
        )}

        {selectedVideo && (
          <VideoSidebar
            videos={filteredVideos}
            selectedVideo={selectedVideo}
            videoThumbnails={videoThumbnails}
            hoveredVideo={hoveredVideo}
            previewRefs={previewRefs}
            onVideoClick={handleVideoClick}
            onVideoHover={handleVideoHover}
            onVideoHoverEnd={handleVideoHoverEnd}
          />
        )}
      </div>
    </div>
  );
};