import { useState, useEffect, useRef } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { VideoPlayerHeader } from "./components/VideoPlayerHeader";
import { VideoGallery } from "./components/VideoGallery";
import { VideoDetailView } from "./components/VideoDetailView";
import { VideoSidebar } from "./components/VideoSidebar";
import { LoadingState } from "./components/LoadingState";
import { useVideos } from "./hooks/useVideos";
import { useVideoThumbnails } from "./hooks/useVideoThumbnails";
import { useVideoHover } from "./hooks/useVideoHover";
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


export const VideoPlayer = () => {
  const { user, primaryWallet } = useDynamicContext();
  const isConnected = !!user;
  const walletAddress = primaryWallet?.address;

  const [activeTab, setActiveTab] = useState<"all" | "your">("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { videos, loading} = useVideos(
    activeTab,
    isConnected,
    walletAddress
  );
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

// Helper function
const getFilteredVideos = (videos: Video[], activeTab: "all" | "your") => {
  if (activeTab === "all") {
    return videos.filter((video) => video.publication === "published");
  } else {
    return videos;
  }
};
