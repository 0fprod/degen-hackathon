import { useMemo } from "react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";


export const useWalletClient = () => {
  const walletClient = useMemo(() => {
    return createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum!),
    });
  }, []);

  return walletClient;
};