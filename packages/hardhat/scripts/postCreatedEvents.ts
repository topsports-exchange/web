import axios from "axios";
import * as fs from "fs";
import * as path from "path";

type TeamInfo = {
  id: number;
  name: string;
  homeAway: "home" | "away";
  logo: string;
  moneylines: number[];
};

interface Event {
  address: string;
  week: number;
  startdate: number;
  salt: string;
  id: string;
  name: string;
  venue: {
    name: string;
    city: string;
  };
  teams: [
    TeamInfo,
    TeamInfo,
    // {
    //   name: string;
    //   id: string;
    //   homeAway: string;
    //   logo: string;
    //   moneylines: number[];
    // },
    // {
    //   name: string;
    //   id: string;
    //   homeAway: string;
    //   logo: string;
    //   moneylines: number[];
    // }
  ];
}

const eventsFilePath = path.join(__dirname, "createEvents.json");

async function postEventToApi(event: Event) {
  const apiUrl = "http://localhost:3000/api/createDeployedEvent";
  try {
    const response = await axios.post(apiUrl, {
      eventId: event.id,
      displayName: event.name,
      startdate: event.startdate.toString(),
      address: event.address,
      eventDate: new Date(event.startdate * 1000).toISOString(),
      venue: JSON.stringify(event.venue),
      homeTeam: JSON.stringify(event.teams.find(team => team.homeAway === "home")),
      awayTeam: JSON.stringify(event.teams.find(team => team.homeAway === "away")),
    });

    console.log("API Response:", response.data);
  } catch (error) {
    console.error("Error posting to API:", (error as any).response?.data?.error || (error as any).message);
  }
}

async function postEventsToApi(events: Event[]) {
  for (const event of events) {
    await postEventToApi(event);
  }
}

async function main() {
  try {
    const eventsContent = fs.readFileSync(eventsFilePath, "utf-8");
    const events: Event[] = JSON.parse(eventsContent).events;
    // console.log("events:", events);

    await postEventsToApi(events);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
