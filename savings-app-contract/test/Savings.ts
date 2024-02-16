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

describe("SavingContract allow users to", function () {
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

  async function deployAnotherErc20Fixture() {
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
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, savingGoal);

    // Act
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress);
    expect(savedBalance.balance).to.equal(depositedAmount);
    expect(savedBalance.goal).to.equal(savingGoal);
  });

  it('save multiple tokens', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { tokenContract: anotherTokenContract, tokenContractAddress: anotherTokenContractAddress } = await loadFixture(deployAnotherErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(5000);
    const anotherSavingGoal = tokensAmount(5000);
    const depositedAmount = tokensAmount(500);
    const anotherDepositedAmount = tokensAmount(600);
    await tokenContract.approve(savingContractAddress, savingGoal);
    await anotherTokenContract.approve(savingContractAddress, anotherSavingGoal);

    // Act
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal);
    await savingContract.createSaving(anotherTokenContractAddress, anotherDepositedAmount, anotherSavingGoal);

    const aTokenSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress);
    const anotherTokenSaving: Saving.SavingsStructOutput = await savingContract.getSavings(anotherTokenContractAddress);
    expect(aTokenSaving.balance).to.equal(depositedAmount);
    expect(aTokenSaving.goal).to.equal(savingGoal);
    expect(anotherTokenSaving.balance).to.equal(anotherDepositedAmount);
    expect(anotherTokenSaving.goal).to.equal(anotherSavingGoal);
  });

  it('withdraw a token', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal);

    // Act
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.withdrawSaving(tokenContractAddress, depositedAmount);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress);
    expect(savedBalance.balance).to.equal(0);
    expect(savedBalance.goal).to.equal(savingGoal);
  });


});

function tokensAmount(amount: number): BigNumberish {
  return ethers.parseEther(`${amount}`)
}