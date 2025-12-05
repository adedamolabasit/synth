import { useState, useRef } from "react";

export const useVideoHover = () => {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const previewRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleVideoHover = (videoId: string) => {
    setHoveredVideo(videoId);
    const previewVideo = previewRefs.current[videoId];
    if (previewVideo) {
      previewVideo.currentTime = 0;
      previewVideo.play().catch(() => {});
    }
  };

  const handleVideoHoverEnd = (videoId: string) => {
    setHoveredVideo(null);
    const previewVideo = previewRefs.current[videoId];
    if (previewVideo) {
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }
  };

  return { hoveredVideo, handleVideoHover, handleVideoHoverEnd, previewRefs };
};