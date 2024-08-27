"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/navigation";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import { usdcContractConfig, userStorageContractConfig } from "@/contracts";
import { bigNumberToDecimal, decimalToBigNumber } from "@/lib/bigNumber";
import { formatDate } from "@/lib/date";

const endpoint =
  "https://subgraph.satsuma-prod.com/3129c4cf3d93/metapirate--836974/caton-subgraph/api";

const Subscribers = `
  query Subscribers {
    subscribes(first: 1000) {
      user,
      expireTs,
      amount
    }
  }
`;

const client = new ApolloClient({
  uri: endpoint,
  cache: new InMemoryCache(),
});

type Subscribe = {
  user: string;
  expireTs: string;
  amount: BigNumber;
};

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscribe[]>([]);

  useEffect(() => {
    const getSubscribers = async () => {
      let data = await client.query({ query: gql(Subscribers) });
      setSubscribers(data.data.subscribes);
    };
    getSubscribers();
  }, []);

  const { data: balance, refetch: refetchBalance } = useContractRead({
    ...usdcContractConfig,
    functionName: "balanceOf",
    args: [userStorageContractConfig.address],
  });

  const { data: withdrawData, write: withdraw } = useContractWrite({
    ...userStorageContractConfig,
    functionName: "withdraw",
    args: [Number(balance ?? 0)],
  });
  console.log(Number(balance ?? 0));

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

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-start gap-4 h-full w-full">
      <div className="text-3xl mx-auto">Welcome to the Admin Panel</div>
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-2">
          <div>Total USDC Balance: </div>
          <div>{bigNumberToDecimal(balance as ethers.BigNumber, 6)}</div>
        </div>
        <div className="flex gap-5">
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
      </div>
      {subscribers.length > 0 && (
        <div className="flex flex-col w-full mt-5">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th>User</th>
                <th>Expire Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber, index) => (
                <tr key={index}>
                  <td>{subscriber.user}</td>
                  <td>{formatDate(subscriber.expireTs)}</td>
                  <td>{bigNumberToDecimal(subscriber.amount, 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
