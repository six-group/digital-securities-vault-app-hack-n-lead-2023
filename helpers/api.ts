import { Deposit, Withdrawal } from "@prisma/client";

export const updateBalance = async (
  memberId: string,
  tokenAddress: string,
  lockedDelta: string,
  totalDelta: string
) => {
  await fetch(`/api/balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      memberId,
      tokenAddress,
      lockedDelta,
      totalDelta,
    }),
  });
};

export const upsertDeposit = async (deposit: Deposit) => {
  await fetch(`/api/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...deposit,
    }),
  });
};

export const upsertWithdrawal = async (withdrawal: Withdrawal) => {
  await fetch(`/api/withdrawal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...withdrawal,
    }),
  });
};

