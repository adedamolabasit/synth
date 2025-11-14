import {
  Upload,
  Music,
  Wand2,
  Loader2,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Play,
  Pause,
  X,
  Settings,
} from "lucide-react";
import { useState, useRef } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  bpm?: number;
  key?: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

interface AIGenerationParams {
  prompt: string;
  duration: number;
  genre: string;
  mood: string;
  instruments: string[];
  bpm: number;
  style: string;
}

interface AudioUploadPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: "left" | "right";
}

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

  const [generationParams, setGenerationParams] = useState<AIGenerationParams>({
    prompt: "",
    duration: 30,
    genre: "electronic",
    mood: "energetic",
    instruments: ["synth", "drums"],
    bpm: 120,
    style: "modern",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Genre options
  const genres = [
    "electronic",
    "rock",
    "pop",
    "hip-hop",
    "jazz",
    "classical",
    "ambient",
    "lofi",
    "dance",
    "r&b",
    "country",
    "reggae",
  ];

  // Mood options
  const moods = [
    "energetic",
    "calm",
    "happy",
    "melancholic",
    "dark",
    "uplifting",
    "romantic",
    "mysterious",
    "epic",
    "dreamy",
    "aggressive",
    "peaceful",
  ];

  // Instrument options
  const instrumentOptions = [
    "piano",
    "guitar",
    "drums",
    "bass",
    "synth",
    "strings",
    "violin",
    "cello",
    "trumpet",
    "saxophone",
    "flute",
    "vocals",
  ];

  // Style options
  const styles = [
    "modern",
    "vintage",
    "futuristic",
    "acoustic",
    "orchestral",
    "minimal",
    "complex",
    "experimental",
    "traditional",
  ];

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

    for (const file of files) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newAudioFile: AudioFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        duration: Math.floor(Math.random() * 300) + 30,
        bpm: Math.floor(Math.random() * 60) + 80,
        key: ["C major", "A minor", "G major", "E minor", "D major", "B minor"][
          Math.floor(Math.random() * 6)
        ],
        url: URL.createObjectURL(file),
        type: file.type,
        uploadedAt: new Date(),
      };

      setAudioFiles((prev) => [newAudioFile, ...prev]);
    }

    setIsAnalyzing(false);
    setActiveTab("library");
  };

  const handleAIGenerate = async () => {
    if (!generationParams.prompt.trim()) {
      alert("Please enter a prompt for AI generation");
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare data for API endpoint
      const requestData = {
        ...generationParams,
        // Convert duration from seconds to milliseconds if needed by your API
        duration: generationParams.duration * 1000,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending to AI API:", requestData);

      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Simulated response - replace with actual API response handling
      const generatedAudio: AudioFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: `AI_${generationParams.genre}_${
          generationParams.mood
        }_${Date.now()}.mp3`,
        size: 1024 * 1024 * (generationParams.duration / 10), // Size based on duration
        duration: generationParams.duration,
        bpm: generationParams.bpm,
        key: "C major", // You could add key detection or generation
        url: `https://api.example.com/generated/${Date.now()}`, // Replace with actual URL from API
        type: "audio/mpeg",
        uploadedAt: new Date(),
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
      });
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = (audioFile: AudioFile) => {
    if (currentAudio?.id === audioFile.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentAudio(audioFile);
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioFiles((prev) => prev.filter((file) => file.id !== id));
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
      setIsPlaying(false);
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

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

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
                  key={audioFile.id}
                  className={`p-3 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 ${
                    currentAudio?.id === audioFile.id
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
                      {currentAudio?.id === audioFile.id && isPlaying ? (
                        <Pause className="text-cyan-400" size={16} />
                      ) : (
                        <Play className="text-cyan-400" size={16} />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {audioFile.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {formatFileSize(audioFile.size)}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {formatDuration(audioFile.duration || 0)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {audioFile.bpm && (
                          <Badge variant="info" size="sm">
                            {audioFile.bpm} BPM
                          </Badge>
                        )}
                        {audioFile.key && (
                          <Badge variant="default" size="sm">
                            {audioFile.key}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 text-slate-400 hover:text-red-400"
                      onClick={(e) => handleDelete(audioFile.id, e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Currently Playing */}
          {currentAudio && (
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">
                Now Playing
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <FileAudio className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm truncate">
                    {currentAudio.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDuration(currentAudio.duration || 0)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePlayPause(currentAudio)}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
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
                {isGenerating && (
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center gap-3">
                      <Loader2
                        className="text-cyan-400 animate-spin"
                        size={20}
                      />
                      <div>
                        <p className="text-cyan-400 font-medium">
                          Generating your music...
                        </p>
                        <p className="text-cyan-300 text-sm">
                          Creating {generationParams.duration}s of{" "}
                          {generationParams.genre} music at{" "}
                          {generationParams.bpm} BPM
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
