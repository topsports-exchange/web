import { useState } from "react";
import WeekPage, { getFirstDayOfWeek } from "./events/week/[weeknum]";
import localFont from "@next/font/local";
import { DeployedEvent, PrismaClient } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
// import { EventListItem } from "~~/components/EventListItem";
import { MyBetsTabs } from "~~/components/MyBetsTabs";
import OpenMarketCard from "~~/components/OpenMarketCard";
import { BetItemCardProps } from "~~/interfaces/interfaces";
import { customDeserializer, customSerializer } from "~~/utils/serial";

const prisma = new PrismaClient();

const sportsCategories = [
  "NFL",
  "Soccer",
  "Basketball",
  "Baseball",
  "Boxing",
  "Golf",
  // Add more sports as needed
];

const mockData: BetItemCardProps[] = [
  {
    id: "1",
    team1Logo: "https://via.placeholder.com/32x32",
    team1Name: "Team 1",
    team2Logo: "https://via.placeholder.com/32x32",
    team2Name: "Team 2",
    matchTime: "Sept 12, 7:30 PM",
    markets: 5,
    isLive: true,
  },
  {
    id: "2",
    team1Logo: "https://via.placeholder.com/32x32",
    team1Name: "Team 1",
    team2Logo: "https://via.placeholder.com/32x32",
    team2Name: "Team 2",
    matchTime: "Sept 12, 7:30 PM",
    markets: 5,
  },
  {
    id: "3",
    team1Logo: "https://via.placeholder.com/32x32",
    team1Name: "Team 1",
    team2Logo: "https://via.placeholder.com/32x32",
    team2Name: "Team 2",
    matchTime: "Sept 12, 7:30 PM",
    markets: 5,
  },
  {
    id: "4",
    team1Logo: "https://via.placeholder.com/32x32",
    team1Name: "Team 1",
    team2Logo: "https://via.placeholder.com/32x32",
    team2Name: "Team 2",
    matchTime: "Sept 12, 7:30 PM",
    markets: 5,
  },
  // Add more objects for more cards
];

