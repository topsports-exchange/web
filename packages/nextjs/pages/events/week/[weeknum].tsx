// pages/events/week/[weeknum].tsx
import Link from "next/link";
import { DeployedEvent, PrismaClient } from "@prisma/client";
import {
  Card,
  StyledBody, // StyledAction
} from "baseui/card";
import { GetServerSideProps } from "next";

interface DeployedEventNormalized extends Omit<DeployedEvent, "eventDate" | "deadline"> {
  eventDate: string;
  deadline: string;
  count: number;
}

interface WeekProps {
  weekNumber: number;
  events: DeployedEventNormalized[];
}

const prisma = new PrismaClient();

// The season is planned to be played over an 18-week schedule beginning on September 7. Each of the league's 32 teams plays 17 games, with one bye week for each team. The regular season is scheduled to end on January 7, 2024
// https://en.wikipedia.org/wiki/2023_NFL_season
// const startDate = new Date('2023-09-06'); // Week 1 starts on September 6, 2023
const seasonStart = "2023-08-11"; // Week 1 starts on September 6, 2023

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
  const thisWeek = weekNumber;
  const weeks = Array(5)
    .fill(null)
    .map((_, i) => i + thisWeek);
  return (
    <div>
      <div>
        {weeks.map((week, index) => (
          <Link
            key={index}
            href={`/events/week/${week}`}
            style={{ marginRight: "10px", fontWeight: week === weekNumber ? "bold" : "normal" }}
          >
            Week {week}
          </Link>
        ))}
      </div>
      {events.map((event, idx) => (
        <Card key={idx}>
          <StyledBody>
            <p>{event.displayName}</p>
            <p>{event.eventDate}</p>
            <p>Count of Markets: {event.count}</p>
          </StyledBody>
        </Card>
      ))}
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
  const events = await prisma.deployedEvent.findMany({
    where: {
      eventDate: {
        gte: weds,
        lt: nextWeds,
      },
    },
  });
  // console.log('events', events);

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
    deadline: event.deadline.toString(),
    count: signatureCounts.find(count => count.spender === event.address)?._count || 0,
  }));

  return {
    props: {
      weekNumber,
      // events: formattedEvents,
      // fake 5 e of data
      events: Array(5).fill(formattedEvents[0]),
    },
  };
};

export default WeekPage;
