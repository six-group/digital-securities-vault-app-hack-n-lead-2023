import {
  Button,
  Box,
  Flex,
  Spacer,
  Heading,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getConnectedAccount,
  isMetaMaskInstalled,
  sliceAddress,
} from "../helpers/accounts";

export const Header = () => {
  const router = useRouter();
  const toast = useToast();
  const [connectedAddress, setConnectedAddress] = useState("");

  const connectAccount = async () => {
    if (isMetaMaskInstalled()) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setConnectedAddress(await getConnectedAccount());
    } else {
      toast({
        title: "Metamask not found!",
        description: "Please install the Metamask extension to continue.",
        status: "warning",
        duration: 5000,
        position: "top-right",
        isClosable: true,
      });
    }
  };

  if (typeof window !== "undefined" && isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", async () => {
      setConnectedAddress(await getConnectedAccount());
    });
  }

  useEffect(() => {
    const updateAccount = async () => {
      setConnectedAddress(await getConnectedAccount());
    };
    updateAccount();
  }, []);

  return (
    <Flex minWidth="max-content" alignItems="center" justify="center" gap="2">
      <Box p="2" alignItems="center">
        <Heading size="md">
          <Link href={"/"}>SDX Digital Securities Vault</Link>
        </Heading>
      </Box>
      <Spacer />
      <Box alignItems="center">
        <ButtonGroup gap="1" alignItems="center" height="50px">
          <Button
            isDisabled={connectedAddress === ""}
            onClick={() => router.push("/balances")}
          >
            My Balances
          </Button>
          <Button
            isDisabled={connectedAddress === ""}
            onClick={() => router.push("/operations")}
          >
            My Operations
          </Button>
          <Button
            isDisabled={connectedAddress === ""}
            onClick={() => router.push("/admin")}
          >
            Admin
          </Button>
          {connectedAddress === "" ? (
            <Button onClick={connectAccount}>Connect</Button>
          ) : (
            <Button>{sliceAddress(connectedAddress)}</Button>
          )}
        </ButtonGroup>
      </Box>
    </Flex>
  );
};
