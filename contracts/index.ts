import { USDC_CONTRACT, USERSTORAGE_CONTRACT } from "./address";
import USERSTORAGE_ABI from "./userStorageAbi.json";
import USDC_ABI from "./usdcAbi.json";

export const userStorageContractConfig = {
  address: USERSTORAGE_CONTRACT as `0x${string}`,
  abi: USERSTORAGE_ABI,
};

export const usdcContractConfig = {
  address: USDC_CONTRACT as `0x${string}`,
  abi: USDC_ABI,
};
