"use client";

import { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

import { userStorageContractConfig, usdcContractConfig } from "@/contracts";
import { bigNumberToDecimal, decimalToBigNumber } from "@/lib/bigNumber";

const Login: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [writeSuccess, setWriteSuccess] = useState(false);

  const { data: balance, refetch: refetchBalance } = useContractRead({
    ...userStorageContractConfig,
    functionName: "balances",
    args: [address],
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    ...usdcContractConfig,
    functionName: "allowance",
    args: [address, userStorageContractConfig.address],
  });

  const { data: approveData, write: approve } = useContractWrite({
    ...usdcContractConfig,
    functionName: "approve",
    args: [userStorageContractConfig.address, decimalToBigNumber(10, 6)],
  });

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  const { data: depositData, write: deposit } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "deposit",
    args: [decimalToBigNumber(1, 6)],
  });

  const { isLoading: isDepositing } = useWaitForTransaction({
    hash: depositData?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  useEffect(() => {
    if (writeSuccess) {
      setWriteSuccess(false);
      refetchAllowance();
      refetchBalance();
    }
  }, [writeSuccess, refetchAllowance, refetchBalance, address]);

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        balance: bigNumberToDecimal(balance as ethers.BigNumber, 6),
      }),
    });

    if (response.ok) {
      router.push("/dashboard");
    } else {
      alert("Please deposit at least 1 USDC");
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 h-full w-full">
      <div className="flex items-center gap-2">
        <div>USDC Balance: </div>
        <div>{bigNumberToDecimal(balance as ethers.BigNumber, 6)}</div>
      </div>
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={() => {
          bigNumberToDecimal(allowance as ethers.BigNumber, 6) >= 1
            ? deposit()
            : approve();
        }}
        disabled={isApproving || isDepositing}>
        {bigNumberToDecimal(allowance as ethers.BigNumber, 6) >= 1
          ? "Deposit"
          : "Approve"}
      </button>
      {(isApproving || isDepositing) && <div>Processing...</div>}
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