export const sportypo = localFont({
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
  <div className="bg-zinc-950 text-white w-48 h-full rounded-2xl p-4 flex flex-col">
    {sportsCategories.map((category, index) => (
      <a key={index} href="#" className="hover:bg-gray-700 p-2 rounded-md my-1">
        {category}
      </a>
    ))}
  </div>
);

const Match = ({ setSelectedMatch }: { setSelectedMatch?: (match: string | null) => void }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <OpenMarketCard
        team1={{ name: "Las Vegas Raiders", logo: "/assets/LA.png", odds: "+130" }}
        team2={{ name: "New York Giants", logo: "/assets/kansas.png", odds: "-200" }}
        activeAmount={300}
        totalAmount={1000}
        setSelectedMatch={() => setSelectedMatch?.(null)}
      />
      <OpenMarketCard
        team1={{ name: "Las Vegas Raiders", logo: "/assets/LA.png", odds: "+130" }}
        team2={{ name: "New York Giants", logo: "/assets/kansas.png", odds: "-200" }}
        activeAmount={300}
        totalAmount={1000}
        setSelectedMatch={() => setSelectedMatch?.(null)}
      />
    </div>
  );
};
export const BetPage = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  return (
    <div>
      {selectedMatch ? <Match setSelectedMatch={setSelectedMatch} /> : <BetList setSelectedMatch={setSelectedMatch} />}
    </div>
  );
};
const BetList = ({ setSelectedMatch }: { setSelectedMatch?: (match: string | null) => void }) => (
  <div className="justify-center items-center my-4 space-x-2 grid grid-cols-2 gap-4">
    {mockData.map(
      (data, index) => {
        console.log("BetList data not EventListItem", setSelectedMatch, index, data);
        return <>check log</>;
      },
      // <EventListItem key={index} setSelectedMatch={setSelectedMatch} data={data} />
    )}
  </div>
);
export const WeekList = () => (
  <div className="flex justify-center items-center my-4 space-x-2">
    {/* Iterate over an array of weeks. This is just an example, you can replace it with your actual weeks data. */}
    {["All", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"].map((week, index) => (
      <button
        key={index}
        className={`px-4 py-2 rounded-full ${
          week === "All" ? "text-gray-900 bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gray-900 text-gray-100"
        } hover:bg-gradient-to-r from-emerald-400 to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
      >
        {week}
      </button>
    ))}
  </div>
);
export const WalletConnect = () => (
  <div className="bg-red-900 text-white w-48 h-44 rounded-2xl p-4 flex flex-col justify-between">
    <div className="font-semibold">Wallet</div>
    <div className="text-sm">Address: 0xa5...92cc</div>
    <button className="bg-green-500 px-4 py-2 rounded-full">Connect Wallet</button>
  </div>
);
export const CustomHeader = () => (
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
const Featured = () => (
  <div className="flex justify-center items-center my-4 space-x-2">
    <img src="/assets/rectangle-green.png" className="w-full" alt="Featured content" />
  </div>
);

const TestPage: NextPage<{ events: any }> = ({ events }) => (
  <div className="min-h-screen bg-zinc-950 text-white">
    {/* Header Component - Uncomment if you have the component */}
    {/* <Header /> */}
    <Header />

    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
      {/* Sidebar: SportsList */}
      <div className="w-full md:w-1/6 xl:w-1/5 p-4">
        <SportsList />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-0 max-w-3xl">
        <Featured />
        <WeekPage weekNumber={14} events={events} />
        {/* <BetPage /> */}
      </div>

      {/* Right sidebar: WalletConnect */}
      <div className="w-full md:w-1/4 xl:w-1/5 p-4">
        <MyBetsTabs />
      </div>
    </div>
  </div>
);

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  params = { ...params, weeknum: "14" };
  if (!params?.weeknum) {
    throw new Error("Missing week number");
  }
  const weekNumber = parseInt(typeof params?.weeknum == "object" ? params.weeknum[0] : params?.weeknum);
  const weds = getFirstDayOfWeek(weekNumber);
  // console.log('weds', weds);
  const nextWeds = getFirstDayOfWeek(weekNumber + 1);
  const mockWeek14 = 0;
  let events: DeployedEvent[] = [];
  if (weekNumber === 14 && mockWeek14) {
    events = JSON.parse(
      '[{"id":38,"eventId":"401547578","displayName":"Week14 401547578 vs Test 0x1C9C66114a0147387a0E6Cd0a7b4641cF897b238","eventDate":"Date:2023-12-08T01:15:00.000Z","startdate":"Date:2023-12-08T01:15:00.000Z","address":"0x1C9C66114a0147387a0E6Cd0a7b4641cF897b238","salt":"0xd5e2bdb167825edcd787e8c903cd1b5ad7b2731a59dedd72d39e4e21ffc3b3a0"},{"id":39,"eventId":"401547579","displayName":"Week14 401547579 vs Test 0x043ED62D3b7c6b87F716c268F99eFeD6af80A749","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0x043ED62D3b7c6b87F716c268F99eFeD6af80A749","salt":"0xdd9b3ff39bdbbbe2da58eef29f2075adc7fc3edaf6900c578ae052c96215a90c"},{"id":40,"eventId":"401547586","displayName":"Week14 401547586 vs Test 0xADFA39A26e8769c7AF5ec96AfB5ae79891402044","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0xADFA39A26e8769c7AF5ec96AfB5ae79891402044","salt":"0x5148e4a08d554e37ab575dc8a44755750f6d956ed3c2df01a2de2f4a9a5d0740"},{"id":41,"eventId":"401547580","displayName":"Week14 401547580 vs Test 0xb9392b5422DDaD6CdEeCB7DaCE2A42335683ee8A","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0xb9392b5422DDaD6CdEeCB7DaCE2A42335683ee8A","salt":"0xb41808d302aeae5a2410ef8622aa6ba845fad5c458bb80dc0fcb5adc621dff1b"},{"id":42,"eventId":"401547581","displayName":"Week14 401547581 vs Test 0x2A88eDA00234Ae4E72fCA8e2aA0F458770720AeF","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0x2A88eDA00234Ae4E72fCA8e2aA0F458770720AeF","salt":"0x7f270268a4a46f74d2cca35d1e7ee7da9100115cc767b02c82ac3527d487a48a"},{"id":43,"eventId":"401547587","displayName":"Week14 401547587 vs Test 0x4dcdE3E2dcd43C8051b35868BB14407BEBfFA2d1","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0x4dcdE3E2dcd43C8051b35868BB14407BEBfFA2d1","salt":"0xe26d5794bd2a0610b4526d7be8763d77a3749532ae5933d00d23af9ad80e46d4"},{"id":44,"eventId":"401547582","displayName":"Week14 401547582 vs Test 0xDE1f8a8E6fBB030D87e563D05ED2611Ed24AbD60","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0xDE1f8a8E6fBB030D87e563D05ED2611Ed24AbD60","salt":"0x5f4a1e2d2d96bc0856c7b81282005dec0fd9780514ae71fb4b1571aaa5ea0576"},{"id":45,"eventId":"401547585","displayName":"Week14 401547585 vs Test 0x83dd905A5559d620A5eDC58E06B5bBdC4B565276","eventDate":"Date:2023-12-10T18:00:00.000Z","startdate":"Date:2023-12-10T18:00:00.000Z","address":"0x83dd905A5559d620A5eDC58E06B5bBdC4B565276","salt":"0xd66fdb6b970f25ef59783a3e9baca7e98c1e534438164b2a13aa48ac6e5b5b43"},{"id":46,"eventId":"401547588","displayName":"Week14 401547588 vs Test 0x09F6f419C80a4043c6ff3e9B04B97214276f2805","eventDate":"Date:2023-12-10T21:05:00.000Z","startdate":"Date:2023-12-10T21:05:00.000Z","address":"0x09F6f419C80a4043c6ff3e9B04B97214276f2805","salt":"0x0db2725f48918977ff2a41be13114cdc1787163bb14b7433e1e35685d46f926e"},{"id":47,"eventId":"401547589","displayName":"Week14 401547589 vs Test 0xf40b7959ECAf537eD634100Dc5138E1bD60A7068","eventDate":"Date:2023-12-10T21:05:00.000Z","startdate":"Date:2023-12-10T21:05:00.000Z","address":"0xf40b7959ECAf537eD634100Dc5138E1bD60A7068","salt":"0xc73f345fb54465e98c25621543d89701675807731ca62f2ab05062832e7a803e"},{"id":48,"eventId":"401547583","displayName":"Week14 401547583 vs Test 0x50DeD4db15d56b3532Cc45Ec07cfBaE112019642","eventDate":"Date:2023-12-10T21:25:00.000Z","startdate":"Date:2023-12-10T21:25:00.000Z","address":"0x50DeD4db15d56b3532Cc45Ec07cfBaE112019642","salt":"0x63677b00f8c853f87a12e74fdf67455490a5912c599095dc051697492c6056aa"},{"id":49,"eventId":"401547584","displayName":"Week14 401547584 vs Test 0xD9847c91F755f932761D5766d6125788D308C793","eventDate":"Date:2023-12-10T21:25:00.000Z","startdate":"Date:2023-12-10T21:25:00.000Z","address":"0xD9847c91F755f932761D5766d6125788D308C793","salt":"0x179ec201a138507f55915c9b921a4ab0bec085353dc266a7096fd805b7912493"},{"id":50,"eventId":"401547590","displayName":"Week14 401547590 vs Test 0x1cAf342399dE5F456C287b254Eb0C46Bfd3b6DAC","eventDate":"Date:2023-12-11T01:20:00.000Z","startdate":"Date:2023-12-11T01:20:00.000Z","address":"0x1cAf342399dE5F456C287b254Eb0C46Bfd3b6DAC","salt":"0x93da4efa5f1e7c1144e954c21ce8cb53cc22bef4b5f76a335cf7d05e6ae596f5"},{"id":51,"eventId":"401547592","displayName":"Week14 401547592 vs Test 0xc38C55Ac13edC0adebAB5395e86351CA14C2af1D","eventDate":"Date:2023-12-12T01:15:00.000Z","startdate":"Date:2023-12-12T01:15:00.000Z","address":"0xc38C55Ac13edC0adebAB5395e86351CA14C2af1D","salt":"0xca430e8ad0a30e06f0a9afaca0866326c4e8910e08d9e977e30f32748b514f0e"},{"id":52,"eventId":"401547591","displayName":"Week14 401547591 vs Test 0x5A309B9f24fcC965DEE5472caAD789292E99a5B5","eventDate":"Date:2023-12-12T01:15:00.000Z","startdate":"Date:2023-12-12T01:15:00.000Z","address":"0x5A309B9f24fcC965DEE5472caAD789292E99a5B5","salt":"0x83f2ca234611f5e4aa98af65e109ef969909eea8798e73414ea640a4660356a7"}]',
      customDeserializer,
    );
  } else {
    events = await prisma.deployedEvent.findMany({
      where: {
        eventDate: {
          gte: weds,
          lt: nextWeds,
        },
      },
    });
    if (0) console.log("events", JSON.stringify(events, customSerializer));
  }

  // XXX prisma can't join
  const signatureCounts = await prisma.makerSignature.groupBy({
    by: ["spender"],
    _count: true,

    where: {
      eventDate: {
        gte: weds,
        lt: nextWeds,
      },
    },
  });
  // console.log('signatures', signatureCounts);

  const formattedEvents = events.map(event => ({
    ...event,
    eventDate: event.eventDate.toString(),
    startdate: event.startdate.toString(),
    count: signatureCounts.find(count => count.spender === event.address)?._count || 0,
  }));

  return {
    props: {
      weekNumber,
      events: formattedEvents,
      // fake 5 e of data
      // events: formattedEvents.length > 0 ? Array(5).fill(formattedEvents[0]) : [],
    },
  };
};
export default TestPage;
