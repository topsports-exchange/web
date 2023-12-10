import { DeployedEvent, MakerSignature } from "@prisma/client";

export interface BetItemCardProps {
  id: string;
  team1Logo: string;
  team1Name: string;
  team2Logo: string;
  team2Name: string;
  matchTime: string;
  markets: number;
  isLive?: boolean;
}

export interface MakerSignatureNormalized extends Omit<MakerSignature, "eventDate" | "deadlineNormalized"> {
  deadlineNormalized: string;
  eventDate: string;
}
export interface DeployedEventNormalized extends Omit<DeployedEvent, "eventDate" | "startdate"> {
  eventDate: Date | string;
  startdate: Date | string;
}

export interface Venue {
  name: string;
  city: string;
}
export interface Team {
  name: string;
  id: string;
  homeAway: string;
  logo: string;
  moneylines: number[];
}

// o/r eventDate, deadline
export interface EventPageProps {
  event: DeployedEventNormalized | null;
  makerSignatures: MakerSignatureNormalized[] | null;
}

export interface TakeSigProps {
  accountAddress: string;
  event: DeployedEventNormalized;
  tokenAddress: `0x${string}`;
  makerSignature: MakerSignatureNormalized;
}

export interface Competitor {
  homeAway: string;
  team: {
    name: string;
  };
}

export interface EventDisplayDetails {
  name: string;
  shortName: string;
  fullName: string;
  venue: {
    fullName: string | undefined;
    city: string | undefined;
  };
  homeTeamName: string | undefined;
  awayTeamName: string | undefined;
  status: {
    name: string | undefined;
    completed: boolean | undefined;
    period: number | undefined;
  };
}

export enum EventWinner {
  UNDEFINED,
  HOME_TEAM,
  AWAY_TEAM,
}

export interface Bet {
  taker: string;
  stake: bigint;
  profit: bigint;
  winner: EventWinner;
}
export interface Market {
  address: string;
  maker: string;
  homeTeamOdds: bigint;
  awayTeamOdds: bigint;
  limit: bigint;
  deadline: bigint;
  bets: Bet[];
}
export interface Wager {
  totalWagered: bigint;
  totalHomePayout: bigint;
  totalAwayPayout: bigint;
}
export type WagerArray = readonly [bigint, bigint, bigint];
export interface BetInfo {
  eventId: bigint;
  eventContract: string;
  startdate: bigint;
  marketId: bigint;
  betId: bigint;
}
export interface BetStatusProps {
  choice: EventWinner;
  eventDate: Date;
  winner: EventWinner;
  wager: Wager;
}
export type BetInfoArray = readonly [bigint, string, bigint, bigint, bigint];
// interface Venue {
//   name: string;
//   city: string;
// }
export interface Team {
  name: string;
  id: string;
  homeAway: string;
  logo: string;
  moneylines: number[];
}
