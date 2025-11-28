import { useState, useRef } from "react";
import {
  FileVideo,
  Users,
  FileText,
  DollarSign,
  Clock,
  Play,
  Trash,
  Eye,
} from "lucide-react";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";
import { Switch } from "../../../ui/Switch";
import { formatFileSize, formatDate } from "../utils/formatter";
import type { Video } from "../types";

interface VideoCardProps {
  video: Video;
  thumbnail?: string;
  onSelect: (video: Video) => void;
  onShowRegisterModal: (show: boolean) => void;
  onShowLicenseModal: (show: boolean) => void;
  onTogglePublishStatus: (video: Video, status: "draft" | "published") => void;
  onDeleteVideo: (videoId: string) => void;
}

export function VideoCard({
  video,
  thumbnail,
  onSelect,
  onShowRegisterModal,
  onShowLicenseModal,
  onTogglePublishStatus,
  onDeleteVideo,
}: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);

  const handleVideoHover = () => {
    setHovered(true);
    if (previewRef.current) {
      previewRef.current.currentTime = 0;
      previewRef.current.play().catch(() => {});
    }
  };

  const handleVideoHoverEnd = () => {
    setHovered(false);
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  };

  const getBadgeVariant = () => {
    if (video.ipRegistration?.status === 'notRegistered') return "default";
    return video.publication === "published" ? "success" : "warning";
  };
  console.log(video, "ll");

  const getBadgeText = () => {
    if (video.ipRegistration?.status === 'notRegistered') return "Not Registered";
    return video.publication;
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
      onMouseEnter={handleVideoHover}
      onMouseLeave={handleVideoHoverEnd}
    >
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {hovered ? (
          <video
            ref={previewRef}
            src={video.videoUrl}
            muted
            loop
            className="w-full h-full object-cover"
            playsInline
          />
        ) : (
          <>
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
          </>
        )}

        <div className="absolute top-2 left-2">
          <Badge variant={getBadgeVariant()} size="sm">
            {getBadgeText()}
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
            <Play className="text-slate-800" size={24} fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="w-full flex justify-between mb-4">
          <h4 className="font-semibold text-white text-sm line-clamp-2 mb-2">
            {video.metadata.name}
          </h4>
          <div className="flex gap-2">
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteVideo(video.id)}
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

          {video.collaborators && video.collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{video.collaborators.length} collaborator(s)</span>
            </div>
          )}

          {video.licenseTerms && video.licenseTerms.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText size={12} />
              <span>{video.licenseTerms.length} license(s)</span>
            </div>
          )}

          {video.revenue && video.revenue > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span>${video.revenue} revenue</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {video.ipRegistration?.status === "registered" ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onSelect(video);
                  onShowLicenseModal(true);
                }}
              >
                <FileText size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(video.videoUrl, "_blank")}
              >
                <Eye size={14} />
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => {
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
