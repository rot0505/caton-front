"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header: React.FC = () => {
  return (
    <div className="flex justify-end items-center p-8">
      <ConnectButton showBalance={false} chainStatus="none" />
    </div>
  );
};

export default Header;
