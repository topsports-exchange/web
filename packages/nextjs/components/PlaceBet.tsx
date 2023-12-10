import React, { useState } from "react";
import Popup from "./Popup";

interface Team {
  logo: string;
  name: string;
}

export interface BetInterface {
  teams: Team[];
  odds: number;
  winMultiplier: number;
  maxBetAmount: number;
  maker: string;
  marketSmartContractAddress: string;
}
export const PlaceBetPopup = ({ betData }: { betData: BetInterface }) => {
  const [isPopupOpen, setPopupOpen] = useState(true);

  const closePopup = () => setPopupOpen(false);
  return (
    <Popup isOpen={isPopupOpen} onClose={closePopup}>
      <PlaceBet betData={betData} />
    </Popup>
  );
};
const PlaceBet: React.FC<{ betData: BetInterface }> = ({ betData }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);

  const calculatePotentialWin = (amount: number, multiplier: number): number => {
    return amount * multiplier;
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleBetAmountChange = (amount: number) => {
    if (amount <= betData.maxBetAmount) {
      setBetAmount(amount);
    }
  };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <div className="flex justify-between mb-4">
        {betData.teams.map(team => (
          <button
            key={team.name}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${
              selectedTeam?.name === team.name
                ? "border-green-500 bg-green-500 text-white"
                : "border-transparent bg-neutral-700 hover:bg-neutral-600 text-gray-300"
            }`}
            onClick={() => handleTeamSelect(team)}
          >
            <img src={team.logo} alt={team.name} className="w-6 h-6 mr-2" />
            {team.name}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <div className="text-lg font-semibold">{selectedTeam ? `${selectedTeam.name} Wins` : "Select a team"}</div>
        <div className={`text-lg font-semibold ${selectedTeam ? "text-emerald-400" : "text-gray-400"}`}>
          {selectedTeam ? `+${betData.odds}` : "Odds"}
        </div>
        <div className="text-lg font-semibold">{selectedTeam ? `${betData.winMultiplier}x` : "Multiplier"}</div>
        <div className="text-lg font-semibold">
          Potential win: ${selectedTeam ? calculatePotentialWin(betAmount, betData.winMultiplier) : "0"}
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
            onClick={() => handleBetAmountChange(betData.maxBetAmount)}
            className={`px-4 py-2 rounded-md ${betAmount === betData.maxBetAmount ? "bg-green-600" : "bg-green-500"}`}
          >
            MAX
          </button>
        </div>
      </div>
      <button className="w-full bg-green-600 py-3 rounded-md text-lg font-semibold hover:bg-green-700">
        Place Bet
      </button>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">Maker</div>
        <div className="text-sm">{betData.maker}</div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm">Market Smart Contract</div>
        <div className="text-sm">{betData.marketSmartContractAddress}</div>
      </div>
    </div>
  );
};

export default PlaceBet;
