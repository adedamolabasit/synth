import { useState, useEffect, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useVisualizer } from "../../../provider/VisualizerContext";
import { useAudio } from "../../../provider/AudioContext";
import { useThreeSetup } from "./useThreeSetup";
import { useUploadVideo } from "../../../hooks/useUploadVideo";

export const useLivePreview = () => {
  const { user, primaryWallet } = useDynamicContext();
  const {
    setShowDownloadModal,
    showDownloadModal,
    setVideoBlob,
    videoBlob,
    params,
    setParams,
    visualElements,
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
  } = useAudio();

  const walletAddress = primaryWallet?.address;
  const isConnected = !!user;

  const uploadVideoMutation = useUploadVideo();

  const { canvasRef, sceneReady, beatDetected, startAnimation, stopAnimation } =
    useThreeSetup();

  const [hasDefaultAudio, setHasDefaultAudio] = useState(false);
  const [audioName, setAudioName] = useState("");
  const [audioError, setAudioError] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoName, setVideoName] = useState(`visualizer-${Date.now()}`);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (sceneReady) {
      if (isPlaying) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }
  }, [isPlaying, sceneReady, startAnimation, stopAnimation]);

  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (currentAudio) {
      setAudioName(
        currentAudio.metadata?.name || currentAudio.name || "Unknown Audio"
      );
      setHasDefaultAudio(false);
    } else if (hasDefaultAudio) {
      setAudioName("Default Demo Audio");
    } else {
      setAudioName("");
    }
  }, [currentAudio, hasDefaultAudio]);

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

  const togglePlayback = useCallback(async () => {
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
  }, [
    currentAudio,
    hasDefaultAudio,
    isPlaying,
    pauseAudio,
    resumeAudio,
    handleDemoAudio,
  ]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      seekTo(newTime);
    },
    [duration, seekTo]
  );

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
      const result = await uploadVideoMutation.mutateAsync({
        wallet: walletAddress,
        formData,
      });

      if (result.success) {
        setShowDownloadModal(false);
        setVideoBlob(null);
        setVideoName(`visualizer-${Date.now()}`);
      }
    } catch (error) {
    } finally {
      setIsUploading(false);
    }
  }, [
    videoBlob,
    walletAddress,
    videoName,
    setShowDownloadModal,
    setVideoBlob,
    uploadVideoMutation,
  ]);

  return {
    canvasRef,
    sceneReady,
    beatDetected,
    currentAudio,
    audioName,
    audioError,
    hasDefaultAudio,
    progress,
    currentTime,
    duration,
    isPlaying,
    isLoading,
    isConnected,
    videoName,
    isUploading,
    showDownloadModal,
    videoBlob,
    uploadVideoMutation,
    params,
    setParams,
    visualElements,
    handleSaveVideo,
    setShowDownloadModal,
    setVideoName,
    setVideoBlob,
    togglePlayback,
    handleDemoAudio,
    handleSeek,
  };
};
