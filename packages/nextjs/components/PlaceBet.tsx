import React, { useState } from "react";
import Popup from "./Popup";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";
import { erc20ABI, useContractWrite } from "wagmi";
import deployedContractsData from "~~/contracts/deployedContracts";
import { DeployedEventNormalized, EventWinner, TakeSigProps } from "~~/interfaces/interfaces";
import { useGlobalState } from "~~/services/store/store";

interface Team {
  logo: string;
  name: string;
}

export interface EventTeam extends Team, JsonObject {
  moneylines: number[];
}
export interface BetInterface extends DeployedEventNormalized {
  homeTeam: EventTeam;
  awayTeam: EventTeam;
}
export const PlaceBetPopup = ({ event, tokenAddress, makerSignature }: TakeSigProps) => {
  // const [isPopupOpen, setPopupOpen] = useState(true);
  const { isPlaceBetModalOpen, placeBetModalData, setPlaceBetModalOpen } = useGlobalState();
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

  const closePopup = () => setPlaceBetModalOpen(false);
  return (
    <Popup isOpen={isPlaceBetModalOpen} onClose={closePopup}>
      {placeBetModalData && (
        <PlaceBet betData={placeBetModalData} approveWrite={approveWrite} placeBetWrite={placeBetWrite} />
      )}
    </Popup>
  );
};
const PlaceBet: React.FC<{ betData: BetInterface; approveWrite: any; placeBetWrite: any }> = args => {
  const { betData, approveWrite, placeBetWrite } = args;
  console.log("PLACE BET DATA", betData);
  const [selectedTeam, setSelectedTeam] = useState<EventTeam | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);

  const calculatePotentialWin = (amount: number, odds: number[]): number => {
    if (!selectedTeam || odds.length === 0) return 0;
    const averageOdds = odds.reduce((acc, value) => acc + value, 0) / odds.length;
    const potentialWIn = amount * (averageOdds > 0 ? averageOdds / 100 + 1 : -100 / averageOdds + 1);
    return parseFloat(potentialWIn.toFixed(2));
  };

  const handleTeamSelect = (team: EventTeam) => {
    setSelectedTeam(team);
  };

  const handleBetAmountChange = (amount: number) => {
    // Assuming maxBetAmount is the maximum value in the moneylines array
    const maxBetAmount = Math.max(...betData.homeTeam?.moneylines, ...betData.awayTeam.moneylines);
    if (amount <= maxBetAmount) {
      setBetAmount(amount);
    }
  };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <div className="flex justify-between mb-4">
        {[betData.homeTeam, betData.awayTeam].map(team => (
          <button
            key={team.id}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${
              selectedTeam?.name === team.name
                ? "border-green-500 bg-green-500 text-white"
                : "border-transparent bg-neutral-700 hover:bg-neutral-600 text-gray-300"
            }`}
            onClick={() => handleTeamSelect(team)}
          >
            <img src={team.logo} alt={team.name} className="w-6 h-6 mr-2" />
            {team.name?.toString()}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <div className="text-lg font-semibold">{selectedTeam ? `${selectedTeam.name} Wins` : "Select a team"}</div>
        <div className={`text-lg font-semibold ${selectedTeam ? "text-emerald-400" : "text-gray-400"}`}>
          {selectedTeam ? `${selectedTeam.moneylines[0] > 0 ? "+" : ""}${selectedTeam.moneylines[0]}` : "Odds"}
        </div>
        <div className="text-lg font-semibold">
          Potential win: ${calculatePotentialWin(betAmount, selectedTeam ? selectedTeam.moneylines : [])}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="number"
            value={betAmount}
            onChange={e => handleBetAmountChange(Number(e.target.value))}
            placeholder="Bet amount"
            className="w-full px-4 py-2 bg-neutral-800 rounded-md text-sm"
          />
          {/* Quick bet buttons */}
          {[20, 50, 100].map(amount => (
            <button
              key={amount}
              onClick={() => handleBetAmountChange(amount)}
              className={`px-4 py-2 rounded-md ${betAmount === amount ? "bg-green-600" : "bg-green-500"}`}
            >
              ${amount}
            </button>
          ))}
          <button
            onClick={() =>
              handleBetAmountChange(Math.max(...betData.homeTeam.moneylines, ...betData.awayTeam.moneylines))
            }
            className={`px-4 py-2 rounded-md ${
              betAmount === Math.max(...betData.homeTeam.moneylines, ...betData.awayTeam.moneylines)
                ? "bg-green-600"
                : "bg-green-500"
            }`}
          >
            MAX
          </button>
        </div>
      </div>
      {/* <Button onClick={() => approveWrite()}>Approve</Button>
      <Button onClick={() => placeBetWrite()}>Place Bet</Button> */}
      <button
        onClick={() => approveWrite()}
        className="w-full bg-green-600 py-3 rounded-md text-lg font-semibold hover:bg-green-700"
      >
        Approve
      </button>
      <button
        onClick={() => placeBetWrite()}
        className="w-full bg-green-600 py-3 rounded-md text-lg font-semibold hover:bg-green-700"
      >
        Place Bet
      </button>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">Maker</div>
        <div className="text-sm">{betData.address}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm">Market Smart Contract</div>
        <div className="text-sm">{betData.salt}</div>
      </div>
    </div>
  );
};

export default PlaceBet;
