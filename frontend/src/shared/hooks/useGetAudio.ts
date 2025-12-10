import { useQuery } from "@tanstack/react-query";
import { getAudio } from "../api/queries/getAudio";

export const useAudioQuery = (wallet: string) =>
  useQuery({
    queryKey: ["audio", wallet],
    queryFn: () => getAudio(wallet),
    enabled: !!wallet,
  });
