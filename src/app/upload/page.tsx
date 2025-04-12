"use client";

import React, { useEffect, useState } from "react";
import Upload from "./Upload";
import { Container } from "@mui/material";
import { useAccount } from "wagmi";

const UploadPage = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isStoryChainConnected, setIsStoryChainConnected] =
    useState<boolean>(false);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    const connected = localStorage.getItem("isStoryChainConnected") === "true";

    if (storedWallet) setWalletAddress(storedWallet);
    setIsStoryChainConnected(connected);
  }, []);

  const { address } = useAccount();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Upload
        walletAddress={address ?? null}
        isStoryChainConnected={isStoryChainConnected}
      />
    </Container>
  );
};

export default UploadPage;
