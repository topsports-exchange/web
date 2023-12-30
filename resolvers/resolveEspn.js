const eventId = args[0];

const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${+eventId}`;

// eval(1 + 1);

const cryptoCompareRequest = Functions.makeHttpRequest({
  url: url,
  headers: {
    "Content-Type": "application/json",
  },
});

const cryptoCompareResponse = await cryptoCompareRequest;

let statusRefUrl =
  cryptoCompareResponse["data"]["competitions"][0]["status"]["$ref"];
statusRefUrl = statusRefUrl.replace("http", "https").replace(/\?.*/, "");

const statusRefRequest = Functions.makeHttpRequest({
  url: statusRefUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
const statusRefResponse = await statusRefRequest;

if (
  statusRefResponse.data.type.completed == true &&
  statusRefResponse.data.type.name == "STATUS_FINAL"
) {
  // team home won returns 1
  // team away won returns 2
  const competitors = [
    cryptoCompareResponse.data.competitions[0].competitors[0],
    cryptoCompareResponse.data.competitions[0].competitors[1],
  ];
  for (const competitor of competitors) {
    if (competitor.homeAway == "home" && competitor.winner == true)
      return Functions.encodeUint256(1);

    if (competitor.homeAway == "away" && competitor.winner == true)
      return Functions.encodeUint256(2);
  }
}

return Functions.encodeUint256(0);
