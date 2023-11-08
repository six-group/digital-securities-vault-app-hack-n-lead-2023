import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  StackDivider,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { formatAddress, txScannerURL } from "../helpers/accounts";
import { DSVContract } from "../helpers/contract";
import { DoNotLeave } from "./DoNotLeave";

export const NewMemberForm = () => {
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [org, setOrg] = useState<string>("");
  const [onchainAddress, setOnchainAddress] = useState<string>("");
  const [operator, setOperator] = useState(false);

  useEffect(() => {}, [name]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      var txHash;
      if (operator) {
        const dsvContract = new DSVContract();
        txHash = await dsvContract.grantOperator(onchainAddress);
      }

      // create member
      const data = await fetch(`/api/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          organisation: org,
          onchainAddress: formatAddress(onchainAddress),
          isOperator: operator,
        }),
      });
      console.log(data);
      toast({
        title: "Member Created!",
        description: txHash ? (
          <>
            Tx hash: {"\n"}
            <a href={txScannerURL(txHash)} target="_blank" rel="noreferrer">
              {txHash}
            </a>
            .
          </>
        ) : null,
        status: "success",
        duration: 5000,
        position: "top-right",
        isClosable: true,
        onCloseComplete: () => router.push("/admin"),
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
          <FormLabel>Name</FormLabel>
          <Input
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.currentTarget.value)
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Organisation</FormLabel>
          <Input
            value={org}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setOrg(event.currentTarget.value)
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Onchain Address</FormLabel>
          <Input
            value={onchainAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setOnchainAddress(event.currentTarget.value)
            }
          />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
            Operator
          </FormLabel>
          <Switch
            id="operator"
            isChecked={operator}
            onChange={(e) => setOperator(e.target.checked)}
          />
        </FormControl>
        <Button
          isLoading={isLoading}
          type="submit"
          //isDisabled={!isAmountValid(amount)}
        >
          Submit
        </Button>
        {isLoading && <DoNotLeave />}
      </Stack>
    </form>
  );
};
