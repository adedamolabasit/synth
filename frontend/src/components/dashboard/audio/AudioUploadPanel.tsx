import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Music,
  Loader2,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Settings,
  Text,
  FileText,
  Hash,
  Download,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { MusicPlayerPanel } from "./MusicPlayerPanel";
import { AudioFile, AudioUploadPanelProps } from "./types";
import { decodeGzippedBase64, formatTime } from "../../../shared/utils";
import { useAudio } from "../../../app/provider/AudioContext";

export function AudioUploadPanel({
  isCollapsed = false,
  onToggleCollapse,
  position = "left",
}: AudioUploadPanelProps) {
  const {
    currentAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    seekTo,
    setVolume,
    setPlaybackRate,
    toggleMute,
  } = useAudio();

  const [isDragging, setIsDragging] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null);
  const [decodedTranscript, setDecodedTranscript] = useState<string>("");
  const [decodedLyrics, setDecodedLyrics] = useState<string>("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [fetchError, setFetchError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simplified play/pause handler using the AudioContext
  const handlePlayPause = async (audioFile: AudioFile) => {
    try {
      if (currentAudio?._id === audioFile._id) {
        // Same audio - toggle play/pause
        if (isPlaying) {
          pauseAudio();
        } else {
          await resumeAudio();
        }
      } else {
        // New audio - play it
        await playAudio(audioFile);
      }
    } catch (error) {
      console.error("Playback error:", error);
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
    console.log("Files to upload:", files);
    setIsAnalyzing(true);
    setFetchError("");
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach(file => {
        formData.append("audio", file);
      });

      const response = await fetch("http://localhost:8000/api/v1/audio/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Upload response:", data);

      if (data.success) {
        // Refresh the library after successful upload
        await fetchAudioLibrary();
        setActiveTab("library");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFetchError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewDetails = async (audioFile: AudioFile) => {
    setSelectedAudio(audioFile);
    setIsDecoding(true);

    try {
      if (audioFile.transcript) {
        const transcript = await decodeGzippedBase64(audioFile.transcript);
        setDecodedTranscript(transcript);
      }

      if (audioFile.lyrics) {
        const lyrics = await decodeGzippedBase64(audioFile.lyrics);
        setDecodedLyrics(lyrics);
      }
    } catch (error) {
      console.error("Error decoding data:", error);
      setDecodedTranscript("Error decoding transcript");
      setDecodedLyrics("Error decoding lyrics");
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDownload = (audioFile: AudioFile) => {
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch audio library from server
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
      console.log("Fetched audio data:", data);

      if (data.success && Array.isArray(data.audio)) {
        const fetchedAudioFiles: AudioFile[] = data.audio.map(
          (audio: any) => ({
            ...audio,
            uploadedAt: new Date(audio.createdAt || audio.uploadedAt),
            // Ensure all required fields are present
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
            transcript: audio.transcript,
            lyrics: audio.lyrics,
            audioHash: audio.audioHash,
          })
        );
        setAudioFiles(fetchedAudioFiles);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching audio files:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load audio library");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fetch audio library on component mount and when tab changes to library
  useEffect(() => {
    if (activeTab === "library") {
      fetchAudioLibrary();
    }
  }, [activeTab]);

  // Collapsed state
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
      className="h-full flex flex-col gap-4 p-4 transition-all duration-300 ease-in-out animate-in slide-in-from-left"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="audio/*"
        multiple
        className="hidden"
      />

      {/* Header */}
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
            Audio Manager
          </h2>
        </div>
        
        {/* Refresh button for library */}
        {activeTab === "library" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAudioLibrary}
            disabled={isAnalyzing}
            icon={<Loader2 size={16} className={isAnalyzing ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
        )}
      </div>

      {/* Tabs */}
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

      {/* Error Display */}
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

      {/* Content based on active tab */}
      {activeTab === "upload" ? (
        <Card
          className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 animate-in fade-in-50 ${
            isDragging
              ? "border-cyan-500 bg-cyan-500/10 scale-[0.98] shadow-lg shadow-cyan-500/20"
              : "hover:scale-[0.995] hover:shadow-lg hover:shadow-cyan-500/10"
          }`}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-50">
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
          {/* Audio Files List */}
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
                      disabled={isLoading && currentAudio?._id === audioFile._id}
                    >
                      {isLoading && currentAudio?._id === audioFile._id ? (
                        <Loader2 className="text-cyan-400 animate-spin" size={16} />
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
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {audioFile.transcript && (
                          <Badge variant="success" size="sm">
                            <Text size={12} className="mr-1" />
                            Transcript
                          </Badge>
                        )}
                        {audioFile.lyrics && (
                          <Badge variant="info" size="sm">
                            <FileText size={12} className="mr-1" />
                            Lyrics
                          </Badge>
                        )}
                        {audioFile.audioHash && (
                          <Badge variant="default" size="sm">
                            <Hash size={12} className="mr-1" />
                            IPFS
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 text-slate-400 hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(audioFile);
                        }}
                      >
                        <Settings size={14} />
                      </Button>
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
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Music Player Component */}
          {currentAudio && (
            <MusicPlayerPanel
              currentAudio={currentAudio}
              onPlayPause={() => handlePlayPause(currentAudio)}
              isPlaying={isPlaying}
              isLoading={isLoading}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              onSeek={seekTo}
              onVolumeChange={setVolume}
              onPlaybackRateChange={setPlaybackRate}
              onToggleMute={toggleMute}
            />
          )}
        </div>
      )}

      {/* Audio Details Modal */}
      {selectedAudio && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileAudio className="text-cyan-400" size={24} />
                  Audio Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAudio(null);
                    setDecodedTranscript("");
                    setDecodedLyrics("");
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    File Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Name</p>
                      <p className="text-white">
                        {selectedAudio.metadata?.name || selectedAudio.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Size</p>
                      <p className="text-white">
                        {formatFileSize(
                          selectedAudio.metadata?.size || selectedAudio.size
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Type</p>
                      <p className="text-white">
                        {selectedAudio.metadata?.type || selectedAudio.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Uploaded</p>
                      <p className="text-white">
                        {formatDate(selectedAudio.uploadedAt)}
                      </p>
                    </div>
                    {selectedAudio.audioHash && (
                      <div className="col-span-2">
                        <p className="text-slate-400">IPFS Hash</p>
                        <p className="text-white font-mono text-xs break-all">
                          {selectedAudio.audioHash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcript */}
                {selectedAudio.transcript && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Text size={20} className="text-cyan-400" />
                      Transcript
                    </h4>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                      {isDecoding ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Decoding transcript...
                        </div>
                      ) : (
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">
                          {decodedTranscript || "No transcript available"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Lyrics */}
                {selectedAudio.lyrics && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-cyan-400" />
                      Lyrics
                    </h4>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                      {isDecoding ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Decoding lyrics...
                        </div>
                      ) : (
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">
                          {decodedLyrics || "No lyrics available"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => handlePlayPause(selectedAudio)}
                    className="flex-1"
                    disabled={isLoading}
                    icon={
                      isLoading && currentAudio?._id === selectedAudio._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : currentAudio?._id === selectedAudio._id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )
                    }
                  >
                    {isLoading && currentAudio?._id === selectedAudio._id
                      ? "Loading..."
                      : currentAudio?._id === selectedAudio._id && isPlaying
                      ? "Pause"
                      : "Play"}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleDownload(selectedAudio)}
                    className="flex-1"
                    icon={<Download size={16} />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}