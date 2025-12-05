import { useState } from "react";
import { FileVideo } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { VideoCard } from "./VideoCard";
import type { Video } from "../types";
import { VideoDetailView } from "../../video/components/VideoDetailView";

interface VideoGridProps {
  videos: Video[];
  loading: boolean;
  videoThumbnails: { [key: string]: string };
  onVideoSelect: (video: Video) => void;
  onShowRegisterModal: (show: boolean) => void;
  onShowLicenseModal: (show: boolean) => void;
  onTogglePublishStatus: (video: Video, status: "draft" | "published") => void;
  onDeleteVideo: (videoId: string) => void;
}

export function VideoGrid({
  videos,
  loading,
  videoThumbnails,
  onVideoSelect,
  onShowRegisterModal,
  onShowLicenseModal,
  onTogglePublishStatus,
  onDeleteVideo,
}: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleBackToGallery = () => {
    setSelectedVideo(null);
  };
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  const onSelectVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Loading videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileVideo className="mx-auto text-slate-400 mb-4" size={48} />
        <h3 className="text-lg text-slate-300 mb-2">No videos found</h3>
        <p className="text-slate-500 mb-4">
          Upload videos to start managing IP assets
        </p>
      </Card>
    );
  }

  return (
<div className="space-y-4">
  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
    <FileVideo size={16} className="text-cyan-400" />
    Your Video Assets ({videos.length})
  </h3>

  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {selectedVideo ? (
      // Full screen overlay
      <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm p-4 md:p-6 lg:p-8 overflow-auto">
       <div className="flex h-[calc(100vh-80px)]">
          <VideoDetailView
            video={selectedVideo}
            videoThumbnails={videoThumbnails}
            onBack={handleBackToGallery}
            onClose={handleCloseVideo}
          />
        </div>
      </div>
    ) : (
      videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          thumbnail={videoThumbnails[video.id]}
          onSelect={onVideoSelect}
          onShowRegisterModal={onShowRegisterModal}
          onShowLicenseModal={onShowLicenseModal}
          onTogglePublishStatus={onTogglePublishStatus}
          onDeleteVideo={onDeleteVideo}
          onSelectVideo={onSelectVideo}
        />
      ))
    )}
  </div>
</div>
  );
}
