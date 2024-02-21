import {
  Image,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Stack,
  Checkbox,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Address } from 'viem';
import { useWalletClient } from '../../hooks/walletClient.hook';
import { useAlchemy } from '../../hooks/alchemys.hook';

interface NewSavingCardProps {
  createSaving: (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => void;
  increaseAllowance: (tokenAddress: Address, amount: bigint) => void;
}

export default function NewSavingCard(props: NewSavingCardProps) {
  const { getAddresses } = useWalletClient();
  const { core } = useAlchemy();
  const [account, setAccount] = useState<Address>();
  const [amount, setAmount] = useState<bigint>(0n);
  const [goal, setGoal] = useState<bigint>(0n);
  const [ERC20Token, setERC20Token] = useState<Address>('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
  const [lock, setLock] = useState<boolean>(false);

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

  const handleClick = () => {
    if (amount > goal) {
      alert('Amount exceeds goal');
      return;
    }
    props.increaseAllowance(ERC20Token, goal);
    props.createSaving(ERC20Token, amount, goal, lock);
  };

  useEffect(() => {
    const fetchAddress = async () => {
      const [address] = await getAddresses();
      setAccount(address);
    };
    fetchAddress();
  }, []);

  useEffect(() => {
    if (account === undefined) return;

    core.getTokenBalances(`${account}`).then((balances) => {
      console.log(balances);
    });
  }, [account]);

  return (
    <Card maxW="sm" size="sm" marginRight={'5rem'}>
      <CardBody>
        <Image src="/images/vault.jpeg" alt="Green double couch with wooden legs" borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">Start setting your goals today!</Heading>
          <InputGroup>
            <InputLeftAddon>Amount</InputLeftAddon>
            <Input value={ethers.utils.formatEther(amount)} onChange={handleAmountChange} />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>Goal</InputLeftAddon>
            <Input value={ethers.utils.formatEther(goal)} onChange={handleGoalChange} />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>Token</InputLeftAddon>
            <Input value={ERC20Token} onChange={handleTokenChange} />
          </InputGroup>

          <Checkbox checked={lock} colorScheme="green" onChange={handleLockChange}>
            Lock until goal is reached?
          </Checkbox>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue" onClick={handleClick}>
            Create!
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
