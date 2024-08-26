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

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    ...usdcContractConfig,
    functionName: "allowance",
    args: [address, userStorageContractConfig.address],
    enabled: !!address,
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

  useEffect(() => {
    if (writeSuccess) {
      setWriteSuccess(false);
      refetchAllowance();
    }
  }, [writeSuccess, refetchAllowance, address]);

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
      }),
    });
    const data = await response.json();

    if (data.success) {
      if (data.isAdmin) router.push("/admin");
      else router.push("/dashboard");
    } else {
      alert("Please deposit at least 1 USDC");
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 h-full w-full">
      {bigNumberToDecimal(allowance as ethers.BigNumber, 6) <= 3 && (
        <button
          className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
          onClick={() => approve()}
          disabled={isApproving}>
          Approve
        </button>
      )}
      {isApproving && <div>Processing...</div>}
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
