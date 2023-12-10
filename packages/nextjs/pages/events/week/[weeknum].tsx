// pages/events/week/[weeknum].tsx
import { useRouter } from "next/router";
import { DeployedEvent, PrismaClient } from "@prisma/client";
import { withStyle } from "baseui";
import {
  // StyledHeadCell,
  StyledBodyCell,
} from "baseui/table-grid";
import { GetServerSideProps } from "next";
import { EventList } from "~~/components/EventList";
import { MyBetsTabs } from "~~/components/MyBetsTabs";
import { customDeserializer, customSerializer } from "~~/utils/serial";

interface DeployedEventNormalized extends Omit<DeployedEvent, "eventDate" | "startdate"> {
  eventDate: string;
  startdate: string;
  count: number;
}

interface WeekProps {
  weekNumber: number;
  events: DeployedEventNormalized[];
}

const prisma = new PrismaClient();

// The season is planned to be played over an 18-week schedule beginning on September 7. Each of the league's 32 teams plays 17 games, with one bye week for each team. The regular season is scheduled to end on January 7, 2024
// https://en.wikipedia.org/wiki/2023_NFL_season
const seasonStart = "2023-09-06"; // Week 1 starts on September 6, 2023
// const seasonStart = "2023-08-11"; // Week 1 starts on September 6, 2023

// 1st day of the NFL week based on the week number
export function getFirstDayOfWeek(weekNumber: number): Date {
  const startDate = new Date(seasonStart); // Week 1 starts on September 6, 2023
  const daysToAdd = (weekNumber - 1) * 7;
  startDate.setDate(startDate.getDate() + daysToAdd);
  return startDate;
}

// NFL week number based on a given date
export function getWeekNumberFromDate(date: Date): number {
  const startDate = new Date(seasonStart); // Week 1 starts on September 6, 2023
  const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  return weekNumber;
}

const WeekPage = ({ weekNumber, events }: WeekProps) => {
  // console.log('events', events);
  // const thisWeek = getWeekNumberFromDate(new Date());
  const router = useRouter();
  const thisWeek = weekNumber;
  const weeks = Array(6)
    .fill(null)
    .map((_, i) => -3 + i + thisWeek);
  const StyledEventBodyCell = withStyle(StyledBodyCell, {
    border: "1px solid black",
    margin: "10px",
  });

  const setSelectedMatch = (match: string | null) => {
    router.push(`/events/${match}`);
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
      {/* Sidebar: SportsList */}
      {/* <div className="w-full md:w-1/6 xl:w-1/5 p-4"><SportsList /></div> */}

      {/* Main content area */}
      <div className="flex-1 p-4 max-w-3xl">
        {/* <Featured /> */}
        {/* <WeekPage weekNumber={14} events={events} />
        <BetPage /> */}
        <EventList setSelectedMatch={setSelectedMatch} events={events} />
      </div>

      {/* Right sidebar: WalletConnect */}
      <div className="col-span-1">
        <MyBetsTabs />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
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

export default WeekPage;
