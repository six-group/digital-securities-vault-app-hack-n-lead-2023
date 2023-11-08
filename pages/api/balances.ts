import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/balances
// returns all balances for a given member
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const memberId = req.query.memberId as string;
  if (memberId === "") return res.status(200).json([]);

  const result = await prisma.balance.findMany({
    where: {
      memberId: memberId,
    },
  });
  console.log(result);

  return res.status(200).json(result);
}
