// pages/api/createMakerSignature.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { NextApiRequest, NextApiResponse } from "next";

interface CreateSignatureRequest {
  maker: string;
  eventDate: string;
  spender: string;
  homeTeamOdds: string;
  awayTeamOdds: string;
  limit: string;
  nonce: string;
  deadline: string;
  signature: string;
}

const prisma = new PrismaClient();
const prisma__makerSignature =
  process.env.DATABASE_DEV_POSTFIX === "_tomo"
    ? (prisma.makerSignature_tomo as unknown as Prisma.MakerSignatureDelegate<DefaultArgs>)
    : prisma.makerSignature;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const {
        maker,
        eventDate,
        spender,
        homeTeamOdds,
        awayTeamOdds,
        limit,
        nonce,
        deadline,
        signature,
      }: CreateSignatureRequest = req.body;

      // TODO Verify signature

      if (!isValidIntString(homeTeamOdds) || !isValidIntString(awayTeamOdds) || !isValidIntString(limit)) {
        return res.status(400).json({ success: false, error: "Invalid integer string format" });
      }

      const normalizedHomeTeamOdds = parseInt(homeTeamOdds, 10);
      const normalizedAwayTeamOdds = parseInt(awayTeamOdds, 10);
      const normalizedLimit = parseInt(limit, 10);
      const normalizedDeadline = new Date(Number(deadline) * 1000); // Convert seconds to milliseconds

      const createdSignature = await prisma__makerSignature.create({
        data: {
          maker,
          eventDate: new Date(eventDate),
          spender,
          homeTeamOdds,
          awayTeamOdds,
          limit,
          nonce,
          deadline,
          signature,
          homeTeamOddsNormalized: normalizedHomeTeamOdds,
          awayTeamOddsNormalized: normalizedAwayTeamOdds,
          limitNormalized: normalizedLimit,
          deadlineNormalized: normalizedDeadline,
        },
      });

      res.status(201).json({ success: true, signature: createdSignature });
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}

function isValidIntString(value: string): boolean {
  const regex = /^-?\d+$/; // Allow both positive and negative integers
  return regex.test(value);
}
