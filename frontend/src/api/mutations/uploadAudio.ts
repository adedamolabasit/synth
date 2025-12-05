import { apiFetch } from "../client";

export const uploadAudio = (wallet: string, formData: FormData) =>
  apiFetch(`/v1/extract/${wallet}`, {
    method: "POST",
    body: formData,
  });
