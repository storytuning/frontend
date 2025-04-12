import { useState, useEffect } from "react";
import { aeneid, StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { useWalletClient } from "wagmi";
import { custom } from "viem";

export const useStoryClient = () => {
  const { data: wallet } = useWalletClient();
  const [client, setClient] = useState<StoryClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) {
      setClient(null);
      return;
    }

    try {
      // Story Protocol 클라이언트 생성
      const config: StoryConfig = {
        wallet: wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid",
      };
      
      const storyClient = StoryClient.newClient(config);

      setClient(storyClient);
      setError(null);
    } catch (err) {
      console.error("Story Protocol client initialization error:", err);
      setError("Failed to connect to Story Protocol");
      setClient(null);
    }
  }, [wallet]);

  return { client, error };
};