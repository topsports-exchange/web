import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";
import axios from "axios";

// const { eventId, displayName, deadline, address, eventDate } = req.body;
async function postToApi(payload: { [key: string]: string }): Promise<void> {
  const apiUrl = "http://localhost:3000/api/createDeployedEvent";
  try {
    const response = await axios.post(apiUrl, payload);
    // console.log("API Response:", response);
    console.log("API Response:", response.data);
  } catch (error) {
    console.error("Error posting to API:", (error as any).response.data.error);
  }
}

/**
 * Deploys a contract named "TopsportsEventFactory" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTopsportsEventFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  function saltEvent(eventId: number, displayName: string): string {
    const hash = hre.ethers.utils.solidityKeccak256(["uint256", "string"], [eventId, displayName]);
    return hash;
  }
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  try {
    if (await get("TopsportsEventFactory")) {
      console.log("TopsportsEventFactory contract already deployed, skipping...");
      return;
    }
  } catch (e) {}

  await deploy("TopsportsEventFactory", {
    from: deployer,
    // Contract constructor arguments
    // args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const TopsportsEventFactory = await hre.ethers.getContract("TopsportsEventFactory", deployer);

  const TopsportsFunctionsConsumer = await hre.ethers.getContract("TopsportsFunctionsConsumer", deployer);
  const USDCoin = await hre.ethers.getContract("USDCoin", deployer);

  // adapted tasks/create.ts 'create-event' task
  const eventFactory = await hre.ethers.getContractFactory("TopsportsEventCore");
  const fragment = eventFactory.interface.getFunction("initialize");
  if (!fragment) throw new Error("initialize function not found in interface");
  const eventId = 401548411; // https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard/401548411
  // const AVALANCHE_FUJI_EUROE_ADDR = '0xA089a21902914C3f3325dBE2334E9B466071E5f1';
  const source = "XXX TODO XXX";
  const startdate = Math.floor(new Date("2023-08-12T00:00:00Z").valueOf() / 1000); // TODO
  const initializeData = eventFactory.interface.encodeFunctionData(fragment, [
    eventId,
    startdate,
    USDCoin.address,
    TopsportsFunctionsConsumer.address,
    hre.ethers.utils.solidityKeccak256(["string"], [source]),
  ]);
  // "date":"2023-08-12T17:00Z","name":"Tennessee Titans at Chicago Bears","shortName":"TEN @ CHI"
  const displayName = "Tennessee Titans at Chicago Bears";
  const eventDate = "2023-08-12T00:00:00Z"; // TODO from espn
  const salt = saltEvent(eventId, displayName);
  const factoryContract = TopsportsEventFactory;
  // const factoryContract = await hre.ethers.getContractAt(
  //   'TopsportsEventFactory',
  //   args.factory,
  //   signer
  // );
  const contractAddr = await factoryContract.predictAddress(salt);
  console.log(`Instance address:\t${contractAddr}`);

  fs.writeFileSync("./scripts/eventAddress.ts", `export const address = '${contractAddr}';`, { encoding: "utf-8" });

  const tx = await factoryContract.createInstance(salt, initializeData);
  console.log(`  [createInstance] tx-hash:${tx.hash} tx-type:${tx.type}`);

  const resolveImmediately = false;
  if (resolveImmediately) {
    const AWAY_TEAM = 2n;
    const TopsportsEventCore = await hre.ethers.getContractAt("TopsportsEventCore", contractAddr, deployer);

    console.log("eventId", await TopsportsEventCore.eventId());
    await TopsportsEventCore.resolutionCallback(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      hre.ethers.utils.solidityPack(["int256"], [AWAY_TEAM]),
      "0x",
    );
    console.log("resolved winner", await TopsportsEventCore.winner());
    throw new Error("stop");
  }

  try {
    await postToApi({
      eventId: eventId.toString(),
      displayName,
      startdate: startdate.toString(),
      address: contractAddr,
      eventDate,
      venue: JSON.stringify({
        city: "Detroit",
        name: "Stadium",
      }),
      homeTeam: JSON.stringify({
        id: "23",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
        name: "Pittsburgh Steelers",
        homeAway: "home",
        moneylines: [-290, -267, -267, -230, -304, -275, -238, -270, -263, -275],
      }),
      awayTeam: JSON.stringify({
        id: "17",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
        name: "New England Patriots",
        homeAway: "away",
        moneylines: [240, 215, 215, 180, 208, 225, 190, 215, 220, 210],
      }),
    });
  } catch (e) {
    console.error("Error posting to API:", (e as any).response.data.error);
  }
};

export default deployTopsportsEventFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags TopsportsEventFactory
deployTopsportsEventFactory.tags = ["TopsportsEventFactory"];
