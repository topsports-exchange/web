import React from "react";

interface IOpenMarketCardProps {
  team1: any;
  team2: any;
  activeAmount: any;
  totalAmount: any;
  setSelectedMatch: (match: string | null) => void;
}

const OpenMarketCard: React.FC<IOpenMarketCardProps> = ({
  team1,
  team2,
  activeAmount,
  totalAmount,
  setSelectedMatch,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={team1.logo} alt={team1.name} className="w-8 h-8 mr-2" />
          <span>{team1.name} Wins</span>
        </div>
        <span className="text-green-400">{team1.odds}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={team2.logo} alt={team2.name} className="w-8 h-8 mr-2" />
          <span>{team2.name} Wins</span>
        </div>
        <span className="text-red-400">{team2.odds}</span>
      </div>
      <div className="mb-4">
        <span className="text-sm">Active</span>
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${(activeAmount / totalAmount) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">{`$${activeAmount} / $${totalAmount}`}</span>
      </div>
      <button
        onClick={() => setSelectedMatch?.(null)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Get in &raquo;
      </button>
    </div>
  );
};

export default OpenMarketCard;
