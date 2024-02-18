import './styles/Home.css';
import { useFuse } from './hooks/fuse.hook';
import { createWalletClient, custom, Address, createPublicClient, http } from 'viem';
import { localhost, fuse } from 'viem/chains';
import { useEffect, useState } from 'react';
import { savingContract } from './contracts/saving';
import { erc20Abi } from 'viem';
import { type Saving } from './components/saving/Saving';
import NewSavingCard from './components/newSavingCard/NewSavingCard';
import SavingCard from './components/saving/Saving';

const walletClient = createWalletClient({
  chain: !import.meta.env.DEV ? localhost : fuse,
  transport: custom(window.ethereum!),
});

const publicClient = createPublicClient({
  chain: !import.meta.env.DEV ? localhost : fuse,
  transport: http(),
});

export default function Home() {
  const { fuse, loading } = useFuse();
  const [account, setAccount] = useState<Address>();
  const [userSavings, setUserSavings] = useState<Saving[]>();

  const connect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
  };

  const createSaving = async (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => {
    if (!account && !fuse) return;
    const { request } = await publicClient.simulateContract({
      ...savingContract,
      functionName: 'createSaving',
      account,
      args: [tokenAddress, amount, goal, isLocked],
    });
    const hash = await walletClient.writeContract(request);
    console.log('Transaction hash:', hash);
  };

  const getUserSavings = async () => {
    if (!account) return;
    const res = await publicClient.readContract({
      ...savingContract,
      functionName: 'getUserSavings',
      account,
      args: [],
    });

    setUserSavings(res as Saving[]);
  };

  const increaseAllowance = async (tokenAddress: Address, amount: bigint) => {
    if (!account) return;

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      account,
      args: [account, savingContract.address],
    });

    if (allowance < amount) {
      const { request, result } = await publicClient.simulateContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        account,
        args: [savingContract.address, amount],
      });
      if (result) {
        const hash = await walletClient.writeContract(request);
        console.log('Transaction hash:', hash);
      }
    }
  };

  const withdraw = async (tokenAddress: Address, amount: bigint, id: bigint) => {
    if (!account) return;
    const { request } = await publicClient.simulateContract({
      ...savingContract,
      functionName: 'withdrawSaving',
      account,
      args: [tokenAddress, amount, id],
    });
    const hash = await walletClient.writeContract(request);
    console.log('Transaction hash:', hash);
  };

  const deposit = async (tokenAddress: Address, amount: bigint, id: bigint) => {
    if (!account) return;
    const { request } = await publicClient.simulateContract({
      ...savingContract,
      functionName: 'addToSaving',
      account,
      args: [tokenAddress, amount, id],
    });
    const hash = await walletClient.writeContract(request);
    console.log('Transaction hash:', hash);
  };

  useEffect(() => {
    getUserSavings();

    const interval = setInterval(() => {
      getUserSavings();
    }, 10000);

    return () => clearInterval(interval);
  }, [account]);

  if (loading) return <div>Loading...</div>;

  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Welcome to <span className="gradient-text-0">SavingsApp.</span>
          </h1>

          <p className="description">
            Make your{' '}
            <span className="gradient-text-3">
              <u>dreams come true</u>
            </span>
            , one token at a time! Join our savings contract and turn your goals into <b>effortless achievements.</b>{' '}
            🚀💰 <span className="gradient-text-1">#SmartSavings.</span>
          </p>
        </div>
        {account ? (
          <div>
            <div>Connected: {account}</div>
          </div>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}

        <div className="grid">
          {userSavings?.map((saving) => (
            <div key={saving.id.toString()} className="card">
              <SavingCard saving={saving} withdraw={withdraw} deposit={deposit} />
            </div>
          ))}

          <NewSavingCard
            title="Create a saving"
            description="Create"
            createSaving={createSaving}
            increaseAllowance={increaseAllowance}
          />
        </div>
      </div>
    </main>
  );
}
