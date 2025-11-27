import { useEffect, useState } from "react";
import { custom} from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

export const useStoryClient = () => {
  const { data: wallet } = useWalletClient();
  const [client, setClient] = useState<StoryClient | null>(null);

  useEffect(() => {
    if (!wallet) return;

    const config: StoryConfig = {
      wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    };

    const storyClient = StoryClient.newClient(config);
    setClient(storyClient);
  }, [wallet]);

  return client;
};