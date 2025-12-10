import { useState, useCallback } from "react";
import { Video } from "../components";
import { generateVideoThumbnail } from "../utils/videoUtils";

export const useVideoThumbnails = (videos: Video[]) => {
  const [videoThumbnails, setVideoThumbnails] = useState<{
    [key: string]: string;
  }>({});
  const videoThumbnailCache: Record<string, string> = {};

  const generateThumbnails = useCallback(async () => {
    for (const video of videos) {
      if (video.thumbnailUrl || videoThumbnailCache[video.videoUrl]) continue;

      try {
        const thumb = await generateVideoThumbnail(video.videoUrl);
        videoThumbnailCache[video.videoUrl] = thumb;
        setVideoThumbnails((prev) => ({ ...prev, [video.id]: thumb }));
      } catch (err) {}
    }
  }, [videos]);

  return { videoThumbnails, generateThumbnails };
};
