import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { TokenContract } from "../../helpers/contract";

const prisma = new PrismaClient();

// POST /api/balance
// create or update balance to given member
// Required fields in body: memberId, tokenAddress, tokenTicker, lockedDelta, totalDelta
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { memberId, tokenAddress, lockedDelta, totalDelta } = req.body;
  if (memberId === "" || tokenAddress === "") return res.status(200).json([]);

  const balance = await prisma.balance.findFirst({
    where: {
      memberId: memberId,
      tokenAddress: tokenAddress,
    },
  });

  try {
    if (balance) {
      // if balance exists apply delta
      const newTotal = +balance.total + +totalDelta;
      const newLocked = +balance.locked + +lockedDelta;
      if (newLocked > newTotal) throw new Error("Locked > Total. Not allowed!");

      const updatedBalance = await prisma.balance.update({
        where: {
          id: balance.id,
        },
        data: {
          locked: newLocked.toString(),
          total: newTotal.toString(),
        },
      });
      return res.status(200).json(updatedBalance);
    } else {
      // otherwise create it
      if (totalDelta <= 0 || lockedDelta != 0) throw new Error("Not allowed!");

      // get ticker from token contract
      const tokenContract = new TokenContract(tokenAddress);
      const tokenTicker = await tokenContract.getTicker();
      ///const tokenTicker = "TKA";

      const newBalance = await prisma.balance.create({
        data: {
          memberId: memberId,
          tokenAddress: tokenAddress,
          tokenTicker: tokenTicker,
          total: totalDelta,
          locked: lockedDelta,
        },
      });
      return res.status(201).json(newBalance);
    }
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: "Failed to create/update balance." });
  }
}
