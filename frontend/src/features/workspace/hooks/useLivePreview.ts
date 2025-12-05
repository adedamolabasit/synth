import { useState, useEffect, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { useAudio } from "../../../provider/AudioContext";
import { useThreeSetup } from "./useThreeSetup";

export const useLivePreview = () => {
  const { user, primaryWallet } = useDynamicContext();
  const { 
    setShowDownloadModal, 
    showDownloadModal, 
    setVideoBlob, 
    videoBlob,
    params,
    setParams,
    visualElements
  } = useVisualizer();

  const {
    currentAudio,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    pauseAudio,
    resumeAudio,
    seekTo,
    frequencyData,
    timeData,
    beatInfo,
    audioLevel,
  } = useAudio();

  const walletAddress = primaryWallet?.address;
  const isConnected = !!user;

  // Three.js setup with animation control
  const { 
    canvasRef, 
    sceneReady, 
    beatDetected, 
    startAnimation, 
    stopAnimation 
  } = useThreeSetup();

  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [audioName, setAudioName] = useState("");
  const [audioError, setAudioError] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoName, setVideoName] = useState(`visualizer-${Date.now()}`);
  const [isUploading, setIsUploading] = useState(false);

  // Control animation based on playback state
  useEffect(() => {
    if (sceneReady) {
      if (isPlaying) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }
  }, [isPlaying, sceneReady, startAnimation, stopAnimation]);

  // Update progress when time changes
  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  // Update audio name
  useEffect(() => {
    if (currentAudio) {
      setAudioName(currentAudio.metadata?.name || currentAudio.name || "Unknown Audio");
      setHasDefaultAudio(false);
    } else if (hasDefaultAudio) {
      setAudioName("Default Demo Audio");
    } else {
      setAudioName("");
    }
  }, [currentAudio, hasDefaultAudio]);

  // Define handleDemoAudio first to avoid circular dependency
  const handleDemoAudio = useCallback(async () => {
    try {
      if (!hasDefaultAudio) {
        setHasDefaultAudio(true);
        setAudioName("Default Demo Audio");
      }
      setAudioError("");
    } catch (error) {
      setAudioError("Failed to load demo audio");
    }
  }, [hasDefaultAudio]);

  // Now define togglePlayback after handleDemoAudio
  const togglePlayback = useCallback(async () => {
    console.log('Toggle playback:', { isPlaying, currentAudio, hasDefaultAudio });
    
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
  }, [currentAudio, hasDefaultAudio, isPlaying, pauseAudio, resumeAudio, handleDemoAudio]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  }, [duration, seekTo]);

  const handleSaveVideo = useCallback(async () => {
    if (!videoBlob || !walletAddress) return;

    setIsUploading(true);
    
    const formData = new FormData();
    const fileName = videoName.trim()
      ? `${videoName}.webm`
      : `visualizer-${Date.now()}.webm`;
    const file = new File([videoBlob], fileName, { type: "video/webm" });
    formData.append("video", file);

    try {
      const response = await fetch(
        `http://localhost:8000/api/video/upload/${walletAddress}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setShowDownloadModal(false);
        setVideoBlob(null);
        setVideoName(`visualizer-${Date.now()}`);
      } 
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  }, [videoBlob, walletAddress, videoName, setShowDownloadModal, setVideoBlob]);

  return {
    // Three.js and animation related
    canvasRef,
    sceneReady,
    beatDetected,
    
    // Audio state
    currentAudio,
    audioName,
    audioError,
    hasDefaultAudio,
    progress,
    currentTime,
    duration,
    isPlaying,
    isLoading,
    
    // UI state
    isConnected,
    videoName,
    isUploading,
    showDownloadModal,
    videoBlob,
    
    // Params and elements
    params,
    setParams,
    visualElements,
    
    // Handlers
    handleSaveVideo,
    setShowDownloadModal,
    setVideoName,
    setVideoBlob,
    togglePlayback,
    handleDemoAudio,
    handleSeek,
  };
};