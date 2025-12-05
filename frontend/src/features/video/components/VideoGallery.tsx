import { Video } from "..";
import { VideoCard } from "./VideoCard";
import { EmptyState } from "./EmptyState";
import { Lock } from "lucide-react";
import { Button } from "../../../components/ui/Button";


interface VideoGalleryProps {
  activeTab: "all" | "your";
  isConnected: boolean;
  videos: Video[];
  videoThumbnails: { [key: string]: string };
  hoveredVideo: string | null;
  previewRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
  onVideoClick: (video: Video) => void;
  onVideoHover: (videoId: string) => void;
  onVideoHoverEnd: (videoId: string) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  activeTab,
  isConnected,
  videos,
  videoThumbnails,
  hoveredVideo,
  previewRefs,
  onVideoClick,
  onVideoHover,
  onVideoHoverEnd
}) => {
  if (activeTab === "your" && !isConnected) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="text-center py-12">
          <Lock className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-lg text-slate-300 mb-2">Connect Your Wallet</h3>
          <p className="text-slate-500 mb-4">
            Please connect your wallet to view your uploaded videos
          </p>
          <Button variant="primary">Connect Wallet</Button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <EmptyState activeTab={activeTab} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            thumbnailUrl={video.thumbnailUrl || videoThumbnails[video.id]}
            isHovered={hoveredVideo === video.id}
            previewRef={previewRefs.current[video.id]}
            onVideoClick={onVideoClick}
            onVideoHover={onVideoHover}
            onVideoHoverEnd={onVideoHoverEnd}
            size="large"
          />
        ))}
      </div>
    </div>
  );
};