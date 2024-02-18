import { run, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const { log, } = hre.deployments;
  const chainId = await hre.getChainId()
  const hardhatChainId = '31337';
  const localhostChainId = '1337';
  const isTest = chainId === hardhatChainId || chainId === localhostChainId;
  log('Deploying Saving...');
  const savings = await ethers.deployContract("Saving");
  const address = await savings.getAddress();
  log(`Saving deployed at ${address}`);

  if (isTest) {
    // deploy Token for testing with 1000 tokens
    const oneThousands = ethers.parseEther("1000");
    const token = await ethers.deployContract("TestERC20", ["TestT", "TT", oneThousands]);
    const tokenAddress = await token.getAddress();
    log(`Token deployed at ${tokenAddress}`);
  }


  if (!isTest) {
    await run('verify:verify', {
      address,
      constructorArguments: [],
    });
  }
};

export default deploy;
deploy.tags = ['saving'];

