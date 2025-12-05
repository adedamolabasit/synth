import { useState, useRef, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { AudioFile } from "../../../shared/types/audio.types";
import {
  FileAudio,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { formatTime } from "../../../shared/utils";

export interface MusicPlayerProps {
  currentAudio: AudioFile | null;
  onPlayPause: () => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onSeek: (value: number) => void;
  onToggleMute: () => void;
}

export function MusicPlayerPanel({
  currentAudio,
  onPlayPause,
  isPlaying,
  isLoading = false,
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setCurrentTime(0);
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
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    setCurrentTime(audioRef.current.currentTime);
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

  const getAudioSource = (audioFile: AudioFile) => {
    return audioFile.audioUrl || audioFile.url;
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

  useEffect(() => {
    if (audioRef.current && currentAudio) {
      const audio = audioRef.current;
      audio.src = getAudioSource(currentAudio);
      audio.load();
      setCurrentTime(0);

      const handleLoad = () => {
        setDuration(audio.duration);
      };

      audio.addEventListener("loadedmetadata", handleLoad);

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoad);
      };
    }
  }, [currentAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, []);

  if (!currentAudio) {
    return null;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !currentAudio) return;

    const audio = audioRef.current;
    audio.src = getAudioSource(currentAudio);
    audio.load();

    if (isPlaying) {
      audio.play();
    }
  }, [currentAudio]);

  return (
    <>
      <audio ref={audioRef} className="hidden" preload="metadata" />

      <Card className="p-4 bg-slate-800/50 border-slate-700 space-y-3">
        <h4 className="text-sm font-semibold text-slate-300">Now Playing</h4>

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

        <div className="space-y-1">
          <div
            ref={progressBarRef}
            className="w-full h-2 bg-slate-700 rounded-full cursor-pointer hover:h-3 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
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
              onClick={() => onPlayPause()}
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
    </>
  );
}
