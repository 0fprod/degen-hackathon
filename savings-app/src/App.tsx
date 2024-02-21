import React from 'react';
import NewSavingCard from './components/newSavingCard/NewSavingCard';
import SavingCard from './components/saving/Saving';
import { Address } from 'viem';
import { useEffect, useState } from 'react';
import { savingContract } from './contracts/saving';
import { erc20Abi } from 'viem';
import { type Saving } from './components/saving/Saving';
import { Box, Button, Heading, SimpleGrid, VStack, Text, Divider, useToast } from '@chakra-ui/react';
import { useWalletClient } from './hooks/walletClient.hook';
import { usePublicClient } from './hooks/walletPublic.hook';

export default function Home() {
  const toast = useToast();
  const [account, setAccount] = useState<Address>();
  const [userSavings, setUserSavings] = useState<Saving[]>();
  const walletClient = useWalletClient();
  const publicClient = usePublicClient();

  const connect = async () => {
    walletClient.requestAddresses().then((address) => {
      setAccount(address[0]);
    });
    toast.promise(walletClient.requestAddresses(), {
      success: { title: 'Wallet connected', description: 'You are now connected to your wallet' },
      error: { title: 'Wallet not connected', description: 'Please connect your wallet' },
      loading: { title: 'Connecting wallet', description: 'Please wait' },
    });
  };

  const disconnect = () => {
    setAccount(undefined);
    toast({
      title: 'Disconnected.',
      description: "We've created your account for you.",
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    setUserSavings([]);
  };

  const createSaving = async (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => {
    if (!account) return;
    try {
      const { request } = await publicClient.simulateContract({
        ...savingContract,
        functionName: 'createSaving',
        account,
        args: [tokenAddress, amount, goal, isLocked],
      });

      const hash = await walletClient.writeContract(request);
      toast({
        title: 'Transaction sent',
        position: 'top-right',
        description: `Create saving: ${amount}. TxHash: ${hash}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Transaction failed',
        position: 'top-right',
        description: 'Create saving failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
      try {
        const { request } = await publicClient.simulateContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          account,
          args: [savingContract.address, amount],
        });
        const hash = await walletClient.writeContract(request);

        // show toast
        toast({
          title: 'Transaction sent',
          position: 'top-right',
          description: `Approve: ${amount}. TxHash: ${hash}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: 'Transaction failed',
          position: 'top-right',
          description: 'Approve failed',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
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

  useEffect(() => {
    const fetchAddress = async () => {
      const [address] = await walletClient.requestAddresses();
      setAccount(address);
    };

    toast.promise(fetchAddress(), {
      success: {
        title: 'Wallet connected',
        description: 'You are now connected to your wallet',
        position: 'top-right',
      },
      error: { title: 'Wallet not connected', description: 'Please connect your wallet', position: 'top-right' },
      loading: { title: 'Connecting wallet', description: 'Please wait', position: 'top-right' },
    });

    fetchAddress();
  }, []);

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
            <Button onClick={disconnect}> Disconnect </Button>
          </React.Fragment>
        ) : (
          <Button onClick={connect}>Connect Wallet</Button>
        )}
      </Box>
      <Divider />
      <Heading>My Savings</Heading>
      <SimpleGrid columns={3} spacing={5}>
        <NewSavingCard createSaving={createSaving} increaseAllowance={increaseAllowance} key={userSavings?.length} />

        {userSavings?.map((saving) => (
          <SavingCard key={saving.id.toString()} saving={saving} withdraw={withdraw} deposit={deposit} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
