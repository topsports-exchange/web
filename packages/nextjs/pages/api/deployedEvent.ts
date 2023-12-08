// pages/api/deployedEvent.ts
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// http://localhost:3000/api/deployedEvent?eventId=401547578
// {"id":139,"eventId":"401547578","displayName":"New England Patriots at Pittsburgh Steelers","eventDate":"2023-12-08T01:15:00.000Z","startdate":"2023-12-08T01:15:00.000Z","address":"0x0Bcc5aB0Ecd2DF1e6Cba63E09928Fc3E0f8231BC","salt":"0xa3ea502f299b51cec36da1958620fde30e1783f3475209e6e3283efc4c457a01","venue":{"city":"Pittsburgh","name":"Acrisure Stadium"},"homeTeam":{"id":"23","logo":"https://a.espncdn.com/i/teamlogos/nfl/500/pit.png","name":"Pittsburgh Steelers","homeAway":"home","moneylines":[-290,-267,-267,-230,-304,-275,-238,-270,-263,-275]},"awayTeam":{"id":"17","logo":"https://a.espncdn.com/i/teamlogos/nfl/500/ne.png","name":"New England Patriots","homeAway":"away","moneylines":[240,215,215,180,208,225,190,215,220,210]}}
// http://localhost:3000/api/deployedEvent?eventId=401548411
// {"id":3,"eventId":"401548411","displayName":"Tennessee Titans at Chicago Bears","eventDate":"2023-08-12T00:00:00.000Z","deadline":"1970-01-01T00:00:00.000Z","address":"0xE7Ab431d056AFFd38Cd550bcef0A2cd2e321CDab","salt":"0x60a3e3b95c2c75ebb620be1cdc097834bf6e77468047c9888bfb8e2b311e2d86"}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { eventId, address } = req.query;

      if (!eventId && !address) {
        return res.status(400).json({ error: "eventId or address is required" });
      }
      // if (!eventId) {
      //   return res.status(400).json({ error: 'eventId is required' });
      // }

      const where = eventId ? { eventId: eventId.toString() } : address ? { address: address.toString() } : undefined;
      if (!where) {
        return res.status(400).json({ error: "eventId or address is required" });
      }
      const deployedEvent = await prisma.deployedEvent.findUnique({
        where,
      });

      if (!deployedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      return res.status(200).json(deployedEvent);
    } catch (error) {
      console.error("Error fetching deployedEvent:", error);
      return res.status(500).json({ error: "Internal server error" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
