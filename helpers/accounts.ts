import { ethers } from "ethers";

export const getConnectedAccount = async () => {
  const accounts = await window.ethereum.request<string[]>({
    method: "eth_accounts",
  });
  if (accounts) {
    const account = accounts[0];
    if (account) return account;
  }
  return "";
};

export const isMetaMaskInstalled = () => {
  return Boolean(
    typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask
  );
};

export const sliceAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatAddress = (address: string) =>
  ethers.utils.getAddress(address);

export const addressScannerURL = (address: string) =>
  `https://sepolia.etherscan.io/address/${address}`;

export const txScannerURL = (txHash: string) =>
  `https://sepolia.etherscan.io/tx/${txHash}`;
