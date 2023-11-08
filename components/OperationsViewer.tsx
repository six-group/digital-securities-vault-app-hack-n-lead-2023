import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Divider,
  Link,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { Deposit, Withdrawal } from "@prisma/client";
import { useRouter } from "next/router";
import { addressScannerURL, sliceAddress } from "../helpers/accounts";
import { getOperationStatus } from "../helpers/status";
import { DepositActions } from "./DepositActions";
import { WithdrawalActions } from "./WithdrawalActions";

type Props = {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  isMember: Boolean;
  isOperator: Boolean;
};

export const OperationsViewer = (props: Props) => {
  const router = useRouter();
  const { deposits, withdrawals, isMember, isOperator } = props;

  return (
    <Stack gap={2}>
      <Center>Deposits</Center>
      <Divider />
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>id</Th>
              <Th>token</Th>
              <Th>sender</Th>
              <Th>amount</Th>
              <Th>status</Th>
              <Th>actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deposits.map((deposit, index) => (
              <Tr key={index}>
                <Td>
                  <Tooltip label={deposit.id}>
                    {sliceAddress(deposit.id)}
                  </Tooltip>
                </Td>
                <Td>
                  <Link
                    href={addressScannerURL(deposit.tokenAddress)}
                    isExternal={true}
                  >
                    {sliceAddress(deposit.tokenAddress)}
                  </Link>
                </Td>
                <Td>
                  <Link
                    href={addressScannerURL(deposit.sender)}
                    isExternal={true}
                  >
                    {sliceAddress(deposit.sender)}
                  </Link>
                </Td>
                <Td>{deposit.amount}</Td>
                <Td>{getOperationStatus(deposit)}</Td>
                <Td>
                  <DepositActions isMember={isMember} deposit={deposit} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {isMember && !isOperator && (
        <Button onClick={() => router.push("/newdeposit")}>New Deposit</Button>
      )}
      {isMember && (
        <>
          <Box height="50px" />
          <Center>Withdrawals</Center>
          <Divider />
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>id</Th>
                  <Th>token</Th>
                  <Th>withdrawal address</Th>
                  <Th>amount</Th>
                  <Th>status</Th>
                  <Th>actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {withdrawals.map((withdrawal, index) => (
                  <Tr key={index}>
                    <Td>
                      <Tooltip label={withdrawal.id}>
                        {sliceAddress(withdrawal.id)}
                      </Tooltip>
                    </Td>
                    <Td>
                      <Link
                        href={addressScannerURL(withdrawal.tokenAddress)}
                        isExternal={true}
                      >
                        {sliceAddress(withdrawal.tokenAddress)}
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={addressScannerURL(withdrawal.withdrawalAddress)}
                        isExternal={true}
                      >
                        {sliceAddress(withdrawal.withdrawalAddress)}
                      </Link>
                    </Td>
                    <Td>{withdrawal.amount}</Td>
                    <Td>{getOperationStatus(withdrawal)}</Td>
                    <Td>
                      <WithdrawalActions
                        isOperator={isOperator}
                        withdrawal={withdrawal}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {!isOperator && (
            <Button onClick={() => router.push("/newwithdrawal")}>
              New Withdrawal
            </Button>
          )}
        </>
      )}
      <Box height="50px" />
      <Alert status="info">
        <AlertIcon />
        Please do not leave this page while a transaction is pending in
        Metamask.
      </Alert>
    </Stack>
  );
};
