import { apiFetch } from "../client";

export const updateIpRegistration = (
  videoId: string,
  ipRegistration: {
    ipId: string;
    status: string;
    tokenId?: string;
  }
) =>
  apiFetch(`/video/ip/${videoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ipRegistration }),
  });
