import { Alchemy, Network } from "alchemy-sdk";
import { useMemo } from "react";

export const useAlchemy = () => {
  const alchemy = useMemo(() => {
    return new Alchemy({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_SEPOLIA,
    });
  }, []);

  return alchemy;
};
