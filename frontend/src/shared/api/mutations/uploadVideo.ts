import { apiFetch } from "../client";

export const uploadVideo = (walletAddr: string, formData: FormData) =>
  apiFetch(`/video/upload/${walletAddr}`, {
    method: "POST",
    body: formData,
  });
