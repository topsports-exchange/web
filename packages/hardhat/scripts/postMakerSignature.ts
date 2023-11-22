import { Wallet } from "ethers";
import axios from "axios";

// EIP-712 typed structured data signature - TopsportsMakerCore
// const PERMIT_TYPEHASH =
//   utils.keccak256(
//     utils.toUtf8Bytes(
//       'Permit(address spender,int256 homeTeamOdds,int256 awayTeamOdds,uint256 limit,uint256 nonce,uint256 deadline)'
//     )
//   );

// Function to generate a random private key
function generateRandomPrivateKey(): string {
  const wallet = Wallet.createRandom();
  return wallet.privateKey;
}

async function signEIP712Message(wallet: Wallet, data: any): Promise<string> {
  // const domainSeparator = utils.keccak256(
  //   utils.defaultAbiCoder.encode(
  //     ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
  //     [
  //       utils.keccak256(utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
  //       utils.keccak256(utils.toUtf8Bytes('topsports.exchange')),
  //       utils.keccak256(utils.toUtf8Bytes('1')), // version
  //       1, // chain ID TODO: replace with the actual chain ID
  //       wallet.address,
  //     ]
  //   )
  // );

  const structuredData = {
    types: {
      // EIP712Domain: [
      //   { name: 'name', type: 'string' },
      //   { name: 'version', type: 'string' },
      //   { name: 'chainId', type: 'uint256' },
      //   { name: 'verifyingContract', type: 'address' },
      // ] as utils.ParamType[],
      Permit: [
        { name: "spender", type: "address" },
        { name: "homeTeamOdds", type: "int256" },
        { name: "awayTeamOdds", type: "int256" },
        { name: "limit", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: "topsports.exchange",
      version: "1",
      chainId: 1,
      verifyingContract: wallet.address, // XXX: replace with the actual contract address
    },
    message: data,
  };

  return await wallet._signTypedData(structuredData.domain, structuredData.types, data);
}

async function postMakerSignature(payload: { signature: string; [key: string]: number | string }): Promise<void> {
  const apiUrl = "http://localhost:3000/api/createMakerSignature";
  const convertedPayload: { [key: string]: string } = {};

  // Convert "integers" (int256) to strings
  for (const key in payload) {
    if (typeof payload[key] === "number") {
      convertedPayload[key] = payload[key].toString();
    } else {
      convertedPayload[key] = payload[key] as string;
    }
  }

  const response = await axios.post(apiUrl, convertedPayload);
  console.log("API Response:", response.data);
}

async function main() {
  const privateKey = generateRandomPrivateKey();
  console.log("Generated Private Key:", privateKey);
  const wallet = new Wallet(privateKey);

  const data = {
    spender: wallet.address,
    homeTeamOdds: 123,
    awayTeamOdds: 456,
    limit: 789,
    nonce: 1,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  };

  const signature = await signEIP712Message(wallet, data);
  console.log("Generated Signature:", signature);

  await postMakerSignature({ signature, ...data });
}

main();
