import React from "react";
import { Video } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface ModalsProps {
  showDownloadModal: boolean;
  videoName: string;
  isUploading: boolean;
  videoBlob: Blob | null;
  onSaveVideo: () => void;
  onCloseModal: () => void;
  onVideoNameChange: (name: string) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  showDownloadModal,
  videoName,
  isUploading,
  videoBlob,
  onSaveVideo,
  onCloseModal,
  onVideoNameChange,
}) => {
  if (!showDownloadModal) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900/90 border border-slate-700 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onCloseModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          ✕
        </button>

        <Video size={48} className="mx-auto mb-4 text-slate-400" />

        <h3 className="text-xl font-semibold text-white text-center mb-2">
          Save Video
        </h3>

        <p className="text-slate-300 text-center mb-4">
          Save your video to watch later in your media.
        </p>

        <input
          type="text"
          className="w-full rounded-lg p-2 mb-6 text-black"
          value={videoName}
          onChange={(e) => onVideoNameChange(e.target.value)}
          placeholder="Enter video name"
        />

        <div className="space-y-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onSaveVideo}
            disabled={isUploading || !videoBlob}
            className={`w-full ${
              isUploading
                ? "bg-gray-600 hover:bg-gray-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUploading ? "Saving..." : "Save Visualizer Output"}
          </Button>
        </div>
      </div>
    </div>
  );
};
