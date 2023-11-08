import { Deposit, Withdrawal } from "@prisma/client";

export const getOperationStatus = (operation: Deposit | Withdrawal) => {
  if (operation.confirmTx) {
    return "COMPLETED";
  } else if (operation.cancelTx) {
    return "CANCELLED";
  } else if (operation.submitTx) {
    return "SUBMITTED";
  } else return "UNKNOWN";
};
