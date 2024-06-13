"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

import { userStorageContractConfig } from "@/contracts";
import { bigNumberToDecimal } from "@/lib/bigNumber";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [writeSuccess, setWriteSuccess] = useState(false);

  const { data: balance, refetch: refetchBalance } = useContractRead({
    ...userStorageContractConfig,
    functionName: "balances",
    args: [address],
  });

  const { data: withdrawData, write: withdraw } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "withdraw",
    args: [Number(balance)],
  });

  const { isLoading: isWithdrawing } = useWaitForTransaction({
    hash: withdrawData?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  useEffect(() => {
    if (writeSuccess) {
      setWriteSuccess(false);
      refetchBalance();
    }
  }, [writeSuccess, refetchBalance, address]);

  useEffect(() => {
    if (bigNumberToDecimal(balance as ethers.BigNumber, 6) < 1) {
      router.push("/login");
    }
  }, [balance, router]);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-start gap-4 h-full w-full">
      <div className="text-3xl mx-auto">Welcome to the Dashboard</div>
      <div className="flex items-center gap-2">
        <div>USDC Balance: </div>
        <div>{bigNumberToDecimal(balance as ethers.BigNumber, 6)}</div>
      </div>
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={() => withdraw()}
        disabled={isWithdrawing}>
        Withdraw
      </button>
      {isWithdrawing && <div>Processing...</div>}
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
};

export default Dashboard;
