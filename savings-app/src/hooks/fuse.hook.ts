import { FuseSDK } from "@fuseio/fusebox-web-sdk";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

export const useFuse = () => {
  const apiKey = import.meta.env.VITE_FUSE_API_KEY;
  const credentials = new ethers.Wallet(import.meta.env.VITE_WALLET_PRIVATE_KEY);

  const [fuse, setFuse] = useState<FuseSDK | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FuseSDK.init(apiKey, credentials).then((fuse) => {
      setFuse(fuse);
      setLoading(false);
    });
  }, []);

  return { fuse, loading };
}