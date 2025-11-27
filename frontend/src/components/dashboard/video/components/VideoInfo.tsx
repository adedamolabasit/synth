import { Button } from "../../../ui/Button";
import { Card } from "../../../ui/Card";
import { Video } from "..";
import { Download, Eye } from "lucide-react";
import { formatFileSize, formatDate, formatDuration } from "../utils/videoUtils";

interface VideoInfoProps {
  video: Video;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h4 className="text-lg font-semibold text-white">Video Information</h4>
      </div>
      <div className="flex-1 p-4 bg-slate-800/50 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Status:</span>
            <span className={`text-sm font-medium ${
              video.publication === "published" 
                ? "text-green-400" 
                : "text-amber-400"
            }`}>
              {video.publication === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Size:</span>
            <span className="text-white text-sm">
              {formatFileSize(video.metadata.size)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Type:</span>
            <span className="text-white text-sm uppercase">
              {video.metadata.type.split("/")[1]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Duration:</span>
            <span className="text-white text-sm">
              {formatDuration(video.metadata.duration)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Uploaded:</span>
            <span className="text-white text-sm">
              {formatDate(video.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Wallet:</span>
            <span className="text-white text-sm font-mono">
              {video.walletAddress.slice(0, 8)}...
              {video.walletAddress.slice(-6)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <h5 className="text-sm font-medium text-slate-300 mb-2">IPFS Hash</h5>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <code className="text-xs text-slate-300 break-all">
              {video.videoHash}
            </code>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            className="flex-1"
            icon={<Download size={16} />}
            onClick={() => window.open(video.videoUrl, "_blank")}
          >
            Download
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={<Eye size={16} />}
            onClick={() => window.open(video.videoUrl, "_blank")}
          >
            View Original
          </Button>
        </div>
      </div>
    </Card>
  );
};