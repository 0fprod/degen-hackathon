import { FuseSDK } from "@fuseio/fusebox-web-sdk";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

export const useFuse = (apiKey: string, credentials: ethers.Wallet) => {
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