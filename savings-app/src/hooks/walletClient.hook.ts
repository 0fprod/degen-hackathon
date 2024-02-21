import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

// create and export a hook to use the wallet client
export const useWalletClient = () => {
  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum!),
  });;
};