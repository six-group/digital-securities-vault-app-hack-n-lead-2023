import { Button, HStack, useToast } from "@chakra-ui/react";
import { Withdrawal } from "@prisma/client";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import { formatAddress, txScannerURL } from "../helpers/accounts";
import { updateBalance, upsertWithdrawal } from "../helpers/api";
import { DSVContract } from "../helpers/contract";
import { getOperationStatus } from "../helpers/status";
import { WithdrawalIntent } from "../helpers/types";

type Props = {
  withdrawal: Withdrawal;
  isOperator: Boolean;
};

export const WithdrawalActions = (props: Props) => {
  const { withdrawal, isOperator } = props;
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const cancel = async () => {
    setLoading(true);
    const dsvContract = new DSVContract();
    try {
      const withdrawalIntent: WithdrawalIntent = {
        tokenAddress: formatAddress(withdrawal.tokenAddress),
        withdrawalAddress: formatAddress(withdrawal.withdrawalAddress),
        initiatorAddress: formatAddress(withdrawal.initiatorAddress),
        amount: ethers.utils.parseEther(withdrawal.amount),
      };

      const txHash = await dsvContract.cancelWithdrawalIntent(withdrawalIntent);

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
        withdrawal.initiatorId,
        withdrawal.tokenAddress,
        "-" + withdrawal.amount, // amount gets unlocked so we add minus
        "0" // no change for total
      );

      // update withdrawal
      await upsertWithdrawal({ ...withdrawal, cancelTx: txHash });
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

  const confirm = async () => {
    setLoading(true);
    const dsvContract = new DSVContract();
    try {
      const withdrawalIntent: WithdrawalIntent = {
        tokenAddress: formatAddress(withdrawal.tokenAddress),
        withdrawalAddress: formatAddress(withdrawal.withdrawalAddress),
        initiatorAddress: formatAddress(withdrawal.initiatorAddress),
        amount: ethers.utils.parseEther(withdrawal.amount),
      };

      const txHash = await dsvContract.confirmWithdrawalIntent(
        withdrawalIntent
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
        onCloseComplete: () => router.reload(),
      });

      // update balance
      await updateBalance(
        withdrawal.initiatorId,
        withdrawal.tokenAddress,
        "-" + withdrawal.amount, // amount gets unlocked so we add minus
        "-" + withdrawal.amount // total also decreases by the same amount
      );

      // update withdrawal
      await upsertWithdrawal({ ...withdrawal, confirmTx: txHash });
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

  if (getOperationStatus(withdrawal) !== "SUBMITTED") return <></>;
  return (
    <HStack>
      <Button
        size="xs"
        colorScheme="red"
        isLoading={isLoading}
        onClick={cancel}
      >
        Cancel
      </Button>
      {isOperator && (
        <Button
          size="xs"
          colorScheme="green"
          isLoading={isLoading}
          onClick={confirm}
        >
          Confirm
        </Button>
      )}
    </HStack>
  );
};
