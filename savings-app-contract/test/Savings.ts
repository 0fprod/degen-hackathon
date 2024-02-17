import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumberish } from 'ethers'
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Saving } from "../typechain-types";

describe("SavingContract allow users to", function () {
  let signers: HardhatEthersSigner[];

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

  it('create a Saving for a token', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, savingGoal);

    // Act
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    expect(savedBalance.balance).to.equal(depositedAmount);
    expect(savedBalance.goal).to.equal(savingGoal);
  });

  it('create a Saving for multiple tokens', async function () {
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
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);
    await savingContract.createSaving(anotherTokenContractAddress, anotherDepositedAmount, anotherSavingGoal, false);

    const aTokenSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    const anotherTokenSaving: Saving.SavingsStructOutput = await savingContract.getSavings(anotherTokenContractAddress, 1);
    expect(aTokenSaving.balance).to.equal(depositedAmount);
    expect(aTokenSaving.goal).to.equal(savingGoal);
    expect(anotherTokenSaving.balance).to.equal(anotherDepositedAmount);
    expect(anotherTokenSaving.goal).to.equal(anotherSavingGoal);
  });

  it('create multiple Savings for a token', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const anotherSavingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    const anotherDepositedAmount = tokensAmount(600);
    await tokenContract.approve(savingContractAddress, tokensAmount(2000));

    // Act
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);
    await savingContract.createSaving(tokenContractAddress, anotherDepositedAmount, anotherSavingGoal, false);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    const anotherSavedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 1);
    expect(savedBalance.balance).to.equal(depositedAmount);
    expect(savedBalance.goal).to.equal(savingGoal);
    expect(anotherSavedBalance.balance).to.equal(anotherDepositedAmount);
    expect(anotherSavedBalance.goal).to.equal(anotherSavingGoal);
  });

  it('withdraw a token', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);

    // Act
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.withdrawSaving(tokenContractAddress, depositedAmount, 0);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    expect(savedBalance.balance).to.equal(0);
    expect(savedBalance.goal).to.equal(savingGoal);
  });

  it('add to an existing Saving', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    const addedAmount = tokensAmount(100);
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);

    // Act
    await tokenContract.approve(savingContractAddress, addedAmount);
    await savingContract.addToSaving(tokenContractAddress, addedAmount, 0);

    const savedBalance: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    expect(savedBalance.balance).to.equal(tokensAmount(600));
    expect(savedBalance.goal).to.equal(savingGoal);
  });

  it('query the progress of a Saving', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const depositedAmount = tokensAmount(500);
    await tokenContract.approve(savingContractAddress, depositedAmount);
    await savingContract.createSaving(tokenContractAddress, depositedAmount, savingGoal, false);

    // Act
    const progress: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    expect(progress.balance).to.equal(depositedAmount);
    expect(progress.goal).to.equal(savingGoal);
    expect(progress.progress).to.equal(50);
  });

  it('query all the Savings for a user', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { tokenContract: anotherTokenContract, tokenContractAddress: anotherTokenContractAddress } = await loadFixture(deployAnotherErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    const anotherSavingGoal = tokensAmount(1000);
    await tokenContract.approve(savingContractAddress, savingGoal);
    await anotherTokenContract.approve(savingContractAddress, anotherSavingGoal);

    // Act
    await savingContract.createSaving(tokenContractAddress, tokensAmount(500), savingGoal, false);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(7), tokensAmount(10), false);
    await savingContract.createSaving(anotherTokenContractAddress, tokensAmount(600), anotherSavingGoal, false);

    const userSavings: Saving.SavingsStructOutput[] = await savingContract.getUserSavings();
    expect(userSavings.length).to.equal(3);
    expect(userSavings[0].balance).to.equal(tokensAmount(500));
    expect(userSavings[0].goal).to.equal(savingGoal);
    expect(userSavings[1].balance).to.equal(tokensAmount(7));
    expect(userSavings[1].goal).to.equal(tokensAmount(10));
    expect(userSavings[2].balance).to.equal(tokensAmount(600));
    expect(userSavings[2].goal).to.equal(anotherSavingGoal);
  });

  it('transfer from one Saving to another', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    await tokenContract.approve(savingContractAddress, savingGoal);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(500), savingGoal, false);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(7), savingGoal, false);

    // Act
    await savingContract.transferASavingToAnother(tokenContractAddress, 1, 0, tokensAmount(7));

    const firstSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    const secondSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 1);
    expect(firstSaving.balance).to.equal(tokensAmount(507));
    expect(secondSaving.balance).to.equal(tokensAmount(0));
  });

  it('transfer from one Saving to another handling excess', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    await tokenContract.approve(savingContractAddress, savingGoal);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(500), savingGoal, false);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(7), tokensAmount(10), false);

    // Act
    await savingContract.transferASavingToAnother(tokenContractAddress, 0, 1, tokensAmount(7));

    const firstSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 0);
    const secondSaving: Saving.SavingsStructOutput = await savingContract.getSavings(tokenContractAddress, 1);
    expect(firstSaving.balance).to.equal(tokensAmount(497));
    expect(secondSaving.balance).to.equal(tokensAmount(10));
  });

  it('lock a Saving until goal is reached', async function () {
    const { tokenContract, tokenContractAddress } = await loadFixture(deployErc20Fixture);
    const { savingContract, savingContractAddress } = await loadFixture(deployFixture);
    const savingGoal = tokensAmount(1000);
    await tokenContract.approve(savingContractAddress, savingGoal);
    await savingContract.createSaving(tokenContractAddress, tokensAmount(500), savingGoal, true);

    // Act
    // revert withdrawSaving if the Saving is locked
    await expect(savingContract.withdrawSaving(tokenContractAddress, tokensAmount(500), 0)).to.be.revertedWith('Saving is locked until goal is reached');
  });


  // Edge cases
  //TODO: Create a test for the case when the user tries to withdraw more than the goal
  //TODO: Create a test for the case when the user adds to a Saving that has already reached the goal
  //TODO: Create a test for the case when the user adds to a Saving and the total balance exceeds the goal

});

function tokensAmount(amount: number): BigNumberish {
  return ethers.parseEther(`${amount}`)
}