// pages/events/[eventId].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DeployedEvent, MakerSignature, PrismaClient } from "@prisma/client";
import { Button, KIND as ButtonKind } from "baseui/button";
import { Card, StyledBody } from "baseui/card";
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from "baseui/modal";
import {
  // StyledHeadCell,
  StyledBodyCell,
  StyledTable,
} from "baseui/table-grid";
import { Contract, JsonRpcProvider } from "ethers";
import { GetServerSideProps } from "next";
import { useContractWrite } from "wagmi";
import deployedContractsData from "~~/contracts/deployedContracts";

// import { useStyletron } from 'baseui';

const prisma = new PrismaClient();

interface MakerSignatureNormalized extends Omit<MakerSignature, "eventDate" | "deadlineNormalized"> {
  deadlineNormalized: string;
  eventDate: string;
}
interface DeployedEventNormalized extends Omit<DeployedEvent, "eventDate" | "deadline"> {
  eventDate: Date | string;
  deadline: Date | string;
}

// o/r eventDate, deadline
interface EventPageProps {
  event: DeployedEventNormalized | null;
  makerSignatures: MakerSignatureNormalized[] | null;
}

interface TakeSigProps {
  event: DeployedEventNormalized;
  tokenAddress: `0x${string}`;
  makerSignature: MakerSignatureNormalized;
}

interface Competitor {
  homeAway: string;
  team: {
    name: string;
  };
}

