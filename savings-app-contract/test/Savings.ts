import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumberish } from 'ethers'
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Saving } from "../typechain-types";

describe("Savings", function () {
  let signers: HardhatEthersSigner[] = [];

  this.beforeAll(async () => {
    signers = await ethers.getSigners();
  });

  async function deployErc20Fixture() {
    const tokenFactory = await ethers.getContractFactory("Token");
    const tokenContract = await tokenFactory.deploy(tokensAmount(10000));
    await tokenContract.waitForDeployment();
    const tokenContractAddress = await tokenContract.getAddress();

    return { tokenContract, tokenContractAddress };
  }

  async function deployFixture() {
    const Saving = await ethers.getContractFactory("Saving");
    const savingContract = await Saving.deploy();
    await savingContract.waitForDeployment();
    const savingContractAddress = await savingContract.getAddress();

    return { savingContract, savingContractAddress };
  }


  it('save a token', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const [deployer] = signers;
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, savingGoal);

    // Act
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress);
    expect(savedBalance.balance).to.equal(depositedAmount);
    expect(savedBalance.goal).to.equal(savingGoal);
  });


});

function tokensAmount(amount: number): BigNumberish {
  return ethers.parseEther(`${amount}`)
}