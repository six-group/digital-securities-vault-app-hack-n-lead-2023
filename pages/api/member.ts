import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// POST /api/member
// create a member
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, organisation, onchainAddress, isOperator } = req.body;
  const result = await prisma.member.create({
    data: {
      name: name,
      organisation: organisation,
      onchainAddress: onchainAddress,
      isOperator: isOperator,
    },
  });
  console.log(result);
  return res.status(201).json(result);
}
