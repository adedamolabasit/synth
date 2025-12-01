import { useEffect, useState } from "react";
import { custom, http } from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { networkInfo } from "../config";
import { privateKeyToAccount, Address, Account } from "viem/accounts";

export const useStoryClient = () => {
  const { data: wallet } = useWalletClient();
  const [client, setClient] = useState<StoryClient | null>(null);

  useEffect(() => {
    if (!wallet) return;

    // const config: StoryConfig = {
    //   wallet,
    //   transport: custom(wallet.transport),
    //   chainId: "aeneid",
    // };

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
