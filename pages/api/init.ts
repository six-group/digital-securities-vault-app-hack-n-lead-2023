import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { CONFIG_SERVER } from "../../config";

const prisma = new PrismaClient();

// POST /api/init
// used for seeding. creates the SDX Admin member
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if a Member record already exists
  const existingMember = await prisma.member.findFirst();

  // If not, create a new Member record
  if (!existingMember) {
    await prisma.member.create({
      data: {
        name: "Admin",
        organisation: "SDX",
        onchainAddress: CONFIG_SERVER.ADMIN_ADDRESS,
        isOperator: true,
      },
    });
  }

  res.status(200).json({ message: "Initialization complete" });
}
