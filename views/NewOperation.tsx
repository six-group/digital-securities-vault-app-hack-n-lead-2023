import { Stack, StackDivider, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NewDepositForm, NewWithdrawalForm } from "../components";
import { getConnectedAccount, isMetaMaskInstalled } from "../helpers/accounts";
import { checkConnectedChainId } from "../helpers/contract";

type Props = {
  isDeposit: Boolean;
};

export const NewOperation = (props: Props) => {
  const { isDeposit } = props;
  const [isCorrectChainId, setCorrectChainId] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [memberId, setMemberId] = useState("");

  const updateAccount = async () => {
    setConnectedAddress(await getConnectedAccount());
  };

  const updateChain = async () => {
    setCorrectChainId(await checkConnectedChainId());
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
    const updateMemberId = async () => {
      if (isCorrectChainId && connectedAddress !== "") {
        const res = await fetch(
          `/api/members?connectedAddress=${connectedAddress}`
        );
        const data = await res.json();
        console.log("Member by address:", data);
        setMemberId(data.id);

        console.log(data.id);
      } else {
        setMemberId("");
      }
    };
    updateMemberId();
  }, [isCorrectChainId, connectedAddress]);

  return (
    <Stack align="center" justify="center">
      {!isCorrectChainId ? (
        <Text>Please connect to Sepolia to proceed.</Text>
      ) : connectedAddress === "" ? (
        <Text>Please connect account to proceed.</Text>
      ) : (
        <VStack divider={<StackDivider borderColor="gray.200" />} w={"100%"}>
          {isDeposit ? (
            <NewDepositForm
              connectedAddress={connectedAddress}
              memberId={memberId}
            />
          ) : (
            <NewWithdrawalForm
              connectedAddress={connectedAddress}
              memberId={memberId}
            />
          )}
        </VStack>
      )}
    </Stack>
  );
};
