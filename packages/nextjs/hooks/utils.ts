import { BetInfo, BetInfoArray, BetStatusProps, EventWinner, Wager, WagerArray } from "~~/interfaces/interfaces";

export const t24hours = 3600 * 24 * 1000;
// const t24hours = 3600 * 1 * 1000;
export const wontResolve = (p: BetStatusProps) => {
  return new Date().valueOf() >= p.eventDate.valueOf() + t24hours && p.winner === EventWinner.UNDEFINED;
};
export const isPending = (p: BetStatusProps) => {
  return new Date().valueOf() < p.eventDate.valueOf() + t24hours && p.winner === EventWinner.UNDEFINED;
};
export const didResolve = (p: BetStatusProps) => {
  return p.winner !== EventWinner.UNDEFINED;
};
export const youWon = (p: BetStatusProps) => {
  return p.winner === p.choice;
};
export const canClaimAmount = (p: BetStatusProps) => {
  if (!p.wager) {
    debugger;
  }
  if (wontResolve(p) && p.wager.totalWagered > 0n) {
    return p.wager.totalWagered;
  }
  if (didResolve(p) && youWon(p)) {
    if (p.choice === EventWinner.HOME_TEAM) {
      // or 0n, already claimed
      return p.choice === EventWinner.HOME_TEAM ? p.wager.totalHomePayout : p.wager.totalAwayPayout;
    }
  }
  return 0n;
};

export const toWager = ([totalWagered, totalHomePayout, totalAwayPayout]: WagerArray): Wager => ({
  totalWagered,
  totalHomePayout,
  totalAwayPayout,
});

export const toBetInfo = ([eventId, eventContract, startdate, marketId, betId]: BetInfoArray): BetInfo => ({
  eventId,
  eventContract,
  startdate,
  marketId,
  betId,
});
