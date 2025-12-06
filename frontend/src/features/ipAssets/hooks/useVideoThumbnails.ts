import { useState, useCallback } from "react";
import type { Video } from "../types";

export function useVideoThumbnails() {
  const [videoThumbnails, setVideoThumbnails] = useState<{
    [key: string]: string;
  }>({});
  const videoThumbnailCache: Record<string, string> = {};

  const generateVideoThumbnail = useCallback(
    (videoUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.src = videoUrl;
        video.muted = true;

        video.addEventListener("loadedmetadata", () => {
          video.currentTime = Math.min(video.duration * 0.1, 10);
        });

        video.addEventListener("seeked", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          } else {
            reject(new Error("Could not get canvas context"));
          }
        });

        video.addEventListener("error", () =>
          reject(new Error("Video loading error"))
        );
        video.load();
      });
    },
    []
  );

  const generateThumbnails = useCallback(
    async (videos: Video[]) => {
      for (const video of videos) {
        if (
          video.thumbnailUrl ||
          videoThumbnailCache[video.videoUrl] ||
          videoThumbnails[video.id]
        ) {
          continue;
        }

        try {
          const thumb = await generateVideoThumbnail(video.videoUrl);
          videoThumbnailCache[video.videoUrl] = thumb;
          setVideoThumbnails((prev) => ({ ...prev, [video.id]: thumb }));
        } catch (err) {
          console.error("Failed to generate thumbnail:", err);
        }
      }
    },
    [generateVideoThumbnail, videoThumbnails, videoThumbnailCache]
  );

  return {
    videoThumbnails,
    generateThumbnails,
  };
}
