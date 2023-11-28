// pages/events/[eventId].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DeployedEvent, PrismaClient } from "@prisma/client";
import { Contract, JsonRpcProvider } from "ethers";
import { GetServerSideProps } from "next";
import deployedContractsData from "~~/contracts/deployedContracts";

const prisma = new PrismaClient();

// o/r eventDate, deadline
interface EventPageProps {
  event:
    | {
        id: number;
        eventId: string;
        displayName: string;
        eventDate: Date | string;
        deadline: Date | string;
        address: string;
        salt: string;
      }
    | DeployedEvent
    | null;
}

interface Competitor {
  homeAway: string;
  team: {
    name: string;
  };
}

interface EventData {
  name: string;
  shortName: string;
  fullName: string;
  venue: {
    fullName: string | undefined;
    city: string | undefined;
  };
  homeTeamName: string | undefined;
  awayTeamName: string | undefined;
  status: {
    name: string | undefined;
    completed: boolean | undefined;
    period: number | undefined;
  };
}
// const EventPage = ({ event }: { event: DeployedEvent }) => {
const EventPage = ({ event }: EventPageProps) => {
  const router = useRouter();
  const { eventId } = router.query;
  const [contractEventId, setContractEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);

  useEffect(() => {
    if (!event) {
      return;
    }
    const fetchDataFromApi = async () => {
      if (eventId) {
        try {
          // TODO support other sports and leagues than NFL (hardcoded)
          const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard/${eventId}`;
          const response = await fetch(apiUrl);

          if (response.ok) {
            const json = await response.json();
            const homeCompetitor = (json.competitions?.[0]?.competitors ?? []).find(
              (competitor: Competitor) => competitor.homeAway === "home",
            );
            const awayCompetitor = (json.competitions?.[0]?.competitors ?? []).find(
              (competitor: Competitor) => competitor.homeAway === "away",
            );

            setEventData({
              name: json.name,
              shortName: json.shortName,
              fullName: json.name,
              venue: {
                fullName: json.competitions?.[0]?.venue?.fullName,
                city: json.competitions?.[0]?.venue?.address?.city,
              },
              homeTeamName: homeCompetitor?.team?.name,
              awayTeamName: awayCompetitor?.team?.name,
              status: {
                name: json.status?.type?.name,
                completed: json.status?.type?.completed,
                period: json.status?.period,
              },
            });
          } else {
            console.error("Failed to fetch data from the API");
          }
        } catch (error) {
          console.error("Error fetching data from the API:", error);
        }
      }
    };
    const fetchContractEventId = async () => {
      try {
        // TODO
        const provider = new JsonRpcProvider("http://127.0.0.1:8545");
        const TopsportsEventCore = new Contract(
          event.address,
          deployedContractsData[31337].TopsportsEventCore.abi,
          provider,
        );

        const contractEventId = await TopsportsEventCore.eventId();
        setContractEventId(contractEventId);
      } catch (error) {
        console.error("Error reading the TopsportsEventCore at the address to verify eventId:", error);
      }
    };
    fetchDataFromApi();
    fetchContractEventId();
  }, [eventId, event]);

  console.log("event", event);
  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div>
      <h1>Event Details</h1>
      <p>Event ID from URL: {eventId}</p>
      <p>Event ID from Contract: {contractEventId}</p>
      {eventData && (
        <>
          <p>Name: {eventData.name}</p>
          <p>Short Name: {eventData.shortName}</p>
          <p>Full Name: {eventData.fullName}</p>
          <p>
            Venue: {eventData.venue.fullName}, {eventData.venue.city}
          </p>
          <p>Home Team: {eventData.homeTeamName}</p>
          <p>Away Team: {eventData.awayTeamName}</p>
          <p>Status Name: {eventData.status.name}</p>
          <p>Status Completed: {eventData.status.completed ? "Yes" : "No"}</p>
          <p>Status Period: {eventData.status.period}</p>
        </>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<EventPageProps> = async ({ params }) => {
  const eventId = params?.eventId;
  if (!eventId || typeof eventId !== "string") {
    return {
      props: { event: null },
    };
  }
  try {
    // XXX findUnique
    const event = await prisma.deployedEvent.findFirst({
      where: { eventId },
    });
    console.log("event", event);

    // Pass the massaged event data to the page component as props
    return {
      props: {
        event: {
          id: event?.id || 0,
          eventId: event?.eventId || "0",
          displayName: event?.displayName || "",
          eventDate: event?.eventDate.toJSON() || "0",
          deadline: event?.deadline.toJSON() || "0",
          address: event?.address || "0x",
          salt: event?.salt || "",
        },
      },
    };
  } catch (error) {
    console.error("Error fetching event from the database:", error);
    return {
      props: { event: null },
    };
  }
};

export default EventPage;

// Close the Prisma client connection when the application shuts down
export const onServerStart = async () => {
  await prisma.$connect();
};

export const onServerClose = async () => {
  await prisma.$disconnect();
};
