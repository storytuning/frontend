import { createConfig, http } from "wagmi";
import { defineChain } from "viem";

export const storyAeneidTestnet = defineChain({
  id: 1315,
  name: "Story Aeneid Testnet",
  nativeCurrency: {
    name: "Story IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://aeneid.storyrpc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "StoryScan",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [storyAeneidTestnet],
  transports: {
    [storyAeneidTestnet.id]: http("https://aeneid.storyrpc.io"),
  },
});
