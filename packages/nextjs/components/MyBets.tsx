// src/components/MyBets.tsx
import React, { useEffect, useState } from "react";
import { DeployedEvent } from "@prisma/client";
import { withStyle } from "baseui";
import { Button } from "baseui/button";
import { Card, StyledBody } from "baseui/card";
import { StyledBodyCell, StyledTable } from "baseui/table-grid";
import { getContract } from "viem";
import { useContractWrite, usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContract } from "~~/hooks/scaffold-eth/";
import { canClaimAmount, didResolve, isPending, toBetInfo, toWager, youWon } from "~~/hooks/utils";
import {
  BetInfo,
  BetInfoArray,
  BetStatusProps,
  EventWinner,
  Market,
  Team,
  Wager,
  WagerArray,
} from "~~/interfaces/interfaces";
// import deployedContractsData from "~~/contracts/deployedContracts";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

// const eventWinnerString = (winner: EventWinner): string => {
//   switch (winner) {
//     case EventWinner.HOME_TEAM:
//       return "HOME_TEAM";
//     case EventWinner.AWAY_TEAM:
//       return "AWAY_TEAM";
//     case EventWinner.UNDEFINED:
//     default:
//       return "UNDEFINED";
//   }
// };

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

const Claim = ({
  eventAddress,
  accountAddress,
  claimAmount,
}: {
  eventAddress: string;
  accountAddress: string;
  claimAmount: bigint;
}) => {
  const { data: TopsportsEventCore } = useScaffoldContract({ contractName: "TopsportsEventCore" });
  const { write: claimWrite } = useContractWrite({
    address: eventAddress,
    abi: TopsportsEventCore?.abi as Contract<"TopsportsEventCore">["abi"],
    functionName: "collect",
    args: [accountAddress],
  });
  return <Button onClick={() => claimWrite()}>Claim {claimAmount.toString()}</Button>;
};

