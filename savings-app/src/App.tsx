import { createWalletClient, custom, Address, createPublicClient, http } from 'viem';
import { localhost } from 'viem/chains';
import { useEffect, useState } from 'react';
import { savingContract } from './contracts/saving';
import { erc20Abi } from 'viem';
import { type Saving } from './components/saving/Saving';
import NewSavingCard from './components/newSavingCard/NewSavingCard';
import SavingCard from './components/saving/Saving';
import { Box, Button, Heading, SimpleGrid, VStack, Text, Divider } from '@chakra-ui/react';
import React from 'react';

const walletClient = createWalletClient({
  chain: localhost,
  transport: custom(window.ethereum!),
});

const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

export default function Home() {
  const [account, setAccount] = useState<Address>();
  const [userSavings, setUserSavings] = useState<Saving[]>();

  const connect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
  };

  const createSaving = async (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => {
    if (!account) return;
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
    try {
      const res = await publicClient.readContract({
        ...savingContract,
        functionName: 'getUserSavings',
        account,
        args: [],
      });

      setUserSavings(res as Saving[]);
    } catch (e) {
      console.error(e);
      setUserSavings([]);
    }
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

  return (
    <VStack padding={'2rem'} alignItems={'flex-start'} bg={'#0B2027'} color={'white'}>
      <Heading>Welcome to SavingsApp!</Heading>
      <Divider />

      <Text>
        Make your dreams come true, one token at a time! Join our savings contract and turn your goals into effortless
        achievements. 🚀💰 #SmartSavings
      </Text>
      <Box margin={'1rem'}>
        {account ? (
          <React.Fragment>
            <Text>Connected: {account}</Text>
            <Button> Disconnect </Button>
          </React.Fragment>
        ) : (
          <Button onClick={connect}>Connect Wallet</Button>
        )}
      </Box>
      <Divider />
      <Heading>My Savings</Heading>
      <SimpleGrid columns={3} spacing={5}>
        <NewSavingCard createSaving={createSaving} increaseAllowance={increaseAllowance} />

        {userSavings?.map((saving) => (
          <SavingCard key={saving.id.toString()} saving={saving} withdraw={withdraw} deposit={deposit} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
