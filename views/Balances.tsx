import {
  Button,
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
  StackDivider,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Balance, Member } from "@prisma/client";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BalanceTable } from "../components";
import {
  formatAddress,
  getConnectedAccount,
  isMetaMaskInstalled,
} from "../helpers/accounts";
import { updateBalance } from "../helpers/api";
import { isAmountValid } from "../helpers/validity";

export const Balances = () => {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [member, setMember] = useState<Member>(); // connected member
  //const [memberId, setMemberId] = useState("");
  //const [memberName, setMemberName] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [sendForm, setSendForm] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendTokenAddress, setSendTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [isLoading, setLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const updateAccount = async () => {
    setConnectedAddress(await getConnectedAccount());
  };

  if (typeof window !== "undefined" && isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", async () => {
      updateAccount();
    });
  }

  useEffect(() => {
    const updateMembers = async () => {
      const res = await fetch(`/api/members`);
      const data: Member[] = await res.json();
      setMembers(data ?? []);
      const address = await getConnectedAccount();
      if (address !== "") {
        const member = data.find(
          (m) => m.onchainAddress === formatAddress(address)
        );
        setMember(member);
      } else {
        setMember(undefined);
      }
    };
    updateAccount();
    updateMembers();
  }, [connectedAddress]);

  useEffect(() => {
    const updateBalances = async () => {
      if (member) {
        const res = await fetch(`/api/balances?memberId=${member.id}`);
        const data = await res.json();
        setBalances(data);
      } else {
        setBalances([]);
      }
    };
    updateBalances();
  }, [member]);

  useEffect(() => {
    const balance = balances.find(
      (balance) => balance.tokenAddress === sendTokenAddress
    );

    setCurrentBalance(
      balance
        ? ethers.utils
            .parseEther(balance.total)
            .sub(ethers.utils.parseEther(balance.locked))
        : BigNumber.from(0)
    );
  }, [sendTokenAddress]);

  const transfer = async () => {
    setLoading(true);

    try {
      // update my balance - decrease by amount
      await updateBalance(member!.id, sendTokenAddress, "0", "-" + amount);
      //update other balance - increase by amount
      await updateBalance(sendTo, sendTokenAddress, "0", amount);

      toast({
        title: "Transfer successful.",
        description: `Tokens sent to Member with id ${member!.id}`,
        status: "success",
        duration: 5000,
        position: "top-right",
        isClosable: true,
        onCloseComplete: () => router.reload(),
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
    <Stack align="center" justify="center">
      {!member ? (
        <Text>Please connect with a member account to see balances.</Text>
      ) : member.isOperator ? (
        <Text>Operators cannot have balance.</Text>
      ) : (
        <Stack
          divider={<StackDivider borderColor="gray.200" />}
          spacing={4}
          direction="column"
          justify="center"
          align="stretch"
          width={"sm"}
        >
          <Center>Balances for {member!.name}</Center>
          <BalanceTable balances={balances} />
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="email-alerts" mb="0">
              Transfer Form
            </FormLabel>
            <Switch
              id="sendForm"
              isChecked={sendForm}
              onChange={(e) => setSendForm(e.target.checked)}
            />
          </FormControl>
          {sendForm && (
            <>
              <FormControl isRequired>
                <FormLabel>To</FormLabel>
                <Select
                  placeholder="Select member"
                  value={sendTo}
                  onChange={(event) => setSendTo(event.target.value)}
                >
                  {members
                    .filter((m) => !m.isOperator && m.id !== member!.id)
                    .map((member, index) => (
                      <option key={index} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </Select>
                <FormLabel>Token address</FormLabel>
                <Select
                  placeholder="Select token"
                  value={sendTokenAddress}
                  onChange={(event) => setSendTokenAddress(event.target.value)}
                >
                  {balances.map((balance, index) => (
                    <option key={index} value={balance.tokenAddress}>
                      {balance.tokenTicker}
                    </option>
                  ))}
                </Select>
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
                <Button
                  isLoading={isLoading}
                  isDisabled={!isAmountValid(amount, currentBalance)}
                  onClick={transfer}
                >
                  Submit Transfer
                </Button>
              </FormControl>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
};
