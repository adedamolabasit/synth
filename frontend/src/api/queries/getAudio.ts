import { apiFetch } from "../client";

export const getAudio = (wallet: string) => {
  return apiFetch(`/v1/audio/wallet/${wallet}`);
};
