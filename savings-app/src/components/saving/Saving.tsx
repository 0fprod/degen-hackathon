import { ethers } from 'ethers';
import React from 'react';
import { Address } from 'viem';

export type Saving = {
  id: bigint;
  tokenAddress: Address;
  balance: bigint;
  goal: bigint;
  progress: number;
  isLocked: boolean;
};

interface SavingProps {
  saving: Saving;
  withdraw: (tokenAddress: Address, amount: bigint, id: bigint) => void;
  deposit: (tokenAddress: Address, amount: bigint, id: bigint) => void;
}

export default function SavingCard(props: SavingProps) {
  const randomBetween0And3 = Math.floor(Math.random() * 4);
  const className = `gradient-text-${randomBetween0And3}`;
  const { tokenAddress, balance, goal, isLocked, progress, id } = props.saving;
  const trimmedTokenAddress = tokenAddress.slice(0, 6) + '...' + tokenAddress.slice(-4);
  // add input for the amount to withdraw
  const [amount, setAmount] = React.useState<bigint>(0n);

  const handleWithdraw = () => {
    props.withdraw(tokenAddress, amount, id);
  };

  const handleDeposit = () => {
    // show alert if amount exceeds goal
    if (amount + balance > goal) {
      alert('Amount exceeds goal');
      return;
    }
    props.deposit(tokenAddress, amount, id);
  };

  return (
    <React.Fragment>
      <img src="/images/moneybag.jpeg" alt="Saving" style={{ maxWidth: '15rem', margin: 'auto', maxHeight: '10rem' }} />
      <div className="card-text">
        <h2 className={className}>Progress: {progress}%</h2>
        <p>Current balance: {ethers.utils.formatUnits(balance)}</p>
        <p>Goal: {ethers.utils.formatUnits(goal)}</p>
        <p>Token address: {trimmedTokenAddress}</p>
        <p>Locked: {isLocked ? 'Yes' : 'No'}</p>
        <input
          type="text"
          value={ethers.utils.formatUnits(amount)}
          onChange={(e) => setAmount(ethers.utils.parseEther(e.target.value).toBigInt())}
        />
        <button onClick={handleWithdraw}> Withdraw </button>
        <button onClick={handleDeposit}> Deposit </button>
      </div>
    </React.Fragment>
  );
}
