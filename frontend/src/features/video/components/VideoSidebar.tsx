import { VideoCard } from "./VideoCard";
import { Video } from ".";

interface VideoSidebarProps {
  videos: Video[];
  selectedVideo: Video;
  videoThumbnails: { [key: string]: string };
  hoveredVideo: string | null;
  previewRefs: React.MutableRefObject<{
    [key: string]: HTMLVideoElement | null;
  }>;
  onVideoClick: (video: Video) => void;
  onVideoHover: (videoId: string) => void;
  onVideoHoverEnd: (videoId: string) => void;
}

export const VideoSidebar: React.FC<VideoSidebarProps> = ({
  videos,
  selectedVideo,
  videoThumbnails,
  hoveredVideo,
  previewRefs,
  onVideoClick,
  onVideoHover,
  onVideoHoverEnd,
}) => {
  const otherVideos = videos.filter((video) => video.id !== selectedVideo.id);

  return (
    <div className="w-80 border-l border-slate-800/50 bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
      <div className="p-4 border-b border-slate-800/50">
        <h4 className="text-lg font-semibold text-white mb-2">
          More Videos ({otherVideos.length})
        </h4>
        <p className="text-slate-400 text-sm">Click any video to play</p>
      </div>

      <div className="p-4 space-y-4">
        {otherVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            thumbnailUrl={video.thumbnailUrl || videoThumbnails[video.id]}
            isHovered={hoveredVideo === video.id}
            previewRef={previewRefs.current[video.id]}
            onVideoClick={onVideoClick}
            onVideoHover={onVideoHover}
            onVideoHoverEnd={onVideoHoverEnd}
            size="small"
          />
        ))}
      </div>
    </div>
  );
};
