import { apiFetch } from "../client";

export const updatePublication = (videoId: string, status: string) =>
  apiFetch(`/video/publication/${videoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publication: status }),
  });
