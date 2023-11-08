import { Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NewMemberForm } from "../components";
import { getConnectedAccount, isMetaMaskInstalled } from "../helpers/accounts";
import { DSVContract, checkConnectedChainId } from "../helpers/contract";

export const NewMember = () => {
  const [isCorrectChainId, setCorrectChainId] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [isOperator, setOperator] = useState(false);

  const updateAccount = async () => {
    setConnectedAddress(await getConnectedAccount());
  };

  const updateChain = async () => {
    setCorrectChainId(await checkConnectedChainId());
  };

  const updateOperator = async () => {
    if (connectedAddress === "") setOperator(false);
    else {
      const dsvContract = new DSVContract();
      const retVal = await dsvContract.isAdmin(connectedAddress);
      console.log(retVal);
      setOperator(retVal);
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
  });

  useEffect(() => {
    updateOperator();
  }, [connectedAddress]);

  return (
    <Stack align="center" justify="center">
      {!isCorrectChainId ? (
        <Text>Please connect to Sepolia to proceed.</Text>
      ) : !isOperator ? (
        <Text>Please connect the Admin account to proceed.</Text>
      ) : (
        <NewMemberForm />
      )}
    </Stack>
  );
};
