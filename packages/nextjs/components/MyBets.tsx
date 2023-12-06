// src/components/MyBets.tsx
import React, { useEffect, useState } from "react";
import { withStyle } from "baseui";
import { Card, StyledBody } from "baseui/card";
import {
  // StyledHeadCell,
  StyledBodyCell,
  StyledTable,
} from "baseui/table-grid";
import { usePublicClient } from "wagmi";
import { useAccount } from "wagmi";
import deployedContractsData from "~~/contracts/deployedContracts";

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

const eventcache: { [key: string]: any } = {};
eventcache["401548411"] = {
  id: 3,
  eventId: "401548411",
  displayName: "Tennessee Titans at Chicago Bears",
  eventDate: new Date("2023-08-12T00:00:00.000Z"),
  deadline: new Date("1970-01-01T00:00:00.000Z"),
  address: "0xE7Ab431d056AFFd38Cd550bcef0A2cd2e321CDab",
  salt: "0x60a3e3b95c2c75ebb620be1cdc097834bf6e77468047c9888bfb8e2b311e2d86",
};

const MyBets = () => {
  const publicClient = usePublicClient();
  const account = useAccount();
  const [bets, setBets] = useState<BetInfo[]>([]);
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

  useEffect(() => {
    console.log("account", account);
    if (account.address === undefined) {
      return;
    }

    const fetchContractEvent = async () => {
      let i = 0n;
      const newBets: BetInfo[] = [];
      while (true) {
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
          i++;
          newBets.push(result);

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
  }, [account.address]);

  console.log("allMarkets", allMarkets);

  const StyledBetBodyCell = withStyle(StyledBodyCell, {
    border: "1px solid black",
    margin: "10px",
  });

  return (
    <div>
      <Card title="My Bets">
        <StyledTable role="grid" $gridTemplateColumns="repeat(1,1fr)">
          {bets.map((bet, index) => (
            <StyledBetBodyCell key={index}>
              <StyledBody>
                <p>{bet.eventId.toString()}</p>
                {JSON.stringify(bet, (key, value) => (typeof value === "bigint" ? value.toString() : value))}
                {eventcache[bet.eventId.toString()] && JSON.stringify(eventcache[bet.eventId.toString()])}
                {allMarkets[bet.eventContract] &&
                  JSON.stringify(
                    allMarkets[bet.eventContract][Number(bet.marketId)].bets[Number(bet.betId)],
                    (key, value) => (typeof value === "bigint" ? value.toString() : value),
                  )}
              </StyledBody>
            </StyledBetBodyCell>
          ))}
        </StyledTable>
      </Card>
    </div>
  );
};

export default MyBets;
