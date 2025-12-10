import { apiFetch } from "../client";

export const getVideoById = (id: string) =>
  apiFetch(`/video/${id}`);
