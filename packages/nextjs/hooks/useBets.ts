import { useCallback, useEffect, useState } from "react";
import { useDeployedContractInfo, useScaffoldContract } from "./scaffold-eth";
import { didResolve, isPending, toBetInfo, toWager, youWon } from "./utils";
import { DeployedEvent } from "@prisma/client";
import { Contract } from "ethers";
import { getContract } from "viem";
import { useAccount, usePublicClient } from "wagmi";
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
import { ContractName } from "~~/utils/scaffold-eth/contract";

function useBets() {
  const publicClient = usePublicClient();
  const account = useAccount();
  const { data: TopsportsEventFactory } = useScaffoldContract({ contractName: "TopsportsEventFactory" });
  const { data: deployedContractData } = useDeployedContractInfo("TopsportsEventCore");
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [eventWinner, setEventWinner] = useState<{ [key: string]: number }>({});
  const [eventWager, setEventWager] = useState<{ [address: string]: Wager }>({});
  const [allMarkets, setAllMarkets] = useState<{ [address: string]: Market[] }>({});
  const [eventsDetails, setEventsDetails] = useState<{ [address: string]: DeployedEvent }>({});

  const retp = useCallback(
    (betInfo: BetInfo) => {
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
    },
    [allMarkets, eventsDetails, eventWinner, eventWager],
  );

  const getBetWithEvent = useCallback(
    ({ betInfo }: { betInfo: BetInfo }) => {
      // if (eventsDetails) debugger;
      if (!eventsDetails || !allMarkets[betInfo.eventContract] || isNaN(+betInfo?.marketId.toString())) return;
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

      return {
        home: home,
        away: away,
        myTeam: myTeam,
        stake: stake,
        profit: profit.toString(),
        odds: odds.toString(),
        taker: bet.taker,
        eventId: betInfo.eventId.toString(),
        winner: bet.winner,
        mult: mult,
      };
    },
    [allMarkets, eventsDetails, retp],
  );

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
    // }, [account, allMarkets, publicClient, eventsDetails, TopsportsEventFactory, deployedContractData]);
  }, [
    account.address,
    account.isConnected,
    allMarkets,
    eventsDetails,
    TopsportsEventFactory?.address,
    deployedContractData?.address,
  ]);

  const betInfoIsPending = (betInfo: BetInfo) => {
    return isPending(retp(betInfo));
  };
  const betInfoIsWon = (betInfo: BetInfo) => {
    return didResolve(retp(betInfo)) && youWon(retp(betInfo));
  };
  const betInfoIsHistory = (betInfo: BetInfo) => {
    return !betInfoIsPending(betInfo) && !betInfoIsWon(betInfo);
  };

  return {
    bets,
    allMarkets,
    eventsDetails,
    betInfoIsPending,
    betInfoIsWon,
    betInfoIsHistory,
    getBetWithEvent,
    retp,
  };
}

export { useBets };
