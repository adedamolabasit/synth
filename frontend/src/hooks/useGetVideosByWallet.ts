import { useQuery } from "@tanstack/react-query";
import { getWalletVideos } from "../api/queries/getWalletVideos";


export const useGetVideoByWallet = (wallet: string) =>
  useQuery({
    queryKey: ["videos-wallet", wallet],
    queryFn: () => getWalletVideos(wallet),
    enabled: !!wallet,
  });
