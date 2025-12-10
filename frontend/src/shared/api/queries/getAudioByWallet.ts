import { apiFetch } from "../client";

export const getAudioByWallet = (walletAddr: string) =>
  apiFetch(`/v1/audio/wallet/${walletAddr}`, {
    method: "GET",
    headers: { accept: "application/json" },
  });
