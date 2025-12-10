import { apiFetch } from "../client";

export const getWalletVideos = (walletAddr: string) =>
  apiFetch(`/video/wallet/${walletAddr}`);
