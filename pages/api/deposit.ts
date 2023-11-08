import type { NextApiRequest, NextApiResponse } from "next";
import { Deposit, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/deposit
// create or update deposit
// input a Deposit object
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const deposit: Deposit = req.body;

  const result = await prisma.deposit.upsert({
    where: {
      id: deposit.id,
    },
    create: deposit,
    update: deposit,
  });
  console.log(result);
  return res.status(201).json(result);
}
