import { useState, useRef, useEffect } from "react";
import {
  FileVideo,
  FileText,
  Clock,
  Play,
  Trash,
  Eye,
  Plus,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Switch } from "../../../components/ui/Switch";
import { formatFileSize, formatDate } from "../utils/formatter";
import type { Video } from "../types";
import { useIp } from "../../../provider/IpContext";

interface VideoCardProps {
  video: Video;
  thumbnail?: string;
  onSelect: (video: Video) => void;
  onShowRegisterModal: (show: boolean) => void;
  onShowLicenseModal: (show: boolean) => void;
  onTogglePublishStatus: (video: Video, status: "draft" | "published") => void;
  onDeleteVideo: (videoId: string) => void;
  onSelectVideo: (video: Video) => void;
}

export function VideoCard({
  video,
  thumbnail,
  onSelect,
  onShowRegisterModal,
  onShowLicenseModal,
  onTogglePublishStatus,
  onDeleteVideo,
  onSelectVideo,
}: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const { setIpId } = useIp();

  useEffect(() => {
    const videoElement = previewRef.current;
    if (!videoElement) return;

    const handleCanPlay = () => setCanPlay(true);
    const handleError = () => setCanPlay(false);

    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);

  const handleVideoHover = () => {
    setHovered(true);

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Delay video play slightly to ensure smooth transition
    hoverTimeoutRef.current = setTimeout(() => {
      if (previewRef.current && canPlay) {
        previewRef.current.currentTime = 0;
        previewRef.current.play().catch((error) => {
          console.log("Auto-play prevented:", error);
          // Fallback: show thumbnail if video can't play
          setHovered(false);
        });
      }
    }, 100);
  };

  const handleVideoHoverEnd = () => {
    setHovered(false);

    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getStatusBadgeVariant = () => {
    if (video.ipRegistration?.status === "notRegistered") return "default";
    return video.publication === "published" ? "success" : "warning";
  };

  const getStatusBadgeText = () => {
    if (video.ipRegistration?.status === "notRegistered")
      return "Not Registered";
    return video.publication;
  };

  const getIpBadgeVariant = () => {
    return video.ipRegistration?.status === "registered"
      ? "success"
      : "default";
  };

  const getIpBadgeText = () => {
    return video.ipRegistration?.status === "registered"
      ? "IP Registered"
      : "IP Not Registered";
  };

  const handleViewLicense = () => {
    onSelect(video);
    onShowLicenseModal(true);
    console.log(video, "video>>");
    if (video.ipRegistration?.ipId) {
      setIpId(video.ipRegistration?.ipId);
    } else {
      setIpId("");
    }
  };

  const handleAttachLicense = () => {
    onSelect(video);
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
      onMouseEnter={handleVideoHover}
      onMouseLeave={handleVideoHoverEnd}
    >
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {/* Always render video element but control visibility and play state */}
        <video
          ref={previewRef}
          src={video.videoUrl}
          muted
          loop
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hovered && canPlay ? "opacity-100" : "opacity-0"
          }`}
          playsInline
          preload="metadata"
          onLoadStart={() => setCanPlay(false)}
          onLoadedData={() => setCanPlay(true)}
        />

        {/* Thumbnail/fallback - always visible when video isn't playing */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            hovered && canPlay ? "opacity-0" : "opacity-100"
          }`}
        >
          {video.thumbnailUrl || thumbnail ? (
            <img
              src={video.thumbnailUrl || thumbnail}
              alt={video.metadata.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <FileVideo
                className="text-slate-400 group-hover:text-blue-400 transition-colors"
                size={48}
              />
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant={getIpBadgeVariant()} size="sm">
            {getIpBadgeText()}
          </Badge>

          {video.ipRegistration?.status === "registered" && (
            <Badge variant={getStatusBadgeVariant()} size="sm">
              {getStatusBadgeText()}
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
            <Play
              onClick={() => onSelectVideo(video)}
              className="text-slate-800"
              size={24}
              fill="currentColor"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="w-full flex justify-between mb-4">
          <h4 className="font-semibold text-white text-sm line-clamp-2 mb-2">
            {video.metadata.name}
          </h4>
          <div className="flex gap-2">
            {/* {video.ipRegistration?.status === "registered" && ( */}
            <div className="flex items-center space-x-3">
              <Switch
                checked={video.publication === "published"}
                onChange={(val) =>
                  onTogglePublishStatus(video, val ? "published" : "draft")
                }
              />
              <span className="text-sm font-medium text-cyan-400">
                {video.publication === "published" ? "Published" : "Draft"}
              </span>
            </div>
            {/* )} */}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteVideo(video.id);
              }}
              className="text-red-600"
            >
              <Trash size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-400 mb-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(video.createdAt)}
            </span>
            <span>{formatFileSize(video.metadata.size)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {video.ipRegistration?.status === "registered" ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewLicense();
                }}
              >
                <FileText size={14} />
                View License
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttachLicense();
                }}
              >
                <Plus size={14} />
                Attach
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(video.videoUrl, "_blank");
                }}
              >
                <Eye size={14} />
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(video);
                onShowRegisterModal(true);
              }}
            >
              Register IP
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
