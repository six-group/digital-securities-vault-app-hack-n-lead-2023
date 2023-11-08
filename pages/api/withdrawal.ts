import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Withdrawal } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/withdrawal
// create or update withdrawal
// input a Withdrawal object
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const withdrawal: Withdrawal = req.body;

  const result = await prisma.withdrawal.upsert({
    where: {
      id: withdrawal.id,
    },
    create: withdrawal,
    update: withdrawal,
  });
  console.log(result);
  return res.status(201).json(result);
}
