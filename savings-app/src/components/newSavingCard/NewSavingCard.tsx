import { ethers } from 'ethers';
import React from 'react';
import { Address } from 'viem';

interface NewSavingCardProps {
  title: string;
  description: string;
  createSaving: (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => void;
  increaseAllowance: (tokenAddress: Address, amount: bigint) => void;
}

//TODO: Parametrize this with the actual token address fetched from the user wall
export default function NewSavingCard(props: NewSavingCardProps) {
  const randomBetween0And3 = Math.floor(Math.random() * 4);
  const className = `gradient-text-${randomBetween0And3}`;
  // const ERC20Token = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  // const amount = ethers.utils.parseEther('10').toBigInt();
  // const goal = ethers.utils.parseEther('100').toBigInt();
  // Create a form in this component where the user can input the amount, goal and token address
  const [amount, setAmount] = React.useState<bigint>(0n);
  const [goal, setGoal] = React.useState<bigint>(0n);
  const [ERC20Token, setERC20Token] = React.useState<Address>('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
  const [lock, setLock] = React.useState<boolean>(false);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(ethers.utils.parseEther(event.target.value).toBigInt());
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(ethers.utils.parseEther(event.target.value).toBigInt());
  };

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setERC20Token(event.target.value as Address);
  };

  const handleLockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLock(event.target.checked);
  };

  const handleClick = async () => {
    // First we need to increase the allowance of the token to the saving contract
    // show alert if amount exceeds goal
    if (amount > goal) {
      alert('Amount exceeds goal');
      return;
    }
    await props.increaseAllowance(ERC20Token, goal);
    props.createSaving(ERC20Token, amount, goal, lock);
  };

  return (
    <div className="card" style={{ marginLeft: '3rem' }}>
      <img
        src="/images/vault.jpeg"
        alt="create saving account"
        style={{ maxWidth: '15rem', margin: 'auto', maxHeight: '10rem' }}
      />
      <div className="card-text">
        <h2 className={className}>{props.title}</h2>
      </div>
      <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <label>
          Amount:
          <input type="text" value={ethers.utils.formatEther(amount)} onChange={handleAmountChange} />
        </label>
        <label>
          Goal:
          <input type="text" value={ethers.utils.formatEther(goal)} onChange={handleGoalChange} />
        </label>
        <label>
          Token address:
          <input type="text" value={ERC20Token} onChange={handleTokenChange} />
        </label>
        <label>
          Lock until goal is reached:
          <input type="checkbox" checked={lock} onChange={handleLockChange} />
        </label>
      </form>
      <button className="installButton" onClick={() => handleClick()} style={{ marginLeft: '1rem' }}>
        {props.description}
      </button>
    </div>
  );
}
