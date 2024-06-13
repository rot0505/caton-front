"use client";

import React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, optimism, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, optimism, sepolia],
  [publicProvider()],
);

const { wallets } = getDefaultWallets({
  appName: "Caton",
  projectId: projectId as string,
  chains,
});

const demoAppInfo = {
  appName: "Caton",
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [
      argentWallet({ projectId: projectId as string, chains }),
      trustWallet({ projectId: projectId as string, chains }),
      ledgerWallet({ projectId: projectId as string, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default function Web3Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
