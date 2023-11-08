import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { formatAddress } from "../../helpers/accounts";

const prisma = new PrismaClient();

// GET /api/withdrawals
// returns all withdrawals (intents) that involve the connected address
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectedAddress = req.query.connectedAddress as string;
  if (connectedAddress === "") return res.status(200).json([]);

  const member = await prisma.member.findFirst({
    where: {
      onchainAddress: formatAddress(connectedAddress),
    },
  });

  var result;
  if (member?.isOperator) {
    result = await prisma.withdrawal.findMany({});
  } else {
    result = await prisma.withdrawal.findMany({
      where: {
        initiatorAddress: formatAddress(connectedAddress),
      },
    });
  }
  console.log("Withdrawals:", result);
  return res.status(200).json(result);
}
