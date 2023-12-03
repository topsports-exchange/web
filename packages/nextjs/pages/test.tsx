import localFont from "@next/font/local";
import { NextPage } from "next";

const sportsCategories = [
  "NFL",
  "Soccer",
  "Basketball",
  "Baseball",
  "Boxing",
  "Golf",
  // Add more sports as needed
];

const mockData = [
  {
    team1Logo: "team1LogoUrl",
    team1Name: "Team 1",
    team2Logo: "team2LogoUrl",
    team2Name: "Team 2",
    matchTime: "12:00 PM",
    markets: 5,
  },
  {
    team1Logo: "team1LogoUrl",
    team1Name: "Team 1",
    team2Logo: "team2LogoUrl",
    team2Name: "Team 2",
    matchTime: "12:00 PM",
    markets: 5,
  },
  {
    team1Logo: "team1LogoUrl",
    team1Name: "Team 1",
    team2Logo: "team2LogoUrl",
    team2Name: "Team 2",
    matchTime: "12:00 PM",
    markets: 5,
  },
  {
    team1Logo: "team1LogoUrl",
    team1Name: "Team 1",
    team2Logo: "team2LogoUrl",
    team2Name: "Team 2",
    matchTime: "12:00 PM",
    markets: 5,
  },
  // Add more objects for more cards
];

interface BetItemCardProps {
  team1Logo: string;
  team1Name: string;
  team2Logo: string;
  team2Name: string;
  matchTime: string;
  markets: number;
  isLive?: boolean;
}
const sportypo = localFont({
  src: [
    {
      path: "../public/fonts/Sportypo/Sportypo-Reguler-Demo.ttf",
      weight: "400",
    },
    {
      path: "../public/fonts/Sportypo/Sportypo-Reguler-Demo.ttf",
      weight: "700",
    },
  ],
  variable: "--font-sportypo",
});
const Header = () => <div className="text-center py-4 text-3xl font-bold text-green-400">TOPSPORTSEXCHANGE</div>;

const SportsList = () => (
  <div className="bg-gray-800 text-white w-48 h-full rounded-2xl p-4 flex flex-col">
    {sportsCategories.map((category, index) => (
      <a key={index} href="#" className="hover:bg-gray-700 p-2 rounded-md my-1">
        {category}
      </a>
    ))}
  </div>
);
const BetItemCard = ({ data }: { data: BetItemCardProps }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-2xl m-2 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Replace with actual path to team logos */}
          <img className="w-8 h-8 mr-2" src={data.team1Logo} alt={`${data.team1Name} Logo`} />
          <span className="font-bold">{data.team1Name}</span>
        </div>
        <div className={`px-3 py-1 rounded-full ${data.isLive ? "bg-red-600" : "bg-gray-600"}`}>
          {data.isLive ? "Live" : "Upcoming"}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          {/* Replace with actual path to team logos */}
          <img className="w-8 h-8 mr-2" src={data.team2Logo} alt={`${data.team2Name} Logo`} />
          <span className="font-bold">{data.team2Name}</span>
        </div>
        <div className="text-gray-400">{data.matchTime}</div>
      </div>
      <div className="bg-green-700 text-white px-3 py-1 rounded-full w-max self-end mt-2">{data.markets} markets »</div>
    </div>
  );
};
const BetList = () => (
  <div className="flex-1 flex flex-wrap justify-start items-start grid grid-cols-2 gap-4">
    {mockData.map((data, index) => (
      <BetItemCard key={index} data={data} />
    ))}
  </div>
);
const WeekList = () => (
  <div className="flex justify-center items-center my-4 space-x-2">
    {/* Iterate over an array of weeks. This is just an example, you can replace it with your actual weeks data. */}
    {["All", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"].map((week, index) => (
      <button
        key={index}
        className={`px-4 py-2 rounded-full ${
          week === "All" ? "bg-green-700 text-white" : "bg-gray-700 text-gray-300"
        } hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
      >
        {week}
      </button>
    ))}
  </div>
);
const WalletConnect = () => (
  <div className="bg-red-900 text-white w-48 h-44 rounded-2xl p-4 flex flex-col justify-between">
    <div className="font-semibold">Wallet</div>
    <div className="text-sm">Address: 0xa5...92cc</div>
    <button className="bg-green-500 px-4 py-2 rounded-full">Connect Wallet</button>
  </div>
);
const CustomHeader = () => (
  <div className="bg-black text-white flex justify-between items-center p-4">
    <div className="flex items-center">
      {/* Logo and Title */}
      <img src="/path-to-your-logo.png" alt="TopSports Exchange Logo" className="h-12 mr-4" />
      <span className="text-2xl font-bold">TOPSPORTSEXCHANGE</span>
    </div>
    <div className="flex items-center">
      {/* Match of the Day or other central header content */}
      <div className="bg-green-500 text-white rounded-lg p-4 mr-4">
        <span className="text-lg">MATCH OF THE DAY</span>
        {/* Add more content here as needed */}
      </div>
      {/* Wallet Connect or other user-related info */}
      <div className="bg-green-600 text-white rounded-full px-6 py-2">
        <span>0xa5...92cc</span>
      </div>
    </div>
  </div>
);
const TestPage: NextPage = () => (
  <div className="min-h-screen bg-zinc-950 text-white">
    {/* Header Component - Uncomment if you have the component */}
    {/* <Header /> */}

    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
      {/* Sidebar: SportsList */}
      <div className="w-full md:w-1/4 xl:w-1/5 p-4">
        <SportsList />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4">
        <Header />
        <WeekList />
        <BetList />
      </div>

      {/* Right sidebar: WalletConnect */}
      <div className="w-full md:w-1/4 xl:w-1/5 p-4">
        <WalletConnect />
      </div>
    </div>
  </div>
);
export default TestPage;
