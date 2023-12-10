// pages/events/[eventId].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MakerSignature, PrismaClient } from "@prisma/client";
import { Button, KIND as ButtonKind } from "baseui/button";
import { Card, StyledBody } from "baseui/card";
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from "baseui/modal";
import {
  // StyledHeadCell,
  StyledBodyCell,
  StyledTable,
} from "baseui/table-grid";
import { ethers } from "ethers";
import { GetServerSideProps } from "next";
import { usePublicClient } from "wagmi";
import { erc20ABI } from "wagmi";
import { useContractWrite } from "wagmi";
import { MyBetsTabs } from "~~/components/MyBetsTabs";
import OpenMarketCard from "~~/components/OpenMarketCard";
import { Address } from "~~/components/scaffold-eth/Address";
import deployedContractsData from "~~/contracts/deployedContracts";
import {
  Competitor,
  EventDisplayDetails,
  EventPageProps,
  EventWinner,
  MakerSignatureNormalized,
  TakeSigProps,
  Team,
  Venue,
} from "~~/interfaces/interfaces";

// import { useStyletron } from 'baseui';

const prisma = new PrismaClient();

const HackWin = (props: any) => {
  const TopsportsEventCore = deployedContractsData[31337].TopsportsEventCore;
  // await TopsportsEventCore.resolutionCallback(
  //   "0x0000000000000000000000000000000000000000000000000000000000000000",
  //   hre.ethers.utils.solidityPack(["int256"], [AWAY_TEAM]),
  //   "0x",
  // );
  const { write } = useContractWrite({
    address: props.event.address,
    abi: TopsportsEventCore.abi,
    functionName: "resolutionCallback",
    args: [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      ethers.solidityPacked(["int256"], [EventWinner.HOME_TEAM]) as `0x${string}`,
      "0x",
    ],
  });
  return <Button onClick={() => write()}>Hack Winner</Button>;
};

