import {
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Balance } from "@prisma/client";
import { sliceAddress } from "../helpers/accounts";

type Props = {
  balances: Balance[];
};

export const BalanceTable = (props: Props) => {
  const { balances } = props;
  return (
    <Stack gap={2}>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ticker</Th>
              <Th>address</Th>
              <Th>locked</Th>
              <Th>total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {balances.map((balance, index) => (
              <Tr key={index}>
                <Td>{balance.tokenTicker}</Td>
                <Td>{sliceAddress(balance.tokenAddress)}</Td>
                <Td>{balance.locked}</Td>
                <Td>{balance.total}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