const MyBets = () => {
  const publicClient = usePublicClient();
  const account = useAccount();
  const { data: TopsportsEventFactory } = useScaffoldContract({ contractName: "TopsportsEventFactory" });
  const { data: deployedContractData } = useDeployedContractInfo("TopsportsEventCore");
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [eventWinner, setEventWinner] = useState<{ [key: string]: number }>({});
  const [eventWager, setEventWager] = useState<{ [address: string]: Wager }>({});
  const [allMarkets, setAllMarkets] = useState<{ [address: string]: Market[] }>({});
  const [eventsDetails, setEventsDetails] = useState<{ [address: string]: DeployedEvent }>({});

  useEffect(() => {
    if (account.address === undefined || TopsportsEventFactory === undefined || deployedContractData === undefined) {
      return;
    }

    const fetchContractEvent = async () => {
      const newBets: BetInfo[] = [];
      let i: bigint;
      // i++ until Error: Transaction reverted without a reason string
      for (i = 0n; ; i++) {
        // while (true) {
        try {
          const result = await TopsportsEventFactory.read.betsByAddress([account.address as string, i]);
          if (!result) {
            break;
          }
          const betInfo = toBetInfo(result as BetInfoArray);
          newBets.push(betInfo);

          const TopsportsEventCore = getContract({
            address: betInfo.eventContract,
            abi: deployedContractData?.abi as Contract<ContractName>["abi"],
            publicClient,
          });

          if (!eventsDetails[betInfo.eventContract]) {
            const response = await fetch("/api/deployedEvent?address=" + betInfo.eventContract);
            const event = (await response.json()) as DeployedEvent;
            setEventsDetails(prev => ({ ...prev, [betInfo.eventContract]: event }));
          }
          // If the event contract is not in allMarkets, fetch all markets for that contract
          if (!allMarkets[betInfo.eventContract]) {
            const markets = (await TopsportsEventCore.read.getAllMarkets()) as Market[];
            setAllMarkets(prev => ({ ...prev, [betInfo.eventContract]: markets }));

            const winner = (await TopsportsEventCore.read.winner()) as number;
            setEventWinner(prev => ({ ...prev, [betInfo.eventContract]: winner })); // XXX race?

            const wager = (await TopsportsEventCore.read.wagerByAddress([account.address as string])) as WagerArray;
            setEventWager(prev => ({ ...prev, [betInfo.eventContract]: toWager(wager) }));
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
  }, [account, allMarkets, eventsDetails, TopsportsEventFactory?.address, deployedContractData?.address]);
  // });

  const retp = (betInfo: BetInfo) => {
    try {
      const p: BetStatusProps = {
        choice: allMarkets[betInfo.eventContract][Number(betInfo.marketId)].bets[Number(betInfo.betId)].winner,
        eventDate: new Date(eventsDetails[betInfo.eventContract].eventDate),
        winner: eventWinner[betInfo.eventContract],
        wager: eventWager[betInfo.eventContract],
      };
      return p;
    } catch (error) {
      console.error("retp", error);
      debugger;
    }
    // const p: BetStatusProps = {
    //   choice: allMarkets[betInfo.eventContract][Number(betInfo.marketId)].bets[Number(betInfo.betId)].winner,
    //   eventDate: new Date(eventsDetails[betInfo.eventContract].eventDate),
    //   winner: eventWinner[betInfo.eventContract],
    //   wager: eventWager[betInfo.eventContract],
    // };
    // return p;
    return {
      choice: allMarkets[betInfo.eventContract][Number(betInfo.marketId)].bets[Number(betInfo.betId)].winner,
      eventDate: new Date(eventsDetails[betInfo.eventContract].eventDate),
      winner: eventWinner[betInfo.eventContract],
      wager: eventWager[betInfo.eventContract],
    };
  };
  const betInfoIsPending = (betInfo: BetInfo) => {
    return isPending(retp(betInfo));
  };
  const betInfoIsWon = (betInfo: BetInfo) => {
    return didResolve(retp(betInfo)) && youWon(retp(betInfo));
  };
  const betInfoIsHistory = (betInfo: BetInfo) => {
    return !betInfoIsPending(betInfo) && !betInfoIsWon(betInfo);
  };

  const Bet = ({ betInfo }: { betInfo: BetInfo }) => {
    // if (eventsDetails) debugger;
    // console.log("RAAAA", betInfo);
    const market = allMarkets[betInfo.eventContract][Number(betInfo.marketId)];
    const bet = market.bets[Number(betInfo.betId)];
    const p = retp(betInfo);
    const home = (eventsDetails[betInfo.eventContract].homeTeam as unknown as Team).name;
    const away = (eventsDetails[betInfo.eventContract].awayTeam as unknown as Team).name;
    const myTeam = p.choice === EventWinner.HOME_TEAM ? home : away;
    const odds = bet.winner === EventWinner.HOME_TEAM ? market.homeTeamOdds : market.awayTeamOdds;
    const profit = bet.profit;
    const stake = bet.stake;
    const mult = Number((100n * (stake + profit)) / stake) / 100;
    return (
      <div>
        {/* <p>
          {betInfo.eventId.toString()} {eventsDetails[betInfo.eventContract].displayName}
        </p> */}
        <p>{home}</p>
        <p>{away}</p>
        <p>{mult} X</p>
        {/* <p>{new Date(eventsDetails[betInfo.eventContract].eventDate).toString()}</p>
        <p>{eventWinnerString(market.bets[Number(betInfo.betId)].winner)} Wins @ +{odds.toString()}</p>
        <p>eventWinner {eventWinnerString(eventWinner[betInfo.eventContract])}</p>
        <p>
          Days til event:{" "}
          {(new Date(eventsDetails[betInfo.eventContract].eventDate).valueOf() - new Date().valueOf()) / (3600 * 24 * 1000)}
        </p>
        <p>Home Odds {market.homeTeamOdds.toString()}</p>
        <p>Away Odds {market.awayTeamOdds.toString()}</p> */}

        <p>
          {myTeam} Wins @ +{"" + odds}
        </p>
        <p>Stake: {market.bets[Number(betInfo.betId)].stake.toString()}</p>
        <p>Potential Win: {market.bets[Number(betInfo.betId)].profit.toString()}</p>
        {/* <p>
          wagerByAddress{" "}
          {JSON.stringify(eventWager[betInfo.eventContract], (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          )}
        </p>
        <p>canClaimAmount {canClaimAmount(p).toString()}</p> */}
        {canClaimAmount(p) > 0n && (
          <Claim
            eventAddress={betInfo.eventContract}
            accountAddress={account.address as string}
            claimAmount={canClaimAmount(p)}
          />
        )}
        {/* DEBUG */}
        {/* {JSON.stringify(betInfo, (key, value) => (typeof value === "bigint" ? value.toString() : value))} */}
        {/* {eventcache[betInfo.eventId.toString()] && JSON.stringify(eventcache[betInfo.eventId.toString()])} */}
        {/* {allMarkets[betInfo.eventContract] &&
          JSON.stringify(market.bets[Number(betInfo.betId)], (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          )} */}
      </div>
    );
  };

  const StyledBetBodyCell = withStyle(StyledBodyCell, {
    border: "1px solid black",
    margin: "10px",
  });

  if (
    bets.length === 0 ||
    Object.keys(allMarkets).length === 0 ||
    Object.keys(eventsDetails).length === 0 ||
    Object.keys(eventWinner).length === 0 ||
    Object.keys(eventWager).length === 0
  ) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      <Card title="My Bets">
        <Card title="Pending">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.filter(betInfoIsPending).map((betInfo, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet betInfo={betInfo} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>

        <Card title="Wins">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.filter(betInfoIsWon).map((betInfo, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet betInfo={betInfo} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>

        <Card title="History">
          <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
            {bets.filter(betInfoIsHistory).map((betInfo, index) => (
              <StyledBetBodyCell key={index}>
                <StyledBody>
                  <Bet betInfo={betInfo} />
                </StyledBody>
              </StyledBetBodyCell>
            ))}
          </StyledTable>
        </Card>
      </Card>
    </div>
  );
};

export { MyBets };
