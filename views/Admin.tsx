import { Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MembersViewer } from "../components";
import { getConnectedAccount, isMetaMaskInstalled } from "../helpers/accounts";
import { DSVContract, checkConnectedChainId } from "../helpers/contract";
import { Member } from "@prisma/client";

export const Admin = () => {
  const [isCorrectChainId, setCorrectChainId] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [isOperator, setOperator] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const updateAccount = async () => {
    setConnectedAddress(await getConnectedAccount());
  };

  const updateChain = async () => {
    setCorrectChainId(await checkConnectedChainId());
  };

  const updateOperator = async () => {
    console.log('connectedAddress:', connectedAddress);
    if (connectedAddress === "") setOperator(false);
    else {
      const dsvContract = new DSVContract();
      const retVal = await dsvContract.isAdmin(connectedAddress);
      console.log(`connectedAddress (${connectedAddress}) isAdmin: ${retVal}`);
      setOperator(retVal);
    }
  };

  const updateMembers = async () => {
    if (connectedAddress != "") {
      const res = await fetch(`/api/members`);
      const data = await res.json();
      console.log(data);
      setMembers(data);
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
    updateMembers();
  }, [connectedAddress]);

  return (
    <Stack align="center" justify="center">
      {!isCorrectChainId ? (
        <Text>Please connect to Sepolia to proceed.</Text>
      ) : !isOperator ? (
        <Text>Please connect the Admin account to proceed.</Text>
      ) : (
        <MembersViewer members={members} />
      )}
    </Stack>
  );
};
