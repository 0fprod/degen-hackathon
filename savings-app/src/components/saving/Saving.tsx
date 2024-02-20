import {
  Image,
  Text,
  Card,
  CardBody,
  Stack,
  Heading,
  InputGroup,
  InputLeftAddon,
  Input,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Progress,
} from '@chakra-ui/react';
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
  const { tokenAddress, balance, goal, isLocked, progress, id } = props.saving;
  const trimmedTokenAddress = tokenAddress.slice(0, 6) + '...' + tokenAddress.slice(-4);
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
    <Card maxW="sm" size="sm" bg={'#CFD7C7'}>
      <CardBody>
        <Image src="/images/moneybag.jpeg" borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size={'md'}>Token address: {trimmedTokenAddress}</Heading>
          <Text>
            <b>Progress:</b> {progress} %
            <Progress colorScheme="green" size="sm" value={progress} hasStripe />
          </Text>
          <Text>
            <b>Goal:</b> {ethers.utils.formatUnits(goal)}
          </Text>
          <Text>
            <b>Current balance: </b> {ethers.utils.formatUnits(balance)}
          </Text>
          <Text>
            <b>Locked:</b> {isLocked ? 'Yes' : 'No'}
          </Text>
          <InputGroup>
            <InputLeftAddon>Amount</InputLeftAddon>
            <Input
              value={ethers.utils.formatEther(amount)}
              onChange={(e) => setAmount(ethers.utils.parseEther(e.target.value).toBigInt())}
            />
          </InputGroup>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" bg={'#AF3B6E'} color="white" onClick={handleWithdraw}>
            Withdraw
          </Button>
          <Button variant="solid" colorScheme="blue" onClick={handleDeposit}>
            Deposit
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
