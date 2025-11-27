import { useState, useEffect } from "react";
import { useAudio } from "../../../../provider/AudioContext";

export const useAudioSync = () => {
  const {
    currentAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    pauseAudio,
    resumeAudio,
    seekTo,
  } = useAudio();

  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [audioName, setAudioName] = useState("");
  const [audioError, setAudioError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (currentAudio) {
      setAudioName(currentAudio.metadata?.name || currentAudio.name);
      setHasDefaultAudio(false);
    } else if (hasDefaultAudio) {
      setAudioName("Default Demo Audio");
    } else {
      setAudioName("");
    }
  }, [currentAudio, hasDefaultAudio]);

  const togglePlayback = async () => {
    if (!currentAudio && !hasDefaultAudio) {
      await handleDemoAudio();
      return;
    }

    if (isPlaying) {
      pauseAudio();
    } else {
      if (currentAudio) {
        await resumeAudio();
      }
    }
  };

  const handleDemoAudio = async () => {
    try {
      if (!hasDefaultAudio) {
        setHasDefaultAudio(true);
        setAudioName("Default Demo Audio");
      }
      setAudioError("");
    } catch (error) {
      setAudioError("Failed to load demo audio");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  return {
    isPlaying,
    isLoading,
    currentAudio,
    currentTime,
    duration,
    hasDefaultAudio,
    audioName,
    audioError,
    progress,
    togglePlayback,
    handleDemoAudio,
    handleSeek,
  };
};
