import { ethers } from "ethers";

export const decimalToBigNumber = (value: number, decimals: number) => {
  return ethers.BigNumber.from((value * Math.pow(10, decimals)).toString());
};

export const bigNumberToDecimal = (
  bigNumber: ethers.BigNumber,
  decimals: number,
) => {
  return bigNumber ? Number(bigNumber.toString()) / Math.pow(10, decimals) : 0;
};
