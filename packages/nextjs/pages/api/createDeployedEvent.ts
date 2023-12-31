import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { JsonRpcProvider, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import deployedContractsData from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const prisma = new PrismaClient();
const prisma__deployedEvent =
  process.env.DATABASE_DEV_POSTFIX === "_tomo"
    ? (prisma.deployedEvent_tomo as unknown as Prisma.DeployedEventDelegate<DefaultArgs>)
    : prisma.deployedEvent;

const startdateCheck = false; // TODO enable

function saltEvent(eventId: number, displayName: string): string {
  // const hash = ethers.utils.solidityKeccak256(['uint256', 'string'], [eventId, displayName]); // v5
  const hash = ethers.solidityPackedKeccak256(["uint256", "string"], [eventId, displayName]);
  return hash;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // TODO save req.initializeRequestForInlineJavaScript(_source) hash for TopsportsFunctionsConsumer.sendRequest(_source)

  /*
  curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "401548411",
    "displayName": "Tennessee Titans at Chicago Bears",
    "deadline": "0",
    "address": "0xB9494117015B64cb06A6006aAF5B471960debc73",
    "eventDate": "2023-08-12T00:00:00Z"
  }' \
  http://localhost:3000/api/createDeployedEvent
  */

  const { eventId, displayName, startdate, address, eventDate, venue, homeTeam, awayTeam } = req.body;
  const salt = saltEvent(eventId, displayName);
  // TODO confirm that this salt was used to create the contract

  const _eventDate = new Date(eventDate);

  try {
    // Check if the event ID or address already exists
    const existing = await prisma__deployedEvent.findFirst({
      where: {
        OR: [{ eventId }, { address }],
      },
    });

    if (existing) {
      if (existing.eventId === eventId) {
        return res.status(400).json({ error: "Event ID already exists" });
      } else {
        return res.status(400).json({ error: "Address already exists" });
      }
    }

    // startdateCheck: Check if the startdate is in the future
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (startdateCheck && startdate <= currentTimestamp) {
      return res.status(400).json({ error: "startdate must be in the future" });
    }

    try {
      // read the TopsportsEventCore at the address and verify eventId
      const rpc =
        (scaffoldConfig.targetNetwork.id === 31337 ? "http://127.0.0.1:8545" : process.env.RPC_ENDPOINT_URL) ??
        ("" as `http://${string}`);
      const provider = new JsonRpcProvider(rpc);
      const TopsportsEventCore = new ethers.Contract(
        address,
        deployedContractsData[31337].TopsportsEventCore.abi,
        provider,
      );

      const contractEventId = await TopsportsEventCore.eventId();
      if (contractEventId !== BigInt(eventId)) {
        console.log("contractEventId:", contractEventId);
        console.log("eventId:", eventId);
        return res.status(400).json({ error: "Event ID mismatch in the contract" });
      }
    } catch (error) {
      console.error("Error reading the TopsportsEventCore at the address " + address + " to verify eventId:", error);
      return res.status(400).json({ error: "Error reading the TopsportsEventCore at the address to verify eventId" });
    }

    // Cache the Event in the database
    const newEvent = await prisma__deployedEvent.create({
      data: {
        eventId,
        displayName,
        eventDate: _eventDate.toISOString(),
        startdate: new Date(startdate * 1000),
        address,
        salt,
        venue: JSON.parse(venue),
        homeTeam: JSON.parse(homeTeam),
        awayTeam: JSON.parse(awayTeam),
      },
    });

    return res.status(200).json(newEvent);
  } catch (error) {
    console.error("Error creating DeployedEvent:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