interface EventDisplayDetails {
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

enum EventWinner {
  UNDEFINED,
  HOME_TEAM,
  AWAY_TEAM,
}

const TakeSig = ({ event, tokenAddress, makerSignature }: TakeSigProps) => {
  // TODO generic erc20 abi
  const MockEuroe = deployedContractsData[31337].MockEuroe;
  const TopsportsEventCore = deployedContractsData[31337].TopsportsEventCore;

  const { write: approveWrite } = useContractWrite({
    address: tokenAddress,
    abi: MockEuroe.abi,
    functionName: "approve",
    args: [event.address, BigInt(100)],
  });
  const { write: placeBetWrite } = useContractWrite({
    address: event.address,
    abi: TopsportsEventCore.abi,
    functionName: "placeBet",
    // TopsportsEventCore.placeBet(100, EventWinner.HOME_TEAM, 100, -200, sigData.limit, sigData.deadline, contractAddr, signature);
    args: [
      BigInt(100), // amount bet
      EventWinner.HOME_TEAM,
      BigInt(makerSignature.homeTeamOdds),
      BigInt(makerSignature.awayTeamOdds),
      BigInt(makerSignature.limit),
      BigInt(makerSignature.deadline),
      makerSignature.maker,
      makerSignature.signature as `0x${string}`,
    ],
  });
  const [isOpen, setIsOpen] = React.useState(true);
  return (
    <Modal
      onClose={() => setIsOpen(false)}
      closeable
      isOpen={isOpen}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
    >
      <ModalHeader>Bet 100 on Home</ModalHeader>
      <ModalBody>
        Proin ut dui sed metus pharetra hend rerit vel non mi. Nulla ornare faucibus ex, non facilisis nisl. Maecenas
        aliquet mauris ut tempus.
        <Button onClick={() => approveWrite()}>Approve</Button>
        <Button onClick={() => placeBetWrite()}>Place Bet</Button>
      </ModalBody>
      <ModalFooter>
        <ModalButton kind={ButtonKind.tertiary} onClick={() => setIsOpen(false)}>
          Cancel
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

const EventPage = ({ event, makerSignatures }: EventPageProps) => {
  const router = useRouter();
  const { eventId } = router.query;
  const [contractEventId, setContractEventId] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | null>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [makerSignatureId, setMakerSignatureId] = useState<number | null>(null);
  const [winner, setWinner] = useState(EventWinner.UNDEFINED);
  const [eventDisplayDetails, setEventDisplayDetails] = useState<EventDisplayDetails | null>(null);

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

            setEventDisplayDetails({
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
    const fetchContractEvent = async () => {
      try {
        // TODO
        const provider = new JsonRpcProvider("http://127.0.0.1:8545");
        const TopsportsEventCore = new Contract(
          event.address,
          deployedContractsData[31337].TopsportsEventCore.abi,
          provider,
        );
        const markets = await TopsportsEventCore.getAllMarkets();
        console.log("markets", markets);
        setMarkets(markets);
        setTokenAddress(await TopsportsEventCore.token());
        setWinner(await TopsportsEventCore.winner());
        setContractEventId((await TopsportsEventCore.eventId()).toString());
      } catch (error) {
        console.error("Error reading the TopsportsEventCore at the address to verify eventId:", error);
      }
    };
    fetchDataFromApi();
    fetchContractEvent();
  }, [eventId, event]);

  if (!event || !eventDisplayDetails || !contractEventId) {
    return <div>Event not found</div>;
  }

  const DATA = [
    ["Name", eventDisplayDetails.name],
    ["Short Name", eventDisplayDetails.shortName],
    ["Full Name", eventDisplayDetails.fullName],
    ["Venue", `${eventDisplayDetails.venue.fullName}, ${eventDisplayDetails.venue.city}`],
    ["Home Team", eventDisplayDetails.homeTeamName],
    ["Away Team", eventDisplayDetails.awayTeamName],
    ["Status Name", eventDisplayDetails.status.name],
    ["Status Completed", eventDisplayDetails.status.completed ? "Yes" : "No"],
    ["Status Period", eventDisplayDetails.status?.period?.toString()],
    ["Winner", winner === EventWinner.HOME_TEAM ? eventDisplayDetails.homeTeamName : eventDisplayDetails.awayTeamName],
  ];

  return (
    <div>
      <Card
        title="Event Details"
        overrides={{ Root: { style: { width: "328px", float: "left", margin: "20px" } } }}
        // headerImage={
        //   'https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/chi.png'
        // }
      >
        <StyledBody>
          <p>
            Event ID from URL / Contract: {eventId} / {contractEventId}
          </p>
          <StyledTable role="grid" $gridTemplateColumns="repeat(2,1fr)">
            {DATA.map((row, rowIndex) => (
              <div key={rowIndex} role="row" style={{ display: "contents" }}>
                {row.map((cell, cellIndex) => (
                  <StyledBodyCell key={cellIndex}>{cell}</StyledBodyCell>
                ))}
              </div>
            ))}
          </StyledTable>
        </StyledBody>
      </Card>

      {makerSignatures
        ?.map(m => {
          // return [m.id, m.maker, m.spender, m.nonce, m.homeTeamOdds, m.awayTeamOdds, m.limit, m.deadline, m.signature];
          return [
            "Use",
            "Home odds",
            "Away odds",
            "Limit",
            "Deadline",
            <Button key={m.id} onClick={() => setMakerSignatureId(m.id)}>
              Use this makerSignature
            </Button>,
            m.homeTeamOdds,
            m.awayTeamOdds,
            m.limit,
            new Date(1000 * parseInt(m.deadline)).toLocaleString(),
          ];
        })
        .map((row, rowIndex) => (
          <Card
            key={rowIndex}
            title={"Market #" + makerSignatures[rowIndex].id}
            overrides={{ Root: { style: { display: "contents" } } }}
          >
            <StyledBody>
              <StyledTable role="grid" $gridTemplateColumns="repeat(5,1fr)">
                {row.map((cell, cellIndex) => (
                  <StyledBodyCell key={cellIndex}>{cell}</StyledBodyCell>
                ))}
              </StyledTable>
            </StyledBody>
          </Card>
        ))}

      {makerSignatureId && tokenAddress && (
        <TakeSig
          event={event}
          tokenAddress={tokenAddress}
          makerSignature={makerSignatures?.find(m => m.id === makerSignatureId) as MakerSignatureNormalized}
        />
      )}

      {markets
        ?.map(m => {
          // const [maker, homeTeamOdds, awayTeamOdds, limit, deadline, bets] = m;
          return [
            "Maker",
            "Home odds",
            "Away odds",
            "Limit",
            "Deadline",
            "Bets",
            m.maker,
            m.homeTeamOdds.toString(),
            m.awayTeamOdds.toString(),
            m.limit.toString(),
            new Date(1000 * parseInt(m.deadline)).toLocaleString(),
            <Button key={m.id} onClick={() => console.log("this bets:", m.bets)}>
              Log {m.bets.length}
            </Button>,
          ];
        })
        .map((row, rowIndex) => (
          <Card key={rowIndex} title={"Open Market"} overrides={{ Root: { style: { display: "contents" } } }}>
            <StyledBody>
              <StyledTable role="grid" $gridTemplateColumns="repeat(6,1fr)">
                {row.map((cell, cellIndex) => (
                  <StyledBodyCell key={cellIndex}>{cell}</StyledBodyCell>
                ))}
              </StyledTable>
            </StyledBody>
          </Card>
        ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<EventPageProps> = async ({ params }) => {
  const eventId = params?.eventId;
  if (!eventId || typeof eventId !== "string") {
    return {
      props: { event: null, makerSignatures: null },
    };
  }
  try {
    let event;
    const mockEvent = 1;
    const mockSigs = 1;
    if (!mockEvent) {
      // XXX findUnique
      event = await prisma.deployedEvent.findFirst({
        where: { eventId },
      });
    } else {
      const eventJSON = {
        id: 1,
        eventId: "401548411",
        displayName: "Tennessee Titans at Chicago Bears",
        eventDate: "2023-08-12T00:00:00.000Z",
        deadline: "1970-01-01T00:00:00.000Z",
        address: "0x9a359cdf40C4bcc94FbBf893b23DDD56e10E032c",
        salt: "0x60a3e3b95c2c75ebb620be1cdc097834bf6e77468047c9888bfb8e2b311e2d86",
      };
      event = { ...eventJSON, eventDate: new Date(eventJSON.eventDate), deadline: new Date(eventJSON.deadline) };
    }

    let makerSignatures: MakerSignature[];
    if (!mockSigs) {
      makerSignatures = await prisma.makerSignature.findMany({
        where: { spender: event?.address },
      });
      // console.log("makerSignature.findMany:", makerSignatures);
    } else {
      makerSignatures = [
        {
          id: 7,
          maker: "0xFf4c45EcD0C66664fd72F1d7772bb93AFB47eBb0",
          spender: "0x9a359cdf40C4bcc94FbBf893b23DDD56e10E032c",
          homeTeamOdds: "100",
          awayTeamOdds: "-200",
          limit: "789",
          nonce: "0",
          deadline: "1702064536",
          signature:
            "0x50cf045ab5c0d0c236145a80cf58c7697582fc0873817622704f91e1ed12df9940f51ce0eee1258c1d38150735302e42f354cbf76c404c38f0a00fb76842733e1c",
          homeTeamOddsNormalized: 100,
          awayTeamOddsNormalized: -200,
          limitNormalized: 789,
          deadlineNormalized: new Date("2023-12-08T19:42:16.000Z"),
          eventDate: new Date("2023-08-12T00:00:00.000Z"),
        },
      ];
    }

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
        makerSignatures: makerSignatures.map(makerSignature => ({
          ...makerSignature,
          deadlineNormalized: makerSignature.deadlineNormalized.toJSON(),
          eventDate: makerSignature.eventDate.toJSON(),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching event from the database:", error);
  }
  return {
    props: { event: null, makerSignatures: null },
  };
};

export default EventPage;

// Close the Prisma client connection when the application shuts down
export const onServerStart = async () => {
  await prisma.$connect();
};

export const onServerClose = async () => {
  await prisma.$disconnect();
};
