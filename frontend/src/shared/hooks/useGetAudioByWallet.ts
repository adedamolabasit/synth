import { useQuery } from "@tanstack/react-query";
import { getAudioByWallet } from "../api/queries/getAudioByWallet";

export const useGetAudioByWallet = (wallet: string) =>
  useQuery({
    queryKey: ["audio-wallet", wallet],
    queryFn: () => getAudioByWallet(wallet),
    enabled: !!wallet,
  });
