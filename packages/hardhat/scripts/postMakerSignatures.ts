// import { parseUnits } from "ethers/lib/utils";
import { postToApi, signEIP712Message } from "../scripts/makerSignature";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

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

function saltMaker(_token: string, _owner: string): string {
  const salt = hre.ethers.utils.solidityKeccak256(["address", "address"], [_token, _owner]);
  return salt;
}

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const [account1, account2]: SignerWithAddress[] = await hre.ethers.getSigners();
  try {
    const eventsContent = fs.readFileSync(eventsFilePath, "utf-8");
    const events: Event[] = JSON.parse(eventsContent).events;

    const TopsportsMakerFactory = await hre.ethers.getContract("TopsportsMakerFactory", deployer);
    const USDCoin = await hre.ethers.getContract("USDCoin", deployer);
    const salt = saltMaker(USDCoin.address, account1.address);
    const factoryContract = TopsportsMakerFactory;
    const contractAddr = await factoryContract.predictAddress(salt);

    // const eventId = 401548411; // https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard/401548411
    // // "date":"2023-08-12T17:00Z","name":"Tennessee Titans at Chicago Bears","shortName":"TEN @ CHI"
    // const name = "Tennessee Titans at Chicago Bears";
    // const evSalt = saltEvent(eventId, name);
    // const evContractAddr = await TopsportsEventFactory.predictAddress(evSalt);
    for (const event of events) {
      for (let i = 0; i < 2; i++) {
        const home = event.teams.find(team => team.homeAway === "home");
        const away = event.teams.find(team => team.homeAway === "away");
        if (!(home && away)) {
          throw new Error("No home or away team found");
        }

        // const maker = "0x53EA15882246211fd4CCbe1C52A487437575A9f9"; // TODO
        const maker = contractAddr as string;
        // const homeTeamOdds = 100;
        const homeTeamOdds = home.moneylines[i];
        // const awayTeamOdds = -200;
        const awayTeamOdds = away.moneylines[i];
        if (!(homeTeamOdds && awayTeamOdds)) {
          // throw new Error("No home or away team odds found for event " + event.name);
          console.log("SKIP: No home or away team odds found for event " + event.name);
          continue;
        }
        const TopsportsMakerCore = await hre.ethers.getContractAt("TopsportsMakerCore", maker, account2);
        const nonce = await TopsportsMakerCore.nonces(event.address);

        const data = {
          maker,
          spender: event.address,
          homeTeamOdds,
          awayTeamOdds,
          limit: 1234567890,
          nonce: nonce.toNumber(),
          deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
        };
        console.log("Generated Data:", data);

        const signature = await signEIP712Message(account1, data, maker);
        console.log("Generated Signature:", signature);

        const eventDate = new Date(event.startdate * 1000).toJSON();

        if (false) {
          await postToApi({ signature, eventDate, ...data });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
