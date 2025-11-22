import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Music,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { useAudio } from "../../../provider/AudioContext";
import { AudioUploadPanelProps } from "../../../shared/types/audio.types";

export function AudioUploadPanel({
  isCollapsed = false,
  onToggleCollapse,
  position = "left",
}: AudioUploadPanelProps) {
  const {
    currentAudio,
    isPlaying,
    isLoading,
    playAudio,
    pauseAudio,
    resumeAudio,
  } = useAudio();

  const [isDragging, setIsDragging] = useState(false);
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [fetchError, setFetchError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioFiles.length > 0) {
      setActiveTab("library");
    } else {
      setActiveTab("upload");
    }
  }, [audioFiles.length]);

  const handlePlayPause = async (audioFile: any) => {
    try {
      if (currentAudio?._id === audioFile._id) {
        if (isPlaying) {
          pauseAudio();
        } else {
          await resumeAudio();
        }
      } else {
        await playAudio(audioFile);
      }
    } catch (error) {
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter((f) => f.type.startsWith("audio/"));
    if (audioFiles.length > 0) {
      handleFiles(audioFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter((f) => f.type.startsWith("audio/"));
    if (audioFiles.length > 0) {
      handleFiles(audioFiles);
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsAnalyzing(true);
    setFetchError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("audio", file);
      });

      const response = await fetch(
        "http://localhost:8000/api/v1/audio/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchAudioLibrary();
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = (audioFile: any) => {
    const link = document.createElement("a");
    link.href = audioFile.audioUrl || audioFile.url;
    link.download = audioFile.name;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchAudioLibrary = async () => {
    setIsAnalyzing(true);
    setFetchError("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/audio", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.audio)) {
        const fetchedAudioFiles = data.audio.map((audio: any) => ({
          ...audio,
          uploadedAt: new Date(audio.createdAt || audio.uploadedAt),
          _id: audio._id || audio.id,
          name: audio.name || audio.metadata?.name || "Unknown",
          url: audio.url || audio.audioUrl,
          audioUrl: audio.audioUrl || audio.url,
          metadata: audio.metadata || {
            name: audio.name,
            size: audio.size,
            type: audio.type,
          },
          size: audio.size || audio.metadata?.size,
          type: audio.type || audio.metadata?.type,
        }));
        setAudioFiles(fetchedAudioFiles);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching audio files:", err);
      setFetchError(
        err instanceof Error ? err.message : "Failed to load audio library"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchAudioLibrary();
  }, []);

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <Button
          variant="ghost"
          className="w-10 h-10 p-0 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300 hover:scale-105"
          onClick={onToggleCollapse}
        >
          {position === "left" ? (
            <ChevronRight className="text-cyan-400" size={20} />
          ) : (
            <ChevronLeft className="text-cyan-400" size={20} />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-4 p-4 transition-all duration-300 ease-in-out"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="audio/*"
        multiple
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-slate-700/50 transition-all duration-200"
            onClick={onToggleCollapse}
          >
            {position === "left" ? (
              <ChevronLeft className="text-slate-400" size={16} />
            ) : (
              <ChevronRight className="text-slate-400" size={16} />
            )}
          </Button>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music className="text-cyan-400" size={20} />
            Audio Player
          </h2>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${
            activeTab === "upload"
              ? "bg-slate-700/50 text-cyan-400"
              : "text-slate-400"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${
            activeTab === "library"
              ? "bg-slate-700/50 text-cyan-400"
              : "text-slate-400"
          }`}
          onClick={() => setActiveTab("library")}
        >
          Library ({audioFiles.length})
        </Button>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{fetchError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAudioLibrary}
            className="mt-2 text-red-400 hover:text-red-300"
          >
            Try Again
          </Button>
        </div>
      )}

      {activeTab === "upload" ? (
        <Card
          className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
            isDragging
              ? "border-cyan-500 bg-cyan-500/10 scale-[0.98] shadow-lg shadow-cyan-500/20"
              : "hover:scale-[0.995] hover:shadow-lg hover:shadow-cyan-500/10"
          }`}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-cyan-400 animate-spin" size={48} />
              <p className="text-slate-300">Uploading audio...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-slate-700/50">
                <Upload className="text-cyan-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                Drop your audio file
              </h3>
              <p className="text-slate-400 text-center mb-6">
                Support for MP3, WAV, FLAC, OGG
              </p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Uploading..." : "Browse Files"}
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3">
            {isAnalyzing && audioFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={32} />
                <p>Loading audio library...</p>
              </div>
            ) : audioFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Music size={48} />
                <p>No audio files found</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("upload")}
                >
                  Upload your first file
                </Button>
              </div>
            ) : (
              audioFiles.map((audioFile) => (
                <Card
                  key={audioFile._id}
                  className={`p-3 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 ${
                    currentAudio?._id === audioFile._id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : ""
                  }`}
                  onClick={() => handlePlayPause(audioFile)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30"
                      disabled={
                        isLoading && currentAudio?._id === audioFile._id
                      }
                    >
                      {isLoading && currentAudio?._id === audioFile._id ? (
                        <Loader2
                          className="text-cyan-400 animate-spin"
                          size={16}
                        />
                      ) : currentAudio?._id === audioFile._id && isPlaying ? (
                        <Pause className="text-cyan-400" size={16} />
                      ) : (
                        <Play className="text-cyan-400" size={16} />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {audioFile.metadata?.name || audioFile.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400">
                          {formatFileSize(
                            audioFile.metadata?.size || audioFile.size
                          )}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {formatDate(audioFile.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 text-slate-400 hover:text-green-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(audioFile);
                      }}
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
