import { ExternalProvider } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";
import { throwError } from "./contractErrorHandling";
import { CONFIG_FRONT, CONFIG_SERVER } from "../config";
import { DSV_ABI } from "./digitalSecuritiesVaultABI";
import { TOKEN_ABI } from "./tokenABI";
import { DepositIntent, WithdrawalIntent } from "./types";

const expectedChainId = CONFIG_FRONT.CHAIN_ID;
const dsvContract = CONFIG_FRONT.DSV_CONTRACT;
const rpcURL = CONFIG_SERVER.RPC_URL;
console.log("RPC in contract", rpcURL);

export class TokenContract {
  tokenAddress: string;

  constructor(tokenAddress: string) {
    this.tokenAddress = tokenAddress;
  }

  async balanceOf(address: string) {
    return callMethod(
      "balanceOf",
      this.tokenAddress,
      TOKEN_ABI,
      getRPCProvider(),
      address
    );
  }

  async getTicker() {
    return callMethod("symbol", this.tokenAddress, TOKEN_ABI, getRPCProvider());
  }

  async approve(spender: string, amount: ethers.BigNumber) {
    return send(
      "approve",
      this.tokenAddress,
      TOKEN_ABI,
      getSigner(),
      spender,
      amount
    );
  }
}

const OPERATOR_ROLE = solidityKeccak256(["string"], ["OPERATOR"]);
const ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export class DSVContract {
  contractAddress: string;

  constructor(contractAddress: string = dsvContract) {
    this.contractAddress = contractAddress;
    console.log("Contract creation");
  }

  async isOperator(address: string) {
    return await callMethod(
      "hasRole",
      this.contractAddress,
      DSV_ABI,
      getRPCProvider(),
      OPERATOR_ROLE,
      address
    );
  }

  async grantOperator(address: string) {
    return await send(
      "grantRole",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      OPERATOR_ROLE,
      address
    );
  }

  async isAdmin(address: string) {
    return await callMethod(
      "hasRole",
      this.contractAddress,
      DSV_ABI,
      getRPCProvider(),
      ADMIN_ROLE,
      address
    );
  }

  async submitDepositIntent(depositIntent: DepositIntent) {
    return await send(
      "submitDepositIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      depositIntent
    );
  }

  async satisfyDepositIntent(depositIntent: DepositIntent) {
    return await send(
      "satisfyDepositIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      depositIntent
    );
  }

  async isDepositIntentActive(intentHash: string) {
    return await callMethod(
      "isDepositIntentActive",
      this.contractAddress,
      DSV_ABI,
      getRPCProvider(),
      intentHash
    );
  }

  async cancelDepositIntent(depositIntent: DepositIntent) {
    return await send(
      "cancelDepositIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      depositIntent
    );
  }

  async isWithdrawalIntentActive(intentHash: string) {
    return await callMethod(
      "isWithdrawalIntentActive",
      this.contractAddress,
      DSV_ABI,
      getRPCProvider(),
      intentHash
    );
  }

  async submitWithdrawalIntent(withdrawalIntent: WithdrawalIntent) {
    return await send(
      "submitWithdrawalIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      withdrawalIntent
    );
  }

  async confirmWithdrawalIntent(withdrawalIntent: WithdrawalIntent) {
    return await send(
      "confirmWithdrawalIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      withdrawalIntent
    );
  }

  async cancelWithdrawalIntent(withdrawalIntent: WithdrawalIntent) {
    return await send(
      "cancelWithdrawalIntent",
      this.contractAddress,
      DSV_ABI,
      getSigner(),
      withdrawalIntent
    );
  }
}

const getProviderFromWindow = () => {
  return new ethers.providers.Web3Provider(
    window.ethereum as unknown as ExternalProvider
  );
};

const getSigner = () => {
  const provider = getProviderFromWindow();
  return provider.getSigner();
};

const getRPCProvider = () => {
  return new ethers.providers.JsonRpcProvider(rpcURL);
};

export const checkConnectedChainId = async () => {
  const provider = getProviderFromWindow();
  const network = await provider.getNetwork();
  console.log("expected chain: ", expectedChainId, "got: ", network.chainId);
  return network.chainId === expectedChainId;
};

const callMethod = async (
  method: string,
  contractAddress: string,
  contractABI: {}[],
  provider: ethers.providers.JsonRpcProvider,
  ...args: any[]
) => {
  console.debug("Calling method: ", method, ", with args: ", args);
  console.debug("TEST");
  console.debug("RPC Prov: ", provider);
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const result = await contract.functions[method](...args);
    // this will work only for methods that have a single return value
    const actualResult = result[0];
    return actualResult;
  } catch (error) {
    console.debug("RPC Prov: ", provider);
    const msg = (error as Error).message;
    throwError(msg);
  }
};

const send = async (
  method: string,
  contractAddress: string,
  contractABI: {}[],
  signer: Signer,
  ...args: any[]
) => {
  console.debug("Calling method: ", method, ", with args: ", args);
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.functions[method](...args);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    const msg = (error as Error).message;
    throwError(msg);
  }
};
