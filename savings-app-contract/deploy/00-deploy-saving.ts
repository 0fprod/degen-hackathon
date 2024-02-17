import { run, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const { log, } = hre.deployments;
  const chainId = await hre.getChainId()
  const hardhatChainId = '31337';
  log('Deploying Saving...');
  const savings = await ethers.deployContract("Saving");
  const address = await savings.getAddress();
  log(`Saving deployed at ${address}`);

  if (chainId !== hardhatChainId) {
    await run('verify:verify', {
      address,
      constructorArguments: [],
    });
  }
};

export default deploy;
deploy.tags = ['saving'];

