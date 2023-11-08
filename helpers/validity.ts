import { BigNumber, ethers } from "ethers";

export const isAmountValid = (amount: string, currentBalance: BigNumber) => {
  const validShareRegEx = /^\d{1,3}(\.\d{0,6})?$/;
  return (
    validShareRegEx.test(amount) &&
    currentBalance.gt(0) &&
    ethers.utils.parseEther(amount).lte(currentBalance)
  );
};
