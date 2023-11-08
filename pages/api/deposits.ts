import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { formatAddress } from "../../helpers/accounts";

const prisma = new PrismaClient();

// GET /api/deposits
// returns all deposits (intents) that involve the connected address
// operator gets all
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
    result = await prisma.deposit.findMany({});
  } else {
    result = await prisma.deposit.findMany({
      where: {
        OR: [
          {
            sender: formatAddress(connectedAddress),
          },
          { receiverId: member?.id },
        ],
      },
    });
  }

  console.log("Deposits: ", result);

  return res.status(200).json(result);
}
