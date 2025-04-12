"use client";

import Dashboard from "./Dashboard";
import { useAccount } from "wagmi";

export default function DashboardPage() {
  const { address } = useAccount();

  return <Dashboard walletAddress={address ?? null} />;
}
