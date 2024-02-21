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
  Select,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Address } from 'viem';
import { useWalletClient } from '../../hooks/walletClient.hook';
import { useAlchemy } from '../../hooks/alchemys.hook';
import { TokenBalance, TokenMetadataResponse } from 'alchemy-sdk';

interface NewSavingCardProps {
  createSaving: (tokenAddress: Address, amount: bigint, goal: bigint, isLocked: boolean) => Promise<void>;
  increaseAllowance: (tokenAddress: Address, amount: bigint) => Promise<void>;
}

export default function NewSavingCard(props: NewSavingCardProps) {
  const { getAddresses } = useWalletClient();
  const { core } = useAlchemy();
  const [account, setAccount] = useState<Address>();
  const [amount, setAmount] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [ERC20Token, setERC20Token] = useState<Address>('0x');
  const [lock, setLock] = useState<boolean>(false);
  const [tokenBalances, setTokenAddresses] = useState<TokenBalance[]>([]);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadataResponse[]>([]);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setERC20Token(event.target.value as Address);
    setGoal('');
    setAmount('');
    setLock(false);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleGoalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(event.target.value);
  };

  const handleLockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLock(event.target.checked);
  };

  const handleClick = async () => {
    if (+amount > +goal) {
      alert('Amount exceeds goal');
      return;
    }
    const tokenIndex = tokenBalances.findIndex((token) => token.contractAddress === ERC20Token);
    const parsedGoal = ethers.utils.parseUnits(goal, decimalToNamesMap(tokenMetadata[tokenIndex])).toBigInt();
    const parsedAmount = ethers.utils.parseUnits(amount, decimalToNamesMap(tokenMetadata[tokenIndex])).toBigInt();

    await props.increaseAllowance(ERC20Token, parsedGoal);
    await props.createSaving(ERC20Token, parsedAmount, parsedGoal, lock);
  };

  const shortenTokenAddress = (tokenAddress: string) => {
    return tokenAddress.substring(0, 6) + '...' + tokenAddress.substring(tokenAddress.length - 4);
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
      setTokenAddresses(balances.tokenBalances);
      const promises = balances.tokenBalances.map((token) => core.getTokenMetadata(token.contractAddress));
      Promise.all(promises).then((metadata) => {
        setTokenMetadata(metadata);
      });
    });
  }, [account]);

  const formatTokenUnits = (tokenBalance: bigint, tokenMetadata?: TokenMetadataResponse) => {
    return ethers.utils.formatUnits(tokenBalance, tokenMetadata?.decimals ?? 18);
  };

  const decimalToNamesMap = (token: TokenMetadataResponse): string => {
    const index = token.decimals ?? 18;
    const decimalToNamesMap: { [key: number]: string } = {
      0: 'wei',
      3: 'kwei',
      6: 'mwei',
      9: 'gwei',
      12: 'szabo',
      15: 'finney',
      18: 'ether',
    };
    return decimalToNamesMap[index];
  };

  useEffect(() => {
    setIsDisabled(ERC20Token === '0x' || ERC20Token.toString() === '');
  }, [ERC20Token]);

  const matchesNumbersOnlyWithDecimals = (value: string) => {
    return !/^\d*\.?\d*$/.test(value);
  };

  const isInvalid = () => matchesNumbersOnlyWithDecimals(amount) || matchesNumbersOnlyWithDecimals(goal);

  return (
    <Card maxW="sm" size="sm" marginRight={'5rem'}>
      <CardBody>
        <Image src="/images/vault.jpeg" alt="Green double couch with wooden legs" borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">Start setting your goals today!</Heading>
          <InputGroup>
            <Select placeholder="Token address" onChange={handleTokenChange}>
              {tokenBalances.map((token, index) => (
                <option key={token.contractAddress} value={token.contractAddress}>
                  {tokenMetadata[index] && ` (${tokenMetadata[index].symbol}) `}
                  {formatTokenUnits(
                    ethers.BigNumber.from(token.tokenBalance).toBigInt(),
                    tokenMetadata[index]
                  )} --&gt; {shortenTokenAddress(token.contractAddress)}
                </option>
              ))}
            </Select>
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>Amount</InputLeftAddon>
            <Input
              value={amount}
              onChange={handleAmountChange}
              disabled={isDisabled}
              isInvalid={matchesNumbersOnlyWithDecimals(amount)}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>Goal</InputLeftAddon>
            <Input
              value={goal}
              onChange={handleGoalChange}
              disabled={isDisabled}
              isInvalid={matchesNumbersOnlyWithDecimals(goal)}
            />
          </InputGroup>

          <Checkbox checked={lock} colorScheme="green" onChange={handleLockChange} disabled={isDisabled}>
            Lock until goal is reached?
          </Checkbox>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue" onClick={handleClick} disabled={isInvalid()}>
            Create!
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
