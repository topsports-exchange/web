// import { parseUnits } from "ethers/lib/utils";
import { postToApi, signEIP712Message } from "../scripts/makerSignature";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from "fs";
import hre from "hardhat";

const configFile = "./scripts/mkrcfg.json";

interface ConfigObject {
  eventsFilePath: string;
  accountIndex: number;
  stakeTokenAddress: string;
  limit: number;
  goodForSeconds: number;
  refreshInterval: number;
}

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

function readConfigFile(): ConfigObject | null {
  try {
    const configData = fs.readFileSync(configFile, "utf-8");
    return JSON.parse(configData);
  } catch (error: any) {
    console.error(`Error reading or parsing ${configFile}: ${error.message}`);
    return null;
  }
}

function readEventsFile(config: ConfigObject): Event[] | null {
  try {
    const eventsData = fs.readFileSync(config.eventsFilePath, "utf-8");
    return JSON.parse(eventsData).events as Event[];
  } catch (error: any) {
    console.error(`Error reading or parsing events file: ${error.message}`);
    return null;
  }
}

// const eventsFilePath = path.join(__dirname, "createEvents.json");

function saltMaker(_token: string, _owner: string): string {
  const salt = hre.ethers.utils.solidityKeccak256(["address", "address"], [_token, _owner]);
  return salt;
}

async function saltTokenOwner(_token: string, _owner: string): Promise<string> {
  if (_token === "") {
    const USDCoin = await hre.ethers.getContract("USDCoin");
    return saltMaker(USDCoin.address, _owner);
  } else {
    return saltMaker(_token, _owner);
  }
}

async function main() {
  const config = readConfigFile();
  if (!config) {
    return;
  }
  console.log("config", config);
  const events = readEventsFile(config);
  if (!events) {
    return;
  }

  const signer: SignerWithAddress = (await hre.ethers.getSigners())[config.accountIndex];
  const salt = await saltTokenOwner(config.stakeTokenAddress, signer.address);
  const TopsportsMakerFactory = await hre.ethers.getContract("TopsportsMakerFactory");
  const makerContractAddr = (await TopsportsMakerFactory.predictAddress(salt)) as string;
  const TopsportsMakerCore = await hre.ethers.getContractAt("TopsportsMakerCore", makerContractAddr);

  const run = async () => {
    for (const event of events) {
      const i = 0;
      const home = event.teams.find(team => team.homeAway === "home");
      const away = event.teams.find(team => team.homeAway === "away");
      if (!(home && away)) {
        throw new Error("No home or away team found");
      }

      const homeTeamOdds = home.moneylines[i];
      const awayTeamOdds = away.moneylines[i];
      if (!(homeTeamOdds && awayTeamOdds)) {
        console.log("SKIP: No home or away team odds found for event " + event.name);
        continue;
      }
      const nonce = await TopsportsMakerCore.nonces(event.address);

      const data = {
        maker: makerContractAddr,
        spender: event.address,
        homeTeamOdds,
        awayTeamOdds,
        limit: config.limit,
        nonce: nonce.toNumber(),
        deadline: Math.floor(Date.now() / 1000) + config.goodForSeconds,
      };
      console.table(data);

      const signature = await signEIP712Message(signer, data, makerContractAddr);
      // console.log("Generated Signature:", signature);

      const eventDate = new Date(event.startdate * 1000).toJSON();

      await postToApi({ signature, eventDate, ...data });
    }
  };

  setTimeout(run, 0);
  const t = setInterval(run, config.refreshInterval * 1000);
  console.log("running", t);
}

main();
process.stdin.resume(); // so the program will not close instantly
