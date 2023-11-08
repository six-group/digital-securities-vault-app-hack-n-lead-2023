import { Stack, Text } from "@chakra-ui/react";
import { Deposit, Member, Withdrawal } from "@prisma/client";
import { useEffect, useState } from "react";
import { OperationsViewer } from "../components";
import { getConnectedAccount, isMetaMaskInstalled } from "../helpers/accounts";
import { checkConnectedChainId } from "../helpers/contract";

export const Operations = () => {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [isCorrectChainId, setCorrectChainId] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOperator, setIsOperator] = useState(false);

  const updateAccount = async () => {
    setConnectedAddress(await getConnectedAccount());
  };
  const updateChain = async () => {
    setCorrectChainId(await checkConnectedChainId());
  };

  const updateDeposits = async () => {
    if (connectedAddress != "") {
      const res = await fetch(
        `/api/deposits?connectedAddress=${connectedAddress}`
      );
      const data = await res.json();
      console.log(data);
      setDeposits(data);
    }
  };

  const updateWithdrawals = async () => {
    if (connectedAddress != "") {
      const res = await fetch(
        `/api/withdrawals?connectedAddress=${connectedAddress}`
      );
      const data = await res.json();
      console.log(data);
      setWithdrawals(data);
    }
  };

  const updateIsMember = async () => {
    if (connectedAddress !== "") {
      const res = await fetch(
        `/api/members?connectedAddress=${connectedAddress}`
      );
      const data: Member = await res.json();
      setIsMember(data ? true : false);
      setIsOperator(data ? data.isOperator : false);
    } else {
      setIsMember(false);
      setIsOperator(false);
    }
  };

  if (typeof window !== "undefined" && isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", async () => {
      updateAccount();
    });
    window.ethereum.on("chainChanged", async () => {
      updateChain();
    });
  }

  useEffect(() => {
    updateChain();
    updateAccount();
  }, []);

  useEffect(() => {
    updateIsMember();
    updateDeposits();
    updateWithdrawals();
  }, [connectedAddress]);

  return (
    <Stack align="center" justify="center">
      {!isCorrectChainId ? (
        <Text>Please connect to Sepolia to proceed.</Text>
      ) : connectedAddress === "" ? (
        <Text>Please connect account to proceed.</Text>
      ) : (
        <OperationsViewer
          deposits={deposits}
          withdrawals={withdrawals}
          isMember={isMember}
          isOperator={isOperator}
        />
      )}
    </Stack>
  );
};
