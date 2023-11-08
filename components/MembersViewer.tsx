import { Box, Button, Center, Divider, Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { MembersTable } from "./MembersTable";
import { Member } from "@prisma/client";

type Props = {
  members: Member[];
};

export const MembersViewer = (props: Props) => {
  const router = useRouter();
  const { members } = props;

  return (
    <Stack gap={2}>
      <Center>Operators</Center>
      <Divider />
      <MembersTable members={members.filter((member) => member.isOperator)} />
      <Box height="50px" />
      <Center>Members</Center>
      <Divider />
      <MembersTable members={members.filter((member) => !member.isOperator)} />
      <Button onClick={() => router.push("/newmember")}>New Member</Button>
    </Stack>
  );
};
