import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    spark: {
      url: 'https://rpc.fusespark.io/',
      accounts: {
        mnemonic: PRIVATE_KEY
      },
    },
  },
  // etherscan: {
  //   apiKey: {
  //     fuse: "YOUR_KEY_IF_YOU_HAVE_ONE",
  //     spark: "YOUR_KEY_IF_YOU_HAVE_ONE"
  //   },
  //   customChains: [
  //     {
  //       network: "fuse",
  //       chainId: 122,
  //       urls: {
  //         apiURL: "https://explorer.fuse.io/api",
  //         browserURL: "https://explorer.fuse.io"
  //       }
  //     },
  //     {
  //       network: "spark",
  //       chainId: 123,
  //       urls: {
  //         apiURL: "https://explorer.fusespark.io/api",
  //         browserURL: "https://explorer.fusespark.io"
  //       }
  //     }
  //   ]
  // }
};

export default config;
