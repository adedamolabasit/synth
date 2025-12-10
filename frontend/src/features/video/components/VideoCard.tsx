import { Video } from ".";
import { Card } from "../../../components/ui/Card";
import {
  Play,
  FileVideo,
  EyeOff,
  Clock,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import {
  formatFileSize,
  formatDate,
  formatDuration,
} from "../utils/videoUtils";
import { useState } from "react";

interface VideoCardProps {
  video: Video;
  thumbnailUrl?: string;
  isHovered: boolean;
  previewRef: HTMLVideoElement | null;
  onVideoClick: (video: Video) => void;
  onVideoHover: (videoId: string) => void;
  onVideoHoverEnd: (videoId: string) => void;
  size?: "large" | "small";
  onLike?: (videoId: string, liked: boolean) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  thumbnailUrl,
  isHovered,
  previewRef,
  onVideoClick,
  onVideoHover,
  onVideoHoverEnd,
  size = "large",
  onLike,
  onComment,
  onShare,
}) => {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likeCount, setLikeCount] = useState(video.likes || 0);

  const handleClick = () => onVideoClick(video);
  const handleMouseEnter = () => onVideoHover(video.id);
  const handleMouseLeave = () => onVideoHoverEnd(video.id);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    if (onLike) {
      onLike(video.id, newLikedState);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(video.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(video.id);
    }
  };

  const cardClass =
    size === "large"
      ? "overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
      : "overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300";

  const playButtonSize = size === "large" ? 24 : 16;
  const playButtonContainerSize = size === "large" ? "w-16 h-16" : "w-10 h-10";
  const draftBadgeSize =
    size === "large"
      ? "top-2 left-2 text-xs px-2 py-1"
      : "top-1 left-1 text-xs px-1 py-0.5";
  const durationBadgeSize =
    size === "large"
      ? "bottom-2 right-2 text-xs px-2 py-1"
      : "bottom-1 right-1 text-xs px-1 py-0.5";
  const contentPadding = size === "large" ? "p-4" : "p-3";
  const titleSize = size === "large" ? "text-sm" : "text-xs";
  const iconSize = size === "large" ? 14 : 12;
  const interactionIconSize = size === "large" ? 16 : 14;

  return (
    <Card
      className={cardClass}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {isHovered ? (
          <video
            ref={(el) => {
              if (el) previewRef = el;
            }}
            src={video.videoUrl}
            muted
            loop
            className="w-full h-full object-cover"
            playsInline
          />
        ) : (
          <>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video.metadata.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <FileVideo
                  className="text-slate-400 group-hover:text-blue-400 transition-colors"
                  size={size === "large" ? 48 : 24}
                />
              </div>
            )}
          </>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div
            className={`${playButtonContainerSize} bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 ${
              size === "large" ? "shadow-2xl" : ""
            }`}
          >
            <Play
              className="text-slate-800"
              size={playButtonSize}
              fill="currentColor"
            />
          </div>
        </div>

        {video.publication === "draft" && (
          <div
            className={`absolute ${draftBadgeSize} bg-amber-500/90 text-amber-50 rounded flex items-center gap-1`}
          >
            <EyeOff size={size === "large" ? 10 : 8} />
            Draft
          </div>
        )}

        {video.metadata.duration && (
          <div
            className={`absolute ${durationBadgeSize} bg-black/80 text-white rounded`}
          >
            {formatDuration(video.metadata.duration)}
          </div>
        )}
      </div>

      <div className={contentPadding}>
        <h3
          className={`font-semibold text-white mb-3 line-clamp-2 leading-tight ${titleSize}`}
        >
          {video.metadata.name}
        </h3>

        {/* Compact Interaction Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Like"
            >
              <Heart
                size={interactionIconSize}
                className={isLiked ? "fill-red-500 text-red-500" : ""}
              />
              <span className="text-xs">{likeCount}</span>
            </button>

            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
              title="Comments"
            >
              <MessageCircle size={interactionIconSize} />
              <span className="text-xs">{video.comments}</span>
            </button>
          </div>

          <button
            onClick={handleShareClick}
            className="text-slate-400 hover:text-green-400 transition-colors"
            title="Share"
          >
            <Share2 size={interactionIconSize} />
          </button>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <FileVideo size={iconSize} />
            {formatFileSize(video.metadata.size)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={iconSize} />
            {formatDate(video.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
};
