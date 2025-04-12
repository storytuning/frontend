"use client";

import React from "react";
import { Button, Typography, Paper, Box } from "@mui/material";
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "../../node_modules/wagmi/dist/types/exports";

interface WalletConnectProps {
  onWalletConnected: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const isConnecting = status === "pending";

  // wagmi v2는 연결 시 콜백 없음 → useEffect로 address 감지
  React.useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address);
    }
  }, [isConnected, address]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">지갑 연결</Typography>

        {isConnected ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {`${address?.substring(0, 6)}...${address?.substring(
                address.length - 4
              )}`}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => disconnect()}
            >
              연결 해제
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<WalletIcon />}
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting}
          >
            {isConnecting ? "연결 중..." : "MetaMask 연결"}
          </Button>
        )}
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error.message}
        </Typography>
      )}
    </Paper>
  );
};

export default WalletConnect;
