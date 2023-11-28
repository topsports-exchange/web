import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers/lib/utils";

/**
 * Deploys a contract named "TopsportsMakerFactory" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTopsportsMakerFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  function saltMaker(_token: string, _owner: string): string {
    const salt = hre.ethers.utils.solidityKeccak256(["address", "address"], [_token, _owner]);
    return salt;
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
  const [account1] = await hre.ethers.getSigners();
  const { deploy, get } = hre.deployments;

  if (await get("TopsportsMakerFactory")) {
    console.log("TopsportsMakerFactory contract already deployed, skipping...");
    return;
  }

  await deploy("TopsportsMakerFactory", {
    from: deployer,
    // Contract constructor arguments
    // args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const TopsportsMakerFactory = await hre.ethers.getContract("TopsportsMakerFactory", deployer);

  const MockEuroe = await hre.ethers.getContract("MockEuroe", deployer);

  // adapted tasks/create.ts 'create-event' task
  const MakerFactory = await hre.ethers.getContractFactory("TopsportsMakerCore");
  const fragment = MakerFactory.interface.getFunction("initialize");
  if (!fragment) throw new Error("initialize function not found in interface");
  const initializeData = MakerFactory.interface.encodeFunctionData(fragment, [MockEuroe.address, account1.address]);
  const salt = saltMaker(MockEuroe.address, account1.address);
  const factoryContract = TopsportsMakerFactory;

  const contractAddr = await factoryContract.predictAddress(salt);
  console.log(`Instance address:\t${contractAddr}`);

  const tx = await factoryContract.createInstance(salt, initializeData);
  console.log(`  [createInstance] tx-hash:${tx.hash} tx-type:${tx.type}`);

  await MockEuroe.mint(contractAddr, parseUnits("10000.0", 6));
  console.log(`Balance after minting: ${hre.ethers.utils.formatUnits(await MockEuroe.balanceOf(contractAddr), 6)}`);
};

export default deployTopsportsMakerFactory;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags TopsportsMakerFactory
deployTopsportsMakerFactory.tags = ["TopsportsMakerFactory"];
