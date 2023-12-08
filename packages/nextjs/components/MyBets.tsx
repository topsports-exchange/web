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

// function collect(address _to) external returns (uint256 amount) {
//   // solhint-disable-next-line not-rely-on-time
//   if ((startdate + 24 hours > block.timestamp) && (winner == EventWinner.UNDEFINED)) {
//       // Event completed without resolution of the event, release stake and
//       // profit to their respective owners
//       amount = wagerByAddress[_msgSender()].totalWagered;
//   } else {
//       // collect fees
//       if (EventWinner.HOME_TEAM == winner) {
//           amount = wagerByAddress[_msgSender()].totalHomePayout;
//       } else if (EventWinner.AWAY_TEAM == winner) {
//           amount = wagerByAddress[_msgSender()].totalAwayPayout;
//       } else {
//           revert EventNotResolved(uint256(winner));
//       }
//   }
//   token.safeTransfer(_to, amount);
//   delete (wagerByAddress[_msgSender()]);

//   // Uncomment the following line if you want to emit a Claimed event
//   // emit Claimed(payout);
// }
interface BetStatusProps {
  choice: EventWinner;
  eventDate: Date;
  winner: EventWinner;
  wager: Wager;
}
// const t24hours = 3600 * 24 * 1000;
const t24hours = 3600 * 1 * 1000;
const wontResolve = (p: BetStatusProps) => {
  return new Date().valueOf() >= p.eventDate.valueOf() + t24hours && p.winner === EventWinner.UNDEFINED;
};
const isPending = (p: BetStatusProps) => {
  return new Date().valueOf() < p.eventDate.valueOf() + t24hours && p.winner === EventWinner.UNDEFINED;
};
const didResolve = (p: BetStatusProps) => {
  return p.winner !== EventWinner.UNDEFINED;
};
const youWon = (p: BetStatusProps) => {
  return p.winner === p.choice;
};
const canClaimAmount = (p: BetStatusProps) => {
  if (wontResolve(p) && p.wager.totalWagered > 0n) {
    return p.wager.totalWagered;
  }
  if (didResolve(p) && youWon(p)) {
    if (p.choice === EventWinner.HOME_TEAM) {
      // or 0n, already claimed
      return p.choice === EventWinner.HOME_TEAM ? p.wager.totalHomePayout : p.wager.totalAwayPayout;
    }
  }
  return 0n;
};

const Claim = ({
  eventAddress,
  accountAddress,
  claimAmount,
}: {
  eventAddress: string;
  accountAddress: string;
  claimAmount: bigint;
}) => {
  const { write: claimWrite } = useContractWrite({
    address: eventAddress,
    abi: deployedContractsData[31337].TopsportsEventCore.abi,
    functionName: "collect",
    args: [accountAddress],
  });
  return <Button onClick={() => claimWrite()}>Claim {claimAmount.toString()}</Button>;
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

  const retp = (bet: BetInfo) => {
    const p: BetStatusProps = {
      choice: allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)].winner,
      eventDate: new Date(eventsDetails[bet.eventContract].eventDate),
      winner: eventWinner[bet.eventContract],
      wager: eventWager[bet.eventContract],
    };
    return p;
  };
  const betIsPending = (bet: BetInfo) => {
    return isPending(retp(bet));
  };
  const betIsWon = (bet: BetInfo) => {
    return didResolve(retp(bet)) && youWon(retp(bet));
  };
  const betIsHistory = (bet: BetInfo) => {
    return !betIsPending(bet) && !betIsWon(bet);
  };

  // TODO filter pending vs wins vs history
  const Bet = ({ bet }: { bet: BetInfo }) => {
    const p = retp(bet);
    // debugger;
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
        <p>
          Days til event:{" "}
          {(new Date(eventsDetails[bet.eventContract].eventDate).valueOf() - new Date().valueOf()) / (3600 * 24 * 1000)}
        </p>
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
        <p>canClaimAmount {canClaimAmount(p).toString()}</p>
        {canClaimAmount(p) > 0n && (
          <Claim
            eventAddress={bet.eventContract}
            accountAddress={account.address as string}
            claimAmount={canClaimAmount(p)}
          />
        )}
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
            {bets.filter(betIsPending).map((bet, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet bet={bet} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>

        <Card title="Wins">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.filter(betIsWon).map((bet, index) => (
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
            {bets.filter(betIsHistory).map((bet, index) => (
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
