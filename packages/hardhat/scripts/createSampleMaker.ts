import { parseUnits } from "ethers/lib/utils";
import { postToApi, signEIP712Message } from "../scripts/makerSignature";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from "fs";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";

function saltMaker(_token: string, _owner: string): string {
  const salt = hre.ethers.utils.solidityKeccak256(["address", "address"], [_token, _owner]);
  return salt;
}
function saltEvent(eventId: number, displayName: string): string {
  const hash = hre.ethers.utils.solidityKeccak256(["uint256", "string"], [eventId, displayName]);
  return hash;
}

/**
 * Deploys a contract named "TopsportsMakerFactory" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
export const main = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const [account1]: SignerWithAddress[] = await hre.ethers.getSigners();

  // Get the deployed contract
  const TopsportsMakerFactory = await hre.ethers.getContract("TopsportsMakerFactory", deployer);

  const USDCoin = await hre.ethers.getContract("USDCoin", deployer);

  // adapted tasks/create.ts 'create-event' task
  const MakerFactory = await hre.ethers.getContractFactory("TopsportsMakerCore");
  const fragment = MakerFactory.interface.getFunction("initialize");
  if (!fragment) throw new Error("initialize function not found in interface");
  const initializeData = MakerFactory.interface.encodeFunctionData(fragment, [USDCoin.address, account1.address]);
  const salt = saltMaker(USDCoin.address, account1.address);
  const factoryContract = TopsportsMakerFactory;

  const contractAddr = await factoryContract.predictAddress(salt);
  console.log(`Maker Instance address:\t${contractAddr}`);
  console.log(`USDC Balance before minting: ${hre.ethers.utils.formatUnits(await USDCoin.balanceOf(contractAddr), 6)}`);

  if (true) {
    const tx = await factoryContract.createInstance(salt, initializeData);
    console.log(`  [createInstance] tx-hash:${tx.hash} tx-type:${tx.type}`);
    await tx.wait();

    fs.writeFileSync("./scripts/makerAddress.ts", `export const address = '${contractAddr}';`, { encoding: "utf-8" });

    await (await USDCoin.mint(contractAddr, parseUnits("10000.0", 6))).wait();
    console.log(`Balance after minting: ${hre.ethers.utils.formatUnits(await USDCoin.balanceOf(contractAddr), 6)}`);
  }

  if (true) {
    const TopsportsEventFactory = await hre.ethers.getContract("TopsportsEventFactory", deployer);
    const eventId = 401548411; // https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard/401548411
    // "date":"2023-08-12T17:00Z","name":"Tennessee Titans at Chicago Bears","shortName":"TEN @ CHI"
    const name = "Tennessee Titans at Chicago Bears";
    const evSalt = saltEvent(eventId, name);
    const evContractAddr = await TopsportsEventFactory.predictAddress(evSalt);
    console.log(`Event address:\t${evContractAddr}`);
    //  await wallet._signTypedData(structuredData.domain, structuredData.types, data);

    const TopsportsMakerCore = await hre.ethers.getContractAt("TopsportsMakerCore", contractAddr, account1);
    // makerContract.nonces(spender))
    const nonce = await TopsportsMakerCore.nonces(evContractAddr);

    const data = {
      maker: contractAddr,
      spender: evContractAddr,
      homeTeamOdds: 100,
      awayTeamOdds: -200,
      limit: 789,
      // nonce: 1, // TODO fetch from contract
      nonce: nonce.toNumber(),
      // deadline: 1701421164,
      deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    };
    console.log("Generated Data:", data);
    const signature = await signEIP712Message(account1, data, contractAddr);
    console.log("Generated Signature:", signature);

    // event possibly not deployed yet or saved in db
    const eventDate = "2023-08-12T00:00:00Z"; // TODO from espn

    await postToApi({ signature, eventDate, ...data });
  }
};

require.main === module &&
  main(hre).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });

export default main;