const TakeSig = ({ event, tokenAddress, makerSignature }: TakeSigProps) => {
  const TopsportsEventCore = deployedContractsData[31337].TopsportsEventCore;
  const {
    data,
    isLoading,
    isSuccess,
    write: approveWrite,
  } = useContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
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
        {isLoading && <div>Loading...</div>}
        {isSuccess && <div>Success!</div>}
        {data && <div>Data: {JSON.stringify(data)}</div>}
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
  const publicClient = usePublicClient();
  const { eventId } = router.query;
  const [contractEventId, setContractEventId] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | null>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [makerSignatureId, setMakerSignatureId] = useState<number | null>(null);
  const [winner, setWinner] = useState(EventWinner.UNDEFINED);
  const [eventDisplayDetails, setEventDisplayDetails] = useState<EventDisplayDetails | null>(null);
  const useMarkets = false;

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
        const readEventContract = async (
          functionName: "eventId" | "winner" | "token" | "consumer" | "getAllMarkets" | "markets" | "startdate",
        ) => {
          const result = await publicClient.readContract({
            address: event.address,
            abi: deployedContractsData[31337].TopsportsEventCore.abi,
            functionName: functionName,
          });
          console.log(`Result for function ${functionName}:`, result);
          return result;
        };

        if (useMarkets) {
          setMarkets((await readEventContract("getAllMarkets")) as any[]); // TODO match sigs
        }

        setTokenAddress((await readEventContract("token")) as `0x${string}`);
        setWinner((await readEventContract("winner")) as EventWinner);
        setContractEventId((await readEventContract("eventId")).toString());
      } catch (error) {
        console.error("Error reading the TopsportsEventCore at the address to verify eventId:", error);
      }
    };
    fetchDataFromApi();
    fetchContractEvent();
  }, [eventId, event, publicClient]);

  if (!event || !eventDisplayDetails || !contractEventId) {
    return <div>Event loading...</div>;
  }

  // const DATA = [
  //   ["Name", eventDisplayDetails.name],
  //   ["Token", tokenAddress],
  //   ["Name", event.displayName],
  //   ["Short Name", eventDisplayDetails.shortName],
  //   ["Full Name", eventDisplayDetails.fullName],
  //   // ["Venue", `${eventDisplayDetails.venue.fullName}, ${eventDisplayDetails.venue.city}`],
  //   ["Venue", (event.venue as unknown as Venue).name],
  //   ["Home Team", (event.homeTeam as unknown as Team).name],
  //   ["Away Team", (event.awayTeam as unknown as Team).name],
  //   ["Home Team", eventDisplayDetails.homeTeamName],
  //   ["Away Team", eventDisplayDetails.awayTeamName],
  //   ["Status Name", eventDisplayDetails.status.name],
  //   ["Status Completed", eventDisplayDetails.status.completed ? "Yes" : "No"],
  //   ["Status Period", eventDisplayDetails.status?.period?.toString()],
  //   ["Winner", winner === EventWinner.HOME_TEAM ? eventDisplayDetails.homeTeamName : eventDisplayDetails.awayTeamName],
  // ];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <Card>
          <div className="join">
            <Card>
              <div className="join">
                <div>
                  <img src={(event.homeTeam as unknown as Team).logo} alt="" style={{ width: "150px" }} />
                  {(event.homeTeam as unknown as Team).name}
                </div>
                <div className="pt-16 text-6xl font-bold">X</div>
                <div>
                  <img src={(event.awayTeam as unknown as Team).logo} alt="" style={{ width: "150px" }} />
                  {(event.awayTeam as unknown as Team).name}
                </div>
              </div>
            </Card>

            <Card>
              <div className="join">
                <div className="text-lg">
                  <p>Kick off</p>
                  <p>Venue</p>
                  <p>Competition</p>
                  <p>Smart Contract</p>
                </div>
                <div className="text-lg font-bold">
                  <p>{event.eventDate.toString()}</p>
                  <p>{(event.venue as unknown as Venue).name}</p>
                  <p>NFL, Week X</p>
                  <div>
                    <Address address={event.address} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* <Card
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
            <HackWin event={event} />
          </StyledBody>
        </Card> */}

        {winner === EventWinner.UNDEFINED ? <HackWin event={event} /> : "Winner already set"}

        {makerSignatures
          ?.filter(m => new Date(parseInt(m.deadline) * 1000) > new Date())
          ?.map(m => {
            // return [m.id, m.maker, m.spender, m.nonce, m.homeTeamOdds, m.awayTeamOdds, m.limit, m.deadline, m.signature];
            return [
              "Use",
              eventDisplayDetails.homeTeamName,
              eventDisplayDetails.awayTeamName,
              "Limit",
              "Deadline",
              <Button key={m.id} onClick={() => setMakerSignatureId(m.id)}>
                Get in &gt;&gt;
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
              <OpenMarketCard
                team1={event.homeTeam}
                team2={event.awayTeam}
                activeAmount={null}
                totalAmount={event.limit}
                setSelectedMatch={() => setMakerSignatureId(event.id)}
              />
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

        {useMarkets &&
          markets
            ?.filter(m => new Date(parseInt(m.deadline) * 1000) > new Date())
            ?.map(m => {
              // const [maker, homeTeamOdds, awayTeamOdds, limit, deadline, bets] = m;
              return [
                "Maker",
                eventDisplayDetails.homeTeamName,
                eventDisplayDetails.awayTeamName,
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
      <div className="col-span-1">
        <MyBetsTabs />
      </div>
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
    const mockEvent = 0;
    const mockSigs = 0;
    if (!mockEvent) {
      event = await prisma.deployedEvent.findUnique({
        where: { eventId },
      });
    } else {
      event = {
        id: 5,
        eventId: "401547578",
        displayName: "Tennessee Titans at Chicago Bears",
        eventDate: new Date(1701998100),
        startdate: new Date(1701998100),
        address: "0x55406DBa126cc1520b4C90b0B060EBE776d504A7",
        salt: "0x73e416ffdd363cd831fe2466b39d14c9ef9aa131f773290b879da674895cee0c",
      };
    }
    // console.log("event:", event);

    let makerSignatures: MakerSignature[];
    if (!mockSigs) {
      makerSignatures = await prisma.makerSignature.findMany({
        where: { spender: event?.address },
      });
    } else {
      makerSignatures = [
        {
          id: 15,
          maker: "0x53EA15882246211fd4CCbe1C52A487437575A9f9",
          spender: "0xE7Ab431d056AFFd38Cd550bcef0A2cd2e321CDab",
          homeTeamOdds: "100",
          awayTeamOdds: "-200",
          limit: "789",
          nonce: "0",
          deadline: "1702478296",
          signature:
            "0x8d4e3d8459ea2c432e6c21099809bc641a68d84df255fec50f329727070d53d434d75ddd4c6acc7658b51ac10675168ab6c06b8a1b669f302a39e60b419cfa511c",
          homeTeamOddsNormalized: 100,
          awayTeamOddsNormalized: -200,
          limitNormalized: 789,
          deadlineNormalized: new Date("2023-12-13T14:38:16.000Z"),
          eventDate: new Date("2023-08-12T00:00:00.000Z"),
        },
      ];
    }
    // console.log("makerSignatures:", makerSignatures);

    // Pass the massaged event data to the page component as props
    return {
      props: {
        event: {
          id: event?.id || 0,
          eventId: event?.eventId || "0",
          displayName: event?.displayName || "",
          eventDate: event?.eventDate.toJSON() || "0",
          startdate: event?.startdate.toJSON() || "0",
          address: event?.address || "0x",
          salt: event?.salt || "",
          venue: event?.venue || "",
          homeTeam: event?.homeTeam || "",
          awayTeam: event?.awayTeam || "",
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
