import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

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
  const { deploy } = hre.deployments;

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
  const MockEuroe = await hre.ethers.getContract("MockEuroe", deployer);

  // adapted tasks/create.ts 'create-event' task
  const eventFactory = await hre.ethers.getContractFactory("TopsportsEventCore");
  const fragment = eventFactory.interface.getFunction("initialize");
  if (!fragment) throw new Error("initialize function not found in interface");
  const eventId = 401548411; // https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard/401548411
  // const AVALANCHE_FUJI_EUROE_ADDR = '0xA089a21902914C3f3325dBE2334E9B466071E5f1';
  const initializeData = eventFactory.interface.encodeFunctionData(fragment, [
    eventId,
    0,
    MockEuroe.address,
    TopsportsFunctionsConsumer.address,
  ]);
  // "date":"2023-08-12T17:00Z","name":"Tennessee Titans at Chicago Bears","shortName":"TEN @ CHI"
  const name = "Tennessee Titans at Chicago Bears";
  const salt = saltEvent(eventId, name);
  const factoryContract = TopsportsEventFactory;
  // const factoryContract = await hre.ethers.getContractAt(
  //   'TopsportsEventFactory',
  //   args.factory,
  //   signer
  // );
  const contractAddr = await factoryContract.predictAddress(salt);
  console.log(`Instance address:\t${contractAddr}`);

  const tx = await factoryContract.createInstance(salt, initializeData);
  console.log(`  [createInstance] tx-hash:${tx.hash} tx-type:${tx.type}`);
};

export default deployTopsportsEventFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags TopsportsEventFactory
deployTopsportsEventFactory.tags = ["TopsportsEventFactory"];
