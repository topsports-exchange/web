// src/components/MyBets.tsx
import React, { useEffect, useState } from "react";
import { DeployedEvent } from "@prisma/client";
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

enum EventWinner {
  UNDEFINED,
  HOME_TEAM,
  AWAY_TEAM,
}
interface Bet {
  taker: string;
  stake: bigint;
  profit: bigint;
  winner: EventWinner;
}
interface Market {
  address: string;
  maker: string;
  homeTeamOdds: bigint;
  awayTeamOdds: bigint;
  limit: bigint;
  deadline: bigint;
  bets: Bet[];
}
interface Wager {
  totalWagered: bigint;
  totalHomePayout: bigint;
  totalAwayPayout: bigint;
}
type WagerArray = readonly [bigint, bigint, bigint];
interface BetInfo {
  eventId: bigint;
  eventContract: string;
  startdate: bigint;
  marketId: bigint;
  betId: bigint;
}
type BetInfoArray = readonly [bigint, string, bigint, bigint, bigint];

const eventWinnerString = (winner: EventWinner): string => {
  switch (winner) {
    case EventWinner.HOME_TEAM:
      return "HOME_TEAM";
    case EventWinner.AWAY_TEAM:
      return "AWAY_TEAM";
    case EventWinner.UNDEFINED:
    default:
      return "UNDEFINED";
  }
};

const toWager = ([totalWagered, totalHomePayout, totalAwayPayout]: WagerArray): Wager => ({
  totalWagered,
  totalHomePayout,
  totalAwayPayout,
});

const toBetInfo = ([eventId, eventContract, startdate, marketId, betId]: BetInfoArray): BetInfo => ({
  eventId,
  eventContract,
  startdate,
  marketId,
  betId,
});

// TODO bet both?
const claimable = ({ totalHomePayout, totalAwayPayout }: Wager) => {
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
  const [eventWager, setEventWager] = useState<{ [address: string]: Wager }>({});
  const [allMarkets, setAllMarkets] = useState<{ [address: string]: Market[] }>({});
  const [eventsDetails, setEventsDetails] = useState<{ [address: string]: DeployedEvent }>({});

  useEffect(() => {
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
          newBets.push(result);

          if (!eventsDetails[result.eventContract]) {
            const response = await fetch("/api/deployedEvent?address=" + result.eventContract);
            const event = await response.json();
            setEventsDetails(prev => ({ ...prev, [result.eventContract]: event }));
          }

          if (!allMarkets[result.eventContract]) {
            const markets = (await publicClient.readContract({
              // If the event contract is not in allMarkets, fetch all markets for that contract
              // const markets = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "getAllMarkets",
            })) as Market[];
            setAllMarkets(prev => ({ ...prev, [result.eventContract]: markets }));

            const winner = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "winner",
            });
            setEventWinner(prev => ({ ...prev, [result.eventContract]: winner }));

            const wager: WagerArray = await publicClient.readContract({
              address: result.eventContract,
              abi: deployedContractsData[31337].TopsportsEventCore.abi,
              functionName: "wagerByAddress",
              args: [account.address as string],
            });
            setEventWager(prev => ({ ...prev, [result.eventContract]: toWager(wager) }));
          }
        } catch (error) {
          // ContractFunctionExecutionError: The contract function "betsByAddress" reverted with the following reason:
          // Error: Transaction reverted without a reason string
          // console.error("Error", error);
          break;
        }
      }
      setBets(newBets);
    };
    fetchContractEvent();
  }, [account, allMarkets, publicClient, eventsDetails]);

  // TODO filter pending vs wins vs history
  const Bet = ({ bet }: { bet: BetInfo }) => {
    return (
      <div>
        <p>
          {bet.eventId.toString()} {eventsDetails[bet.eventContract].displayName}
        </p>
        <p>{new Date(eventsDetails[bet.eventContract].eventDate).toString()}</p>
        <p>
          Chose: {eventWinnerString(allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].winner)}
        </p>
        <p>eventWinner {eventWinnerString(eventWinner[bet.eventContract])}</p>
        <p>Home Odds {allMarkets[bet.eventContract][Number(bet.marketId)].homeTeamOdds.toString()}</p>
        <p>Away Odds {allMarkets[bet.eventContract][Number(bet.marketId)].awayTeamOdds.toString()}</p>
        <p>Staked {allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].stake.toString()}</p>
        <p>Profit? {allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].profit.toString()}</p>
        <p>
          wagerByAddress{" "}
          {JSON.stringify(eventWager[bet.eventContract], (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          )}
        </p>
        <p>claimable {claimable({ ...eventWager[bet.eventContract] }).toString()}</p>
        <Claim eventAddress={bet.eventContract} accountAddress={account.address as string} />
        DEBUG
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
