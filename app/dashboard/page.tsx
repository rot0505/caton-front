"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useRouter } from "next/navigation";

import { userStorageContractConfig } from "@/contracts";
import { decimalToBigNumber } from "@/lib/bigNumber";
import { formatDate } from "@/lib/date";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [writeSuccess, setWriteSuccess] = useState(false);

  const { data: expireTs, refetch: refetchExpiresTs } = useContractRead({
    ...userStorageContractConfig,
    functionName: "expiresTs",
    args: [address],
  });

  const { data: subscribeData1, write: subscribe1 } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "subscribe",
    args: [decimalToBigNumber(1, 6)],
  });

  const { data: subscribeData2, write: subscribe2 } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "subscribe",
    args: [decimalToBigNumber(2, 6)],
  });

  const { data: subscribeData3, write: subscribe3 } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "subscribe",
    args: [decimalToBigNumber(3, 6)],
  });

  const { isLoading: isSubscribing1 } = useWaitForTransaction({
    hash: subscribeData1?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  const { isLoading: isSubscribing2 } = useWaitForTransaction({
    hash: subscribeData2?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  const { isLoading: isSubscribing3 } = useWaitForTransaction({
    hash: subscribeData3?.hash,
    timeout: 30000,
    onSuccess: () => {
      setWriteSuccess(true);
    },
  });

  useEffect(() => {
    if (writeSuccess) {
      setWriteSuccess(false);
      refetchExpiresTs();
    }
  }, [
    writeSuccess,
    address,
    isSubscribing1,
    isSubscribing2,
    isSubscribing3,
    refetchExpiresTs,
  ]);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/login");
  };

  const handleSubscribe = (amount: number) => {
    if (amount === 1) subscribe1();
    else if (amount === 2) subscribe2();
    else if (amount === 3) subscribe3();
  };

  return (
    <div className="flex flex-col items-start gap-4 h-full w-full">
      <div className="text-3xl mx-auto">Welcome to the Dashboard</div>
      <button
        className="bg-gray-600 rounded-md border-none px-4 py-2 disabled:cursor-not-allowed"
        onClick={handleLogout}>
        Log out
      </button>
      {Number(expireTs) !== 0 && (
        <div className="text-2xl">
          Expire Date is {formatDate(expireTs as string)}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex flex-col p-5 gap-10 bg-gray-950 rounded-lg w-1/3">
          <div className="text-sm">Basic</div>
          <div className="text-3xl">1 USDC</div>
          <button
            className="bg-gray-600 rounded-md border-none px-5 py-1 disabled:cursor-not-allowed"
            disabled={isSubscribing1}
            onClick={() => handleSubscribe(1)}>
            {isSubscribing1 ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
        <div className="flex flex-col p-5 gap-10 bg-gray-950 rounded-lg w-1/3">
          <div className="text-sm">Standard</div>
          <div className="text-3xl">2 USDC</div>
          <button
            className="bg-gray-600 rounded-md border-none px-5 py-1 disabled:cursor-not-allowed"
            disabled={isSubscribing2}
            onClick={() => handleSubscribe(2)}>
            {isSubscribing2 ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
        <div className="flex flex-col p-5 gap-10 bg-gray-950 rounded-lg w-1/3">
          <div className="text-sm">Premium</div>
          <div className="text-3xl">3 USDC</div>
          <button
            className="bg-gray-600 rounded-md border-none px-5 py-1 disabled:cursor-not-allowed"
            disabled={isSubscribing3}
            onClick={() => handleSubscribe(3)}>
            {isSubscribing3 ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
