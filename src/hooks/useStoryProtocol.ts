import { useCallback } from "react";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmiConfig";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
} from "../utils/contractConfig";

export const useStoryProtocol = (walletAddress: string | null) => {
  const getNFTInfo = useCallback(
    async (tokenId: string) => {
      if (!walletAddress) throw new Error("Wallet connection required");

      try {
        const owner = await readContract(wagmiConfig, {
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        });

        let cid = "";
        try {
          cid = await readContract(wagmiConfig, {
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_CONTRACT_ABI,
            functionName: "getCID",
            args: [BigInt(tokenId)],
          }) as string;
        } catch (cidError) {
          console.warn("Failed to get CID, may not be available yet:", cidError);
        }

        return {
          owner: owner as string,
          cid,
          isOwner: (owner as string).toLowerCase() === walletAddress.toLowerCase(),
        };
      } catch (err) {
        console.error("NFT info lookup failed:", err);
        throw new Error("Failed to verify NFT ownership: Token may not exist yet");
      }
    },
    [walletAddress]
  );

  const checkNFTOwnership = useCallback(
    async (tokenId: string) => {
      if (!walletAddress) throw new Error("지갑이 연결되어 있지 않습니다.");

      try {
        const owner = await readContract(wagmiConfig, {
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        });

        return (owner as string).toLowerCase() === walletAddress.toLowerCase();
      } catch (err) {
        console.error("NFT 소유권 확인 실패:", err);
        return false;
      }
    },
    [walletAddress]
  );

  const getUserNFTBalance = useCallback(async () => {
    if (!walletAddress) throw new Error("지갑이 연결되어 있지 않습니다.");

    try {
      const balance = await readContract(wagmiConfig, {
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      });

      return Number(balance);
    } catch (err) {
      console.error("NFT 잔액 확인 실패:", err);
      return 0;
    }
  }, [walletAddress]);

  return {
    getNFTInfo,
    checkNFTOwnership,
    getUserNFTBalance,
  };
};
