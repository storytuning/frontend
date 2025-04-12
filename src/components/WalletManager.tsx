"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";

interface WalletManagerProps {
  onWalletConnected: (address: string) => void;
  onStoryChainConnected: (connected: boolean) => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({
  onWalletConnected,
  onStoryChainConnected,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnecting = status === "pending";

  useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address);
      onStoryChainConnected(true);
    } else {
      onWalletConnected("");
      onStoryChainConnected(false);
    }
  }, [address, isConnected, onWalletConnected, onStoryChainConnected]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = async () => {
    await disconnect();
    await new Promise((resolve) => setTimeout(resolve, 0));
    onWalletConnected("");
    onStoryChainConnected(false);
    handleClose();
  };

  if (!isConnected || !address) {
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          startIcon={<WalletIcon />}
          onClick={() => connect({ connector: connectors[0] })}
          disabled={isConnecting}
          size="small"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ display: "block", mt: 1 }}
          >
            {error}
          </Typography>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        color="primary"
        startIcon={<WalletIcon />}
        size="small"
      >
        {`${address.substring(0, 6)}...${address.substring(
          address.length - 4
        )}`}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {address}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
      </Menu>
      {error && (
        <Typography
          color="error"
          variant="caption"
          sx={{ display: "block", mt: 1 }}
        >
          {error}
        </Typography>
      )}
    </>
  );
};

export default WalletManager;
