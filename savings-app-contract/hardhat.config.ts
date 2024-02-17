import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const SPARK_RPC = process.env.SPARK_RPC || '';
const EXPLORER_SPARK_API = process.env.EXPLORER_FUSESPARK_APIKEY || '';

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    spark: {
      url: SPARK_RPC,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      spark: EXPLORER_SPARK_API
    },
    customChains: [
      {
        network: "spark",
        chainId: 123,
        urls: {
          apiURL: "https://explorer.fusespark.io/api",
          browserURL: "https://explorer.fusespark.io"
        }
      }
    ]
  }
};

export default config;
