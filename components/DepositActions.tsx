import { Button, useToast } from "@chakra-ui/react";
import { Deposit } from "@prisma/client";
import { useState } from "react";
import { DSVContract, TokenContract } from "../helpers/contract";
import { CONFIG_FRONT } from "../config";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { DepositIntent } from "../helpers/types";
import { updateBalance, upsertDeposit } from "../helpers/api";
import { formatAddress, txScannerURL } from "../helpers/accounts";
import { getOperationStatus } from "../helpers/status";
import { format } from "path";

type Props = {
  deposit: Deposit;
  isMember: Boolean;
};

export const DepositActions = (props: Props) => {
  const { deposit, isMember } = props;
  const toast = useToast();
  const router = useRouter();
  // Using 0 for initial, 1 for Satisfy clicked and 2 for approved
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const approve = async () => {
    setLoading(true);
    const tokenContract = new TokenContract(deposit.tokenAddress);
    try {
      const txHash = await tokenContract.approve(
        CONFIG_FRONT.DSV_CONTRACT,
        ethers.utils.parseEther(deposit.amount)
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
      });
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Request failed",
        description: (error as Error)?.message,
        status: "error",
        duration: 5000,
        position: "top-right",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const satisfy = async () => {
    setLoading(true);
    const dsvContract = new DSVContract();
    try {
      const depositIntent: DepositIntent = {
        sender: formatAddress(deposit.sender),
        tokenAddress: formatAddress(deposit.tokenAddress),
        initiatorAddress: formatAddress(deposit.initiatorAddress),
        receiverId: deposit.receiverId,
        amount: ethers.utils.parseEther(deposit.amount),
      };
      const txHash = await dsvContract.satisfyDepositIntent(depositIntent);

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
        onCloseComplete: () => router.reload(),
      });

      // update balance
      await updateBalance(
        deposit.receiverId,
        deposit.tokenAddress,
        "0", // 0 locked
        deposit.amount // positive since it's a deposit
      );

      // update deposit status
      await upsertDeposit({ ...deposit, confirmTx: txHash });
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

  const cancel = async () => {
    setLoading(true);
    const dsvContract = new DSVContract();
    try {
      const depositIntent: DepositIntent = {
        sender: formatAddress(deposit.sender),
        tokenAddress: formatAddress(deposit.tokenAddress),
        initiatorAddress: formatAddress(deposit.initiatorAddress),
        receiverId: deposit.receiverId,
        amount: ethers.utils.parseEther(deposit.amount),
      };

      const txHash = await dsvContract.cancelDepositIntent(depositIntent);

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
        onCloseComplete: () => router.reload(),
      });

      // update deposit
      await upsertDeposit({ ...deposit, cancelTx: txHash });
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

  if (getOperationStatus(deposit) !== "SUBMITTED") return <></>;
  else if (isMember) {
    return (
      <Button
        size="xs"
        colorScheme="red"
        isLoading={isLoading}
        onClick={cancel}
      >
        Cancel
      </Button>
    );
  } else {
    switch (currentStep) {
      case 0:
        return (
          <Button
            size="xs"
            colorScheme="blue"
            onClick={() => setCurrentStep(1)}
          >
            Satisfy
          </Button>
        );
      case 1:
        return (
          <Button
            size="xs"
            isLoading={isLoading}
            colorScheme="yellow"
            onClick={() => {
              approve();
            }}
          >
            Approve
          </Button>
        );
      case 2:
        return (
          <Button
            size="xs"
            isLoading={isLoading}
            colorScheme="green"
            onClick={satisfy}
          >
            Submit
          </Button>
        );
      default:
        return <></>;
    }
  }
};
