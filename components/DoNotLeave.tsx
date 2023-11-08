import { Alert, AlertIcon } from "@chakra-ui/react";

export const DoNotLeave = () => {
  return (
    <Alert status="warning">
      <AlertIcon />
      Please continue on Metamask; do not leave this page while it is loading.
    </Alert>
  );
};
