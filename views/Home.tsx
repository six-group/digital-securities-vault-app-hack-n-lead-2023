import {
  Center,
  Container,
  Stack,
  StackDivider,
  VStack,
} from "@chakra-ui/react";

export const Home = () => {
  return (
    <Stack align="center" justify="center" direction={"column"}>
      <VStack divider={<StackDivider borderColor="gray.200" />} spacing="20px">
        <Center>
          <Container maxW="md">SDX Digital Securities Vault PoC</Container>
        </Center>
        <Center>
          <Container maxW="md">
            Please use the header menu to navigate.
          </Container>
        </Center>
      </VStack>
    </Stack>
  );
};
