import { initializeProvider } from "@metamask/providers";
import { BigNumberish, ethers } from "ethers";

export type DepositIntent = {
  sender: string;
  tokenAddress: string;
  initiatorAddress: string;
  receiverId: string;
  amount: BigNumberish;
};

export type WithdrawalIntent = {
  tokenAddress: string;
  withdrawalAddress: string;
  initiatorAddress: string;
  amount: BigNumberish;
};

const DepositIntentAbiType: string = `tuple(
    address sender,
    address tokenAddress,
    address initiatorAddress,
    string receiverId,
    uint256 amount
  )`;

const WithdrawalIntentAbiType: string = `tuple(
    address tokenAddress,
    address withdrawalAddress,
    address initiatorAddress,
    uint256 amount
  )`;

export function computeDepositIntentHash(depositIntent: DepositIntent) {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode([DepositIntentAbiType], [depositIntent])
  );
}

export function computeWithdrawalIntentHash(
  withdrawalIntent: WithdrawalIntent
) {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      [WithdrawalIntentAbiType],
      [withdrawalIntent]
    )
  );
}
