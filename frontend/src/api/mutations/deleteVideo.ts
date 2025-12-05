import { apiFetch } from "../client";

export const deleteVideo = (videoId: string) =>
  apiFetch(`/video/${videoId}`, {
    method: "DELETE",
  });
