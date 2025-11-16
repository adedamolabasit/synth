import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Music,
  Wand2,
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
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { moods, genres, instrumentOptions, styles } from "./config";
import {
  AudioFile,
  AIGenerationParams,
  AIGenerationResponse,
  AudioUploadPanelProps,
} from "./types";
import { decodeGzippedBase64, formatTime } from "../../../shared/utils";

export function AudioUploadPanel({
  isCollapsed = false,
  onToggleCollapse,
  position = "left",
}: AudioUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null);
  const [decodedTranscript, setDecodedTranscript] = useState<string>("");
  const [decodedLyrics, setDecodedLyrics] = useState<string>("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Audio playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [generationParams, setGenerationParams] = useState<AIGenerationParams>({
    prompt: "",
    duration: 30,
    genre: "electronic",
    mood: "energetic",
    instruments: ["synth", "drums"],
    bpm: 120,
    style: "modern",
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    setIsLoading(false);
    setIsPlaying(false);
  };

  // Playback control functions
  const handlePlayPause = async (audioFile?: AudioFile) => {
    const targetAudio = audioFile || currentAudio;
    if (!targetAudio) return;

    if (!audioRef.current) return;

    if (audioFile && currentAudio?._id !== audioFile._id) {
      setCurrentAudio(targetAudio);
      setIsLoading(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = getAudioSource(targetAudio);
          audioRef.current.load();
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(console.error);
        }
      }, 0);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play failed:", error);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipBack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const volumeBar = e.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));

    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;

    if (newMuted) {
      setVolume(0);
    } else {
      setVolume(audioRef.current.volume || 1);
    }
  };

  const changePlaybackRate = () => {
    if (!audioRef.current) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    setPlaybackRate(newRate);
    audioRef.current.playbackRate = newRate;
  };

  // AI Generation Functions
  const handleAIGenerate = async () => {
    if (!generationParams.prompt.trim()) {
      alert("Please enter a prompt for AI generation");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Starting generation...");

    try {
      // Prepare the request data with all parameters
      const requestData = {
        prompt: generationParams.prompt,
        duration: generationParams.duration,
        genre: generationParams.genre,
        mood: generationParams.mood,
        instruments: generationParams.instruments,
        bpm: generationParams.bpm,
        style: generationParams.style,
        temperature: generationParams.temperature,
        top_p: generationParams.topP,
        top_k: generationParams.topK,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending AI generation request:", requestData);

      setGenerationStatus("Connecting to AI service...");

      // Call your backend API endpoint
      const response = await fetch(
        "http://localhost:8000/api/v1/generate-music",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      setGenerationStatus("Processing your request...");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: AIGenerationResponse = await response.json();

      if (result.success && result.audio) {
        setGenerationStatus("Generation completed successfully!");

        // Add the generated audio to the library
        const generatedAudio: AudioFile = {
          ...result.audio,
          uploadedAt: new Date(result.audio.createdAt || new Date()),
        };

        setAudioFiles((prev) => [generatedAudio, ...prev]);
        setCurrentAudio(generatedAudio);
        setActiveTab("library");
        setShowAIModal(false);

        // Reset form for next generation
        setGenerationParams({
          prompt: "",
          duration: 30,
          genre: "electronic",
          mood: "energetic",
          instruments: ["synth", "drums"],
          bpm: 120,
          style: "modern",
          temperature: 0.7,
          topP: 0.9,
          topK: 50,
        });

        // Show success message
        setTimeout(() => {
          setGenerationStatus("");
        }, 3000);
      } else {
        throw new Error(result.error || "Generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      setGenerationStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      // Keep the error message visible for a while
      setTimeout(() => {
        setGenerationStatus("");
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    setGenerationParams((prev) => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter((i) => i !== instrument)
        : [...prev.instruments, instrument],
    }));
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
    console.log(files);
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAnalyzing(false);
    setActiveTab("library");
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

  const getAudioSource = (audioFile: AudioFile) => {
    return audioFile.audioUrl || audioFile.url;
  };

  const fetchAudioLibrary = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/audio", {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched audio data:", data);

      if (data.success && Array.isArray(data.audio)) {
        const fetchedAudioFiles: AudioFile[] = data.audio.map(
          (audio: AudioFile) => ({
            ...audio,
            uploadedAt: new Date(audio.createdAt),
          })
        );
        setAudioFiles(fetchedAudioFiles);
      }
    } catch (err) {
      console.error("Error fetching audio files:", err);
    } finally {
      setIsAnalyzing(false);
      setActiveTab("library");
    }
  };

  // Update audio element when currentAudio changes
  useEffect(() => {
    if (audioRef.current && currentAudio) {
      const audio = audioRef.current;
      audio.src = getAudioSource(currentAudio);
      audio.load();
      setCurrentTime(0);
      setIsLoading(true);
    }
  }, [currentAudio]);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("error", handleAudioError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("error", handleAudioError);
    };
  }, []);

  useEffect(() => {
    fetchAudioLibrary();
  }, []);

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
      {/* Hidden file input and audio element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="audio/*"
        multiple
        className="hidden"
      />

      <audio ref={audioRef} className="hidden" preload="metadata" />

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
        <Button
          variant="secondary"
          size="sm"
          icon={<Wand2 size={16} />}
          onClick={() => setShowAIModal(true)}
        >
          AI Generate
        </Button>
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
              <p className="text-slate-300">Analyzing audio...</p>
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
                <br />
                <span className="text-sm">or use AI to generate music</span>
              </p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Audio Files List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {audioFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Music size={48} />
                <p>No audio files yet</p>
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
                    >
                      {currentAudio?._id === audioFile._id && isPlaying ? (
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

          {/* Enhanced Audio Player */}
          {currentAudio && (
            <Card className="p-4 bg-slate-800/50 border-slate-700 space-y-3">
              <h4 className="text-sm font-semibold text-slate-300">
                Now Playing
              </h4>

              {/* Track Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {currentAudio.metadata?.name || currentAudio.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(currentAudio.uploadedAt)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div
                  ref={progressBarRef}
                  className="w-full h-2 bg-slate-700 rounded-full cursor-pointer hover:h-3 transition-all"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                    style={{
                      width: `${
                        duration ? (currentTime / duration) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Left side - Volume */}
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-slate-400 hover:text-white"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </Button>
                  <div
                    className="w-20 h-1 bg-slate-700 rounded-full cursor-pointer hover:h-2 transition-all"
                    onClick={handleVolumeChange}
                  >
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                  </div>
                </div>

                {/* Center - Playback Controls */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-slate-400 hover:text-white"
                    onClick={handleSkipBack}
                  >
                    <SkipBack size={16} />
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                    onClick={() => handlePlayPause()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-slate-400 hover:text-white"
                    onClick={handleSkipForward}
                  >
                    <SkipForward size={16} />
                  </Button>
                </div>

                {/* Right side - Playback Rate */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-400 hover:text-white px-2"
                    onClick={changePlaybackRate}
                  >
                    {playbackRate}x
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wand2 className="text-cyan-400" size={24} />
                  AI Music Generation
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIModal(false)}
                  disabled={isGenerating}
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Generation Form */}
              <div className="space-y-6">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Music Description *
                  </label>
                  <textarea
                    value={generationParams.prompt}
                    onChange={(e) =>
                      setGenerationParams((prev) => ({
                        ...prev,
                        prompt: e.target.value,
                      }))
                    }
                    placeholder="Describe the music you want to generate... (e.g., 'A upbeat electronic track with pulsating synths and driving beat')"
                    className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                </div>

                {/* Basic Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={generationParams.duration}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 30,
                        }))
                      }
                      min="10"
                      max="300"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      BPM
                    </label>
                    <input
                      type="number"
                      value={generationParams.bpm}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          bpm: parseInt(e.target.value) || 120,
                        }))
                      }
                      min="60"
                      max="200"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Genre and Mood */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Genre
                    </label>
                    <select
                      value={generationParams.genre}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          genre: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    >
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mood
                    </label>
                    <select
                      value={generationParams.mood}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          mood: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    >
                      {moods.map((mood) => (
                        <option key={mood} value={mood}>
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Style
                  </label>
                  <select
                    value={generationParams.style}
                    onChange={(e) =>
                      setGenerationParams((prev) => ({
                        ...prev,
                        style: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {styles.map((style) => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instruments */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instruments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {instrumentOptions.map((instrument) => (
                      <button
                        key={instrument}
                        type="button"
                        onClick={() =>
                          !isGenerating && toggleInstrument(instrument)
                        }
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          generationParams.instruments.includes(instrument)
                            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        } ${
                          isGenerating
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        disabled={isGenerating}
                      >
                        {instrument}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={generationParams.temperature}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          temperature: parseFloat(e.target.value) || 0.7,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Top P
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={generationParams.topP}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          topP: parseFloat(e.target.value) || 0.9,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Top K
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={generationParams.topK}
                      onChange={(e) =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          topK: parseInt(e.target.value) || 50,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAIModal(false)}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !generationParams.prompt.trim()}
                    className="flex-1"
                    icon={
                      isGenerating ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Wand2 size={16} />
                      )
                    }
                  >
                    {isGenerating ? "Generating..." : "Generate Music"}
                  </Button>
                </div>

                {/* Generation Status */}
                {(isGenerating || generationStatus) && (
                  <div
                    className={`p-4 rounded-lg border ${
                      generationStatus.includes("Error")
                        ? "bg-red-500/10 border-red-500/20"
                        : "bg-cyan-500/10 border-cyan-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isGenerating && (
                        <Loader2
                          className="text-cyan-400 animate-spin"
                          size={20}
                        />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            generationStatus.includes("Error")
                              ? "text-red-400"
                              : "text-cyan-400"
                          }`}
                        >
                          {generationStatus}
                        </p>
                        {isGenerating && (
                          <p className="text-cyan-300 text-sm">
                            Creating {generationParams.duration}s of{" "}
                            {generationParams.genre} music at{" "}
                            {generationParams.bpm} BPM
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
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
                    icon={
                      currentAudio?._id === selectedAudio._id && isPlaying ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )
                    }
                  >
                    {currentAudio?._id === selectedAudio._id && isPlaying
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
