import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Stack,
  StackDivider,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { formatAddress, txScannerURL } from "../helpers/accounts";
import { upsertDeposit } from "../helpers/api";
import { DSVContract } from "../helpers/contract";
import { DepositIntent, computeDepositIntentHash } from "../helpers/types";
import { DoNotLeave } from "./DoNotLeave";

type Props = {
  connectedAddress: string;
  memberId: string;
};

export const NewDepositForm = (props: Props) => {
  const { connectedAddress, memberId } = props;
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const dsvContract = new DSVContract();

      const depositIntent: DepositIntent = {
        sender: formatAddress(senderAddress),
        tokenAddress: formatAddress(tokenAddress),
        initiatorAddress: formatAddress(connectedAddress),
        receiverId: memberId,
        amount: ethers.utils.parseEther(amount),
      };

      const txHash = await dsvContract.submitDepositIntent(depositIntent);

      const depositIntentHash = computeDepositIntentHash(depositIntent);

      const deposit = await upsertDeposit({
        id: depositIntentHash,
        ...depositIntent,
        amount: amount, // override amount to write it in string form
        submitTx: txHash,
        cancelTx: null,
        confirmTx: null,
      });

      console.log(deposit);

      console.log(
        "DI Submitted. Is active: ",
        await dsvContract.isDepositIntentActive(depositIntentHash)
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

  const isAmountValid = (amount: string) => {
    const validShareRegEx = /^\d{1,3}(\.\d{0,6})?$/;
    return validShareRegEx.test(amount);
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
          <InputGroup>
            <Input
              value={tokenAddress}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTokenAddress(event.currentTarget.value)
              }
            />
          </InputGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Sender address</FormLabel>
          <Input
            value={senderAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSenderAddress(event.currentTarget.value)
            }
          />
          <FormLabel>Amount</FormLabel>
          <Input
            value={amount}
            isInvalid={!isAmountValid(amount)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(event.currentTarget.value)
            }
          />
        </FormControl>
        <Button isLoading={isLoading} type="submit">
          Submit Deposit Intent
        </Button>
        {isLoading && <DoNotLeave />}
      </Stack>
    </form>
  );
};
