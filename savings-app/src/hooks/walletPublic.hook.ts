import { useMemo } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export const usePublicClient = () => {
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    });
  }, []);

  return publicClient;
};
