import {
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
import { Deposit, Member, Withdrawal } from "@prisma/client";
import { useRouter } from "next/router";
import { addressScannerURL, sliceAddress } from "../helpers/accounts";
import { getOperationStatus } from "../helpers/status";
import { DepositActions } from "./DepositActions";
import { WithdrawalActions } from "./WithdrawalActions";
import { DSVContract } from "../helpers/contract";

type Props = {
  members: Member[];
};

export const MembersTable = (props: Props) => {
  const { members } = props;

  return (
    <TableContainer>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>id</Th>
            <Th>name</Th>
            <Th>org</Th>
            <Th>onchain address</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member, index) => (
            <Tr key={index}>
              <Td>{member.id}</Td>
              <Td>{member.name}</Td>
              <Td>{member.organisation}</Td>
              <Td>
                <Link
                  href={addressScannerURL(member.onchainAddress)}
                  isExternal={true}
                >
                  {sliceAddress(member.onchainAddress)}
                </Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
