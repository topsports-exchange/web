import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// const router = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"; // Chainlink router address on Fuji
const router = "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C"; // Chainlink router address on Fuji
/**
 * Deploys a contract named "TopsportsFunctionsConsumer" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTopsportsFunctionsConsumer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

  await deploy("TopsportsFunctionsConsumer", {
    from: deployer,
    // Contract constructor arguments
    args: [router],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const TopsportsFunctionsConsumer = await hre.ethers.getContract("TopsportsFunctionsConsumer", deployer);
};

export default deployTopsportsFunctionsConsumer;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags TopsportsFunctionsConsumer
deployTopsportsFunctionsConsumer.tags = ["TopsportsFunctionsConsumer"];
