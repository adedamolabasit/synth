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
  Sparkles,
  Lock,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useAudio } from "../../../provider/AudioContext";
import { AudioUploadPanelProps } from "../../../shared/types/audio.types";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUploadAudio } from "../../../shared/hooks/useUploadAudio";
import { useGetAudioByWallet } from "../../../shared/hooks/useGetAudioByWallet";

export function AudioUploadPanel({
  isCollapsed = false,
  onToggleCollapse,
  position = "left",
}: AudioUploadPanelProps) {
  const { currentAudio, isPlaying, playAudio, pauseAudio, resumeAudio } =
    useAudio();

  const { user, setShowAuthFlow, primaryWallet } = useDynamicContext();
  const isConnected = !!user;

  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && primaryWallet?.address) {
      setWalletAddr(primaryWallet.address);
    } else {
      setWalletAddr(null);
    }
  }, [isConnected, primaryWallet]);

  const [isDragging, setIsDragging] = useState(false);
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [fetchError, setFetchError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAudioMutation = useUploadAudio();
  const {
    data: audioData,
    isLoading: isAudioLoading,
    error: audioError,
    refetch: refetchAudio,
  } = useGetAudioByWallet(walletAddr || "");

  useEffect(() => {
    if (audioData?.success && Array.isArray(audioData.audio)) {
      const mappedAudio = audioData.audio.map((audio: any) => ({
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
      setAudioFiles(mappedAudio);
    }
  }, [audioData]);

  useEffect(() => {
    if (audioError) {
      setFetchError(
        audioError instanceof Error
          ? audioError.message
          : "Failed to load audio library"
      );
    }
  }, [audioError]);

  useEffect(() => {
    if (audioFiles.length > 0) {
      setActiveTab("library");
    } else {
      setActiveTab("upload");
    }
  }, [audioFiles.length]);

  const handleFileInputClick = () => {
    if (!isConnected) {
      setShowAuthFlow(true);
      return;
    }

    if (fileInputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.multiple = true;
      input.style.display = "none";

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const files = Array.from(target.files || []).filter((f) =>
          f.type.startsWith("audio/")
        );
        if (files.length > 0) {
          handleFiles(files);
        }
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    }
  };

  const handleConnectWallet = () => {
    setShowAuthFlow(true);
  };

  const handlePlayPause = async (audioFile: any) => {
    if (!isConnected) {
      setShowAuthFlow(true);
      return;
    }

    try {
      if (currentAudio?._id === audioFile._id) {
        if (isPlaying) pauseAudio();
        else await resumeAudio();
      } else {
        await playAudio(audioFile);
      }
    } catch (error) {}
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isConnected) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    if (!isConnected) return;
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("audio/")
    );
    if (files.length > 0) handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isConnected) return;
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("audio/")
    );
    if (files.length > 0) handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (!isConnected || !walletAddr) return;

    setIsUploading(true);
    setUploadProgress(0);
    setFetchError("");

    try {
      for (const file of files) {
        if (file.size > 30 * 1024 * 1024) {
          setFetchError(`File "${file.name}" exceeds 30MB limit`);
          setIsUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("audio", file);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const result = await uploadAudioMutation.mutateAsync({
          wallet: walletAddr,
          formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await refetchAudio();

      setFetchError("");
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (audioFile: any) => {
    if (!isConnected) {
      setShowAuthFlow(true);
      return;
    }
    const link = document.createElement("a");
    link.href = audioFile.audioUrl || audioFile.url;
    link.download = audioFile.name;
    link.click();
  };

  const formatFileSize = (bytes: number) =>
    bytes ? (bytes / 1024 / 1024).toFixed(2) + " MB" : "Unknown size";

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleManualRefresh = async () => {
    if (!isConnected || !walletAddr) return;
    setIsAnalyzing(true);
    try {
      await refetchAudio();
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddr) {
      setIsAnalyzing(isAudioLoading);
    } else {
      setAudioFiles([]);
      setActiveTab("upload");
    }
  }, [isConnected, walletAddr, isAudioLoading]);

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
        disabled={isUploading || !isConnected}
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
        {isConnected && audioFiles.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-cyan-400"
            onClick={handleManualRefresh}
            disabled={isUploading || isAnalyzing}
            title="Refresh library"
          >
            <Loader2
              className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
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
          disabled={isUploading || !isConnected}
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
          onClick={() => {
            if (!isConnected) setShowAuthFlow(true);
            else {
              setActiveTab("library");
              handleManualRefresh();
            }
          }}
          disabled={isUploading || !isConnected}
        >
          Library ({audioFiles.length})
        </Button>
      </div>

      {!isConnected && (
        <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-800/50 border-slate-700/50">
          <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <Lock className="text-slate-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 text-center">
            Connect Your Wallet
          </h3>
          <p className="text-slate-400 text-center mb-4">
            Please connect your wallet to access audio upload and library
            features
          </p>
          <Button
            variant="primary"
            onClick={handleConnectWallet}
            className="flex items-center gap-2"
          >
            Connect Wallet
          </Button>
        </Card>
      )}

      {isConnected && (
        <>
          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{fetchError}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  className="text-red-400 hover:text-red-300"
                  disabled={isUploading}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFetchError("")}
                  className="text-slate-400 hover:text-slate-300"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {activeTab === "upload" ? (
            <Card
              className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
                isDragging && !isUploading
                  ? "border-cyan-500 bg-cyan-500/10 scale-[0.98] shadow-lg shadow-cyan-500/20"
                  : isUploading
                  ? "border-purple-500 bg-purple-500/10"
                  : "hover:scale-[0.995] hover:shadow-lg hover:shadow-cyan-500/10"
              } ${
                isUploading ? "cursor-not-allowed opacity-80" : "cursor-pointer"
              }`}
              onClick={() => !isUploading && handleFileInputClick()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <div className="flex items-center gap-3 text-purple-400">
                    <Sparkles className="animate-pulse" size={32} />
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-purple-300 font-medium mb-2">
                      AI Analysis in Progress
                    </p>
                    <p className="text-slate-400 text-sm">
                      Extracting music elements like lyrics, effects, and
                      patterns...
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      This may take a moment while our AI processes your audio
                    </p>
                  </div>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="text-cyan-400 animate-spin" size={48} />
                  <p className="text-slate-300">Processing audio...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-slate-700/50">
                    <Upload className="text-cyan-400" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 text-center">
                    Drop your audio file
                  </h3>
                  <p className="text-slate-400 text-center mb-2">
                    Support for MP3, WAV, FLAC, OGG
                  </p>
                  <p className="text-slate-500 text-center text-sm mb-4">
                    Max file size: 30MB • AI-powered music analysis
                  </p>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileInputClick();
                    }}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Browse Files"}
                  </Button>
                </>
              )}
            </Card>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {isAnalyzing && audioFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="animate-spin" size={32} />
                  <p>Loading audio library...</p>
                </div>
              ) : audioFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Music size={48} />
                  <p>No audio files found</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab("upload")}
                    disabled={isUploading}
                  >
                    Upload your first file
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-xs text-slate-500 flex justify-between items-center"></div>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {audioFiles.map((audioFile) => (
                      <Card
                        key={audioFile._id}
                        className={`p-3 transition-all duration-300 cursor-pointer group relative ${
                          currentAudio?._id === audioFile._id
                            ? "border-2 border-cyan-500 bg-cyan-500/15 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                            : "border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-cyan-500/5"
                        } ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() =>
                          !isUploading && handlePlayPause(audioFile)
                        }
                      >
                        {currentAudio?._id === audioFile._id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l-md" />
                        )}

                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-8 h-8 p-0 rounded-full transition-all ${
                              currentAudio?._id === audioFile._id
                                ? "bg-cyan-500/50"
                                : "bg-slate-700/50 hover:bg-slate-600/50"
                            }`}
                          >
                            {currentAudio?._id === audioFile._id &&
                            isPlaying ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </Button>
                          <div className="flex-1 flex flex-col">
                            <p className="text-white font-medium text-sm truncate">
                              {audioFile.name}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {formatFileSize(audioFile.size)} •{" "}
                              {formatDate(audioFile.uploadedAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-cyan-400 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(audioFile);
                            }}
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
