import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SPARK_RPC = process.env.SPARK_RPC || '';
const EXPLORER_FUSESPARK_APIKEY = process.env.EXPLORER_FUSESPARK_APIKEY || '';
const EXPLORER_SPARK_API = process.env.EXPLORER_FUSE_APIKEY || '';

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    spark: {
      url: SPARK_RPC,
      accounts: [PRIVATE_KEY],
    },
    fuse: {
      url: "https://rpc.fuse.io",
      accounts: [PRIVATE_KEY],
      chainId: 122
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: {
      spark: EXPLORER_FUSESPARK_APIKEY,
      fuse: EXPLORER_SPARK_API
    },
    customChains: [
      {
        network: "spark",
        chainId: 123,
        urls: {
          apiURL: "https://explorer.fusespark.io/api",
          browserURL: "https://explorer.fusespark.io"
        }
      },
      {
        network: "fuse",
        chainId: 122,
        urls: {
          apiURL: "https://explorer.fuse.io/api",
          browserURL: "https://explorer.fuse.io"
        }
      },
    ]
  }
};

export default config;
