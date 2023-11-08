import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { formatAddress } from "../../helpers/accounts";

const prisma = new PrismaClient();

// GET /api/members
// returns the first member that is associated to the connected address
// Note: should be only one
// if no address is given then return all members
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectedAddress = req.query.connectedAddress as string;
  var result;

  if (!connectedAddress) {
    result = await prisma.member.findMany({});
  } else {
    result = await prisma.member.findFirst({
      where: {
        onchainAddress: formatAddress(connectedAddress),
      },
    });
  }
  console.log(result);

  return res.status(200).json(result);
}
