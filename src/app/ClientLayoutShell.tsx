"use client";

import React, { useState, useEffect } from "react";
import { AppBar, Container, Toolbar, Typography, Box } from "@mui/material";
import WalletManager from "../components/WalletManager";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/Upload";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

interface ClientLayoutShellProps {
  children: React.ReactNode;
}

const ClientLayoutShell: React.FC<ClientLayoutShellProps> = ({ children }) => {
  // hydration 이슈 해결을 위한 마운트 상태 추가
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isStoryChainConnected, setIsStoryChainConnected] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    const connected = localStorage.getItem("isStoryChainConnected") === "true";

    if (storedWallet) setWalletAddress(storedWallet);
    setIsStoryChainConnected(connected);
  }, []);

  const handleWalletConnected = (address: string) => {
    if (!address) {
      setWalletAddress(null);
      localStorage.removeItem("walletAddress");
    } else {
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
    }
  };

  const handleStoryChainConnected = (connected: boolean) => {
    setIsStoryChainConnected(connected);
    if (connected) {
      localStorage.setItem("isStoryChainConnected", "true");
    } else {
      localStorage.removeItem("isStoryChainConnected");
    }
  };

  const navItems = [
    { label: "Home", path: "/", icon: <HomeIcon /> },
    { label: "Upload", path: "/upload", icon: <UploadIcon /> },
    { label: "Models", path: "/models", icon: <CategoryIcon /> },
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Gallery", path: "/gallery", icon: <PhotoLibraryIcon /> },
  ];

  return (
    <>
      {mounted && (
        <>
          <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
              backdropFilter: "blur(8px)",
              background: "rgba(255, 255, 255, 0.8)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              mb: 2,
            }}
          >
            <Toolbar>
              <Container
                maxWidth="lg"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Link
                    href="/"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, #ff4081, #7b61ff)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        mr: 4,
                      }}
                    >
                      Story IP
                    </Typography>
                  </Link>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Link
                      href="/upload"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body1">Upload</Typography>
                    </Link>
                    <Link
                      href="/dashboard"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body1">Dashboard</Typography>
                    </Link>
                    <Link
                      href="/models"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body1">Models</Typography>
                    </Link>
                    <Link
                      href="/gallery"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography variant="body1">Gallery</Typography>
                    </Link>
                  </Box>
                </Box>
                <WalletManager
                  onWalletConnected={handleWalletConnected}
                  onStoryChainConnected={handleStoryChainConnected}
                />
              </Container>
            </Toolbar>
          </AppBar>
          <Box sx={{ pt: 2 }}>{children}</Box>
        </>
      )}
    </>
  );
};

export default ClientLayoutShell;
