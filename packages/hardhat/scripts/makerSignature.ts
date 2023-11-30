import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import axios from "axios";

export async function signEIP712Message(
  wallet: SignerWithAddress,
  data: any,
  verifyingContract: string,
): Promise<string> {
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
        { name: "homeTeamOdds", type: "int64" },
        { name: "awayTeamOdds", type: "int64" },
        { name: "limit", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint64" },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: "topsports.exchange",
      version: "1",
      // chainId: 1,
      chainId: await wallet.getChainId(),
      verifyingContract,
    },
    message: data,
  };

  return await wallet._signTypedData(structuredData.domain, structuredData.types, data);
}

export async function postToApi(payload: { signature: string; [key: string]: number | string }): Promise<void> {
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
