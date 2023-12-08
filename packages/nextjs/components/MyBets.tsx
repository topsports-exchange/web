// src/components/MyBets.tsx
import React, { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { withStyle } from "baseui";
import { Button } from "baseui/button";
import { Card, StyledBody } from "baseui/card";
import {
  // StyledHeadCell,
  StyledBodyCell,
  StyledTable,
} from "baseui/table-grid";
import { useContractWrite, usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import deployedContractsData from "~~/contracts/deployedContracts";

type deployedEvent = {
  id: number;
  eventId: string;
  displayName: string;
  eventDate: Date;
  startdate: Date;
  address: string;
  salt: string;
  venue: Prisma.JsonValue;
  homeTeam: Prisma.JsonValue;
  awayTeam: Prisma.JsonValue;
};

enum EventWinner {
  UNDEFINED,
  HOME_TEAM,
  AWAY_TEAM,
}

interface BetInfo {
  eventId: bigint;
  eventContract: string;
  startdate: bigint;
  marketId: bigint;
  betId: bigint;
}

const toBetInfo = ([eventId, eventContract, startdate, marketId, betId]: readonly [
  bigint,
  string,
  bigint,
  bigint,
  bigint,
]): BetInfo => ({
  eventId,
  eventContract,
  startdate,
  marketId,
  betId,
});

// TODO bet both?
const claimable = (totalWagered: bigint, totalHomePayout: bigint, totalAwayPayout: bigint) => {
  if (totalHomePayout > 0) {
    return totalHomePayout;
  } else if (totalAwayPayout > 0) {
    return totalAwayPayout;
  } else {
    return 0n;
  }
};

const Claim = ({ eventAddress, accountAddress }: { eventAddress: string; accountAddress: string }) => {
  const { write: claimWrite } = useContractWrite({
    address: eventAddress,
    abi: deployedContractsData[31337].TopsportsEventCore.abi,
    functionName: "collect",
    args: [accountAddress],
  });
  return <Button onClick={() => claimWrite}>Claim</Button>;
};

const MyBets = () => {
  const publicClient = usePublicClient();
  const account = useAccount();
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [eventWinner, setEventWinner] = useState<{ [key: string]: number }>({});
  // struct Wager {
  //   uint256 totalWagered;
  //   uint256 totalHomePayout;
  //   uint256 totalAwayPayout;
  // }
  const [eventWager, setEventWager] = useState<{ [key: string]: readonly [bigint, bigint, bigint] }>({});
  const [allMarkets, setAllMarkets] = useState<{
    [key: string]: readonly {
      maker: string;
      homeTeamOdds: bigint;
      awayTeamOdds: bigint;
      limit: bigint;
      deadline: bigint;
      bets: readonly {
        taker: string;
        stake: bigint;
        profit: bigint;
        winner: number;
      }[];
    }[];
  }>({});
  const [eventsDetails, setEventsDetails] = useState<{ [address: string]: deployedEvent }>({});

  useEffect(() => {
    console.log("account", account);
    if (account.address === undefined) {
      return;
    }

    const fetchContractEvent = async () => {
      const newBets: BetInfo[] = [];
      let i: bigint;
      // i++ until Error: Transaction reverted without a reason string
      for (i = 0n; ; i++) {
        // while (true) {
        try {
          const result = toBetInfo(
            await publicClient.readContract({
              address: deployedContractsData[31337].TopsportsEventFactory.address,
              abi: deployedContractsData[31337].TopsportsEventFactory.abi,
              functionName: "betsByAddress",
              args: [account.address as string, i],
            }),
          );
          console.log("result for i=", i, result);
          // i++;
          newBets.push(result);

          if (!eventsDetails[result.eventContract]) {
            const response = await fetch("/api/deployedEvent?address=" + result.eventContract);
            const event = await response.json();
            setEventsDetails(prev => ({ ...prev, [result.eventContract]: event }));
          }

          if (!allMarkets[result.eventContract]) {
            const markets: readonly {
              maker: string;
              homeTeamOdds: bigint;
              awayTeamOdds: bigint;
              limit: bigint;
              deadline: bigint;
              bets: readonly {
                taker: string;
                stake: bigint;
                profit: bigint;
                winner: number;
              }[];
            }[] = await publicClient.readContract({
              // If the event contract is not in allMarkets, fetch all markets for that contract
              // const markets = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "getAllMarkets",
            });
            setAllMarkets(
              (prevAllMarkets: {
                [key: string]:
                  | any[]
                  | readonly {
                      maker: string;
                      homeTeamOdds: bigint;
                      awayTeamOdds: bigint;
                      limit: bigint;
                      deadline: bigint;
                      bets: readonly { taker: string; stake: bigint; profit: bigint; winner: number }[];
                    }[];
              }) => ({
                ...prevAllMarkets,
                [result.eventContract]: markets,
              }),
            );

            const winner = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "winner",
            });
            setEventWinner(prev => ({ ...prev, [result.eventContract]: winner }));
            const wager = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "wagerByAddress",
              args: [account.address as string],
            });
            setEventWager(prev => ({ ...prev, [result.eventContract]: wager }));
          }
        } catch (error) {
          // ContractFunctionExecutionError: The contract function "betsByAddress" reverted with the following reason:
          // Error: Transaction reverted without a reason string
          // console.error("Error", error);
          break;
        }
        console.log("i", i);
        // if (i > 1) {
        //   break;
        // }
      }
      setBets(newBets);
    };
    fetchContractEvent();
  }, [account, allMarkets, publicClient, eventsDetails]);
  console.log("allMarkets", allMarkets);

  // TODO filter pending vs wins vs history
  const Bet = ({ bet }: { bet: BetInfo }) => {
    return (
      <div>
        <p>
          {/* {bet.eventId.toString()} {eventcache[bet.eventId.toString()].displayName} */}
          {bet.eventId.toString()} {eventsDetails[bet.eventContract].displayName}
        </p>
        <p>{new Date(eventsDetails[bet.eventContract].eventDate).toString()}</p>
        <p>
          {allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].winner == EventWinner.HOME_TEAM
            ? "Home"
            : "Away"}{" "}
          wins
        </p>
        <p>Home {allMarkets[bet.eventContract][Number(bet.marketId)].homeTeamOdds.toString()}</p>
        <p>Away {allMarkets[bet.eventContract][Number(bet.marketId)].awayTeamOdds.toString()}</p>
        <p>Stake {allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].stake.toString()}</p>
        <p>Profit {allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].profit.toString()}</p>
        <p>eventWinner {eventWinner[bet.eventContract].toString()}</p>
        <p>wagerByAddress {eventWager[bet.eventContract].toString()}</p>
        <p>claimable {claimable(...eventWager[bet.eventContract]).toString()}</p>
        <Claim eventAddress={bet.eventContract} accountAddress={account.address as string} />
        {JSON.stringify(bet, (key, value) => (typeof value === "bigint" ? value.toString() : value))}
        {/* {eventcache[bet.eventId.toString()] && JSON.stringify(eventcache[bet.eventId.toString()])} */}
        {allMarkets[bet.eventContract] &&
          JSON.stringify(allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)], (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          )}
      </div>
    );
  };

  const StyledBetBodyCell = withStyle(StyledBodyCell, {
    border: "1px solid black",
    margin: "10px",
  });

  return (
    <div>
      <Card title="My Bets">
        <Card title="Pending">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.map((bet, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet bet={bet} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>
        <Card title="History">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.map((bet, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet bet={bet} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>
      </Card>
    </div>
  );
};

export default MyBets;
