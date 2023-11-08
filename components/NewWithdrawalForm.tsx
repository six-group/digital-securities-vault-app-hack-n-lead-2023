import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
  StackDivider,
  useToast,
} from "@chakra-ui/react";
import { Balance } from "@prisma/client";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { formatAddress, txScannerURL } from "../helpers/accounts";
import { updateBalance } from "../helpers/api";
import { DSVContract } from "../helpers/contract";
import {
  WithdrawalIntent,
  computeWithdrawalIntentHash,
} from "../helpers/types";
import { isAmountValid } from "../helpers/validity";
import { DoNotLeave } from "./DoNotLeave";

type Props = {
  connectedAddress: string;
  memberId: string;
};

export const NewWithdrawalForm = (props: Props) => {
  const { connectedAddress, memberId } = props;
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [withdrawalAddress, setwithdrawalAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [currentBalance, setCurrentBalance] = useState<BigNumber>(
    BigNumber.from(0)
  );

  useEffect(() => {
    const updateBalances = async () => {
      if (memberId !== "") {
        const res = await fetch(`/api/balances?memberId=${memberId}`);
        const data = await res.json();
        setBalances(data);
      } else {
        setBalances([]);
      }
    };
    updateBalances();
  }, [memberId]);

  useEffect(() => {
    const balance = balances.find(
      (balance) => balance.tokenAddress === tokenAddress
    );

    console.log(balances);
    console.log(tokenAddress);

    console.log("Selected Balance: ", balance);

    setCurrentBalance(
      balance
        ? ethers.utils
            .parseEther(balance.total)
            .sub(ethers.utils.parseEther(balance.locked))
        : BigNumber.from(0)
    );
  }, [tokenAddress]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dsvContract = new DSVContract();

      const withdrawalIntent: WithdrawalIntent = {
        tokenAddress: formatAddress(tokenAddress),
        withdrawalAddress: formatAddress(withdrawalAddress),
        initiatorAddress: formatAddress(connectedAddress),
        amount: ethers.utils.parseEther(amount),
      };

      const txHash = await dsvContract.submitWithdrawalIntent(withdrawalIntent);

      const withdrawalIntentHash =
        computeWithdrawalIntentHash(withdrawalIntent);

      const withdrawal = await fetch(`/api/withdrawal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: withdrawalIntentHash,
          initiatorId: memberId,
          ...withdrawalIntent,
          amount: amount, //override amount to write the string instead
          submitTx: txHash,
        }),
      });

      console.log(withdrawal);

      console.log(
        "WI submitted. Is active:",
        await dsvContract.isWithdrawalIntentActive(withdrawalIntentHash)
      );

      toast({
        title: "Transaction successfully submitted.",
        description: (
          <>
            Tx hash: {"\n"}
            <a href={txScannerURL(txHash)} target="_blank" rel="noreferrer">
              {txHash}
            </a>
            .
          </>
        ),
        status: "success",
        duration: 5000,
        position: "top-right",
        isClosable: true,
        onCloseComplete: () => router.push("/operations"),
      });
      // update balance
      const data = await updateBalance(
        memberId,
        tokenAddress,
        amount, // amount gets locked
        "0" // no change for total
      );
      console.log(data);
    } catch (error) {
      toast({
        title: "Request failed",
        description: (error as Error)?.message,
        status: "error",
        duration: 5000,
        position: "top-right",
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        direction="column"
        justify="center"
        align="stretch"
        width={"sm"}
      >
        <FormControl isRequired>
          <FormLabel>Token address</FormLabel>
          <Select
            placeholder="Select token"
            value={tokenAddress}
            onChange={(event) => setTokenAddress(event.target.value)}
          >
            {balances.map((balance, index) => (
              <option key={index} value={balance.tokenAddress}>
                {balance.tokenTicker}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Withdrawal address</FormLabel>
          <Input
            value={withdrawalAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setwithdrawalAddress(event.currentTarget.value)
            }
          />
          <FormLabel>Amount</FormLabel>
          <Input
            value={amount}
            isInvalid={!isAmountValid(amount, currentBalance)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(event.currentTarget.value)
            }
          />
          <FormHelperText>
            Available: {ethers.utils.formatEther(currentBalance)}
          </FormHelperText>
        </FormControl>
        <Button
          isLoading={isLoading}
          type="submit"
          isDisabled={!isAmountValid(amount, currentBalance)}
        >
          Submit Withdrawal Intent
        </Button>
        {isLoading && <DoNotLeave />}
      </Stack>
    </form>
  );
};
