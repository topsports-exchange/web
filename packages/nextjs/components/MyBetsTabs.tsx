import { useState } from "react";
import { BetInterface, PlaceBetPopup } from "./PlaceBet";
import { useBets } from "~~/hooks/useBets";
import { BetInfo } from "~~/interfaces/interfaces";

const betDataMock: BetInterface = {
  teams: [
    {
      logo: "https://via.placeholder.com/150?text=Raiders", // Replace with actual logo URL
      name: "Las Vegas Raiders",
    },
    {
      logo: "https://via.placeholder.com/150?text=Giants", // Replace with actual logo URL
      name: "New York Giants",
    },
  ],
  odds: 130,
  winMultiplier: 3,
  maxBetAmount: 500,
  maker: "pablo.ETH",
  marketSmartContractAddress: "0x5a...a6e3",
};

export const MyBetsTabs = () => {
  const [isLogged] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // Added state for active tab
  const { bets } = useBets();

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return <TabPending bets={bets} />; // Replace with actual pending bets
      case "wins":
        return <TabWins bets={[]} />;
      case "history":
        return <TabHistory />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-96 bg-neutral-950 rounded-2xl flex flex-col justify-center items-center p-4 fixed top-20 right-0">
        {isLogged ? (
          <>
            <MyBetsLoggedIn setActiveTab={setActiveTab} activeTab={activeTab} />
            {renderTabContent()}
          </>
        ) : (
          <MyBetsNotLogged />
        )}
      </div>
      <PlaceBetPopup />
    </>
  );
};
export const MyBetsLoggedIn = ({
  setActiveTab,
  activeTab,
}: {
  setActiveTab: (value: string) => void;
  activeTab: string;
}) => {
  return (
    <div className="">
      <div className="text-neutral-50 text-2xl font-bold font-['Exo 2'] mb-2">Your Bets</div>
      <div className="w-64 text-slate-400 text-base font-medium font-['Exo 2'] leading-normal pb-2">
        Please check the ‘Wins’ section to claim your winnings
      </div>
      <Tabs setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
};
export const MyBetsNotLogged = () => {
  return (
    <div className="">
      {/* Title "Your Bets" */}
      <div className="text-neutral-50 text-2xl font-bold font-['Exo 2'] mb-2">Your Bets</div>
      {/* Subtitle */}
      <div className="text-slate-400 text-base font-medium font-['Exo 2'] mb-4">
        Connect your wallet to access your bets
      </div>
      {/* Connect Wallet Button */}
      <button className="bg-gradient-to-r from-emerald-400 to-green-500 text-neutral-900 text-lg font-semibold font-['Exo 2'] rounded-full shadow px-6 py-2 flex items-center">
        {/* Wallet Icon - Assuming you have an SVG or similar */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="solar:wallet-bold" opacity="0.8">
            <g id="Group">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.1001 8.004C21.0451 8 20.9841 8 20.9201 8H18.3951C16.3271 8 14.5581 9.628 14.5581 11.75C14.5581 13.872 16.3281 15.5 18.3951 15.5H20.9201C20.9841 15.5 21.0451 15.5 21.1021 15.496C21.5271 15.4704 21.9283 15.2911 22.231 14.9916C22.5336 14.6921 22.7171 14.2927 22.7471 13.868C22.7511 13.808 22.7511 13.743 22.7511 13.683V9.817C22.7511 9.757 22.7511 9.692 22.7471 9.632C22.7171 9.20726 22.5336 8.80793 22.231 8.50842C21.9283 8.2089 21.5271 8.02963 21.1021 8.004H21.1001ZM18.1721 12.75C18.7041 12.75 19.1351 12.302 19.1351 11.75C19.1351 11.198 18.7041 10.75 18.1721 10.75C17.6391 10.75 17.2081 11.198 17.2081 11.75C17.2081 12.302 17.6391 12.75 18.1721 12.75Z"
                fill="black"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.918 17C20.9526 16.9986 20.987 17.0054 21.0184 17.0198C21.0499 17.0342 21.0775 17.0558 21.099 17.0829C21.1206 17.11 21.1354 17.1418 21.1424 17.1757C21.1493 17.2096 21.1481 17.2446 21.139 17.278C20.939 17.99 20.62 18.598 20.109 19.108C19.36 19.858 18.411 20.189 17.239 20.347C16.099 20.5 14.644 20.5 12.806 20.5H10.694C8.856 20.5 7.4 20.5 6.261 20.347C5.089 20.189 4.14 19.857 3.391 19.109C2.643 18.36 2.311 17.411 2.153 16.239C2 15.099 2 13.644 2 11.806V11.694C2 9.856 2 8.4 2.153 7.26C2.311 6.088 2.643 5.139 3.391 4.39C4.14 3.642 5.089 3.31 6.261 3.152C7.401 3 8.856 3 10.694 3H12.806C14.644 3 16.1 3 17.239 3.153C18.411 3.311 19.36 3.643 20.109 4.391C20.62 4.903 20.939 5.51 21.139 6.222C21.1481 6.25537 21.1493 6.29042 21.1424 6.32432C21.1354 6.35822 21.1206 6.39 21.099 6.41708C21.0775 6.44417 21.0499 6.46579 21.0184 6.4802C20.987 6.4946 20.9526 6.50139 20.918 6.5H18.394C15.557 6.5 13.057 8.74 13.057 11.75C13.057 14.76 15.557 17 18.394 17H20.918ZM5.75 7C5.55109 7 5.36032 7.07902 5.21967 7.21967C5.07902 7.36032 5 7.55109 5 7.75C5 7.94891 5.07902 8.13968 5.21967 8.28033C5.36032 8.42098 5.55109 8.5 5.75 8.5H9.75C9.94891 8.5 10.1397 8.42098 10.2803 8.28033C10.421 8.13968 10.5 7.94891 10.5 7.75C10.5 7.55109 10.421 7.36032 10.2803 7.21967C10.1397 7.07902 9.94891 7 9.75 7H5.75Z"
                fill="black"
              />
            </g>
          </g>
        </svg>
        <span className="pl-2">Connect Wallet</span>
      </button>
      {/* <Tabs /> */}
    </div>
  );
};
const Tabs = ({ setActiveTab, activeTab }: { setActiveTab: (value: string) => void; activeTab: string }) => {
  return (
    <div className="bg-[#0d2521ec] rounded-full flex text-white">
      <button
        onClick={() => setActiveTab("pending")}
        className={`px-4 py-1 rounded-full font-semibold transition duration-300 ease-in-out focus:outline-none ${
          activeTab === "pending" ? "bg-emerald-400" : ""
        }`}
      >
        Pending
      </button>
      <button
        onClick={() => setActiveTab("wins")}
        className={`px-4 py-1 rounded-full font-semibold transition duration-300 ease-in-out focus:outline-none ${
          activeTab === "wins" ? "bg-emerald-400" : ""
        }`}
      >
        Wins
      </button>
      <button
        onClick={() => setActiveTab("history")}
        className={`px-4 py-1 rounded-full font-semibold transition duration-300 ease-in-out focus:outline-none ${
          activeTab === "history" ? "bg-emerald-400" : ""
        }`}
      >
        History
      </button>
    </div>
  );
};

// packages/nextjs/components/MyBets.tsx
const TabWins = (args: { bets: BetInfo[] }) => {
  return (
    <>
      {args.bets.map((bet, index) => (
        <TabBet key={index} bet={bet} />
      ))}
    </>
  );
};
const TabPending = (args: { bets: BetInfo[] }) => {
  return (
    <>
      {args.bets.map((bet, index) => (
        <TabBet key={index} bet={bet} />
      ))}
    </>
  );
};
const TabBet = (args: { bet: BetInfo }) => {
  const { bet } = args;
  const { getBetWithEvent } = useBets();
  const betInfo = getBetWithEvent({ betInfo: bet });

  return (
    <>
      {betInfo ? (
        <div className="bg-neutral-950 w-full rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img src={betInfo.home.logo ?? "/assets/LA.png"} alt={betInfo.home.name} className="w-6 h-6 mr-2" />
              <span>{betInfo.home.name}</span>
            </div>
            <div className="text-emerald-400">{betInfo.odds}</div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img src={betInfo.away.logo ?? "/assets/kansas.png"} alt={betInfo.away.name} className="w-6 h-6 mr-2" />
              <span>{betInfo.away.name}</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between">
              <span>Multiplier </span>
              <span>{betInfo.mult}</span>
            </div>
            <div className="flex justify-between">
              <span>{betInfo.myTeam.name} Wins @ </span>
              <span>{betInfo.odds}</span>
            </div>
            <div className="flex justify-between">
              <span>Stake</span>
              <span>{betInfo.stake.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Potential win</span>
              <span className="text-emerald-400">{betInfo?.profit}</span>
            </div>
          </div>
          {/* {betInfo.actionText && (
            <button className="w-full bg-emerald-500 text-neutral-900 text-lg font-semibold rounded-full py-2 shadow">
              {betInfo.actionText}
            </button>
          )} */}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

const TabHistory = () => {
  return <div>{/* Content for History Tab */}</div>;
};
