import { useRef, useEffect } from "react";
import { Video } from "..";
import { Button } from "../../../ui/Button";
import { ArrowLeft, X, EyeOff } from "lucide-react";
import { VideoInfo } from "./VideoInfo";

interface VideoDetailViewProps {
  video: Video;
  videoThumbnails: { [key: string]: string };
  onBack: () => void;
  onClose: () => void;
}

export const VideoDetailView: React.FC<VideoDetailViewProps> = ({
  video,
  videoThumbnails,
  onBack,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }, 100);
  }, [video]);

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            className="text-slate-400 hover:text-white"
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white truncate">
              {video.metadata.name}
            </h3>
            {video.publication === "draft" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs border border-amber-500/30">
                <EyeOff size={12} />
                Draft
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={16} />}
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          Close
        </Button>
      </div>

      <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl mb-6 min-h-0">
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          className="w-full h-full object-scale-down"
          poster={video.thumbnailUrl || videoThumbnails[video.id]}
        />
      </div>

      <div className="h-48 flex-shrink-0">
        <VideoInfo video={video} />
      </div>
    </div>
  );
};
