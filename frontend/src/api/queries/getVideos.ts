import { apiFetch } from "../client";

export const getVideos = () => {
  return apiFetch(`/video`);
};
