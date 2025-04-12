"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmiConfig";

import { NFT_CONTRACT_, NFT_CONTRACT_ADDRESS } from "../utils/contractConfig";

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

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isStoryChainRegistered, setIsStoryChainRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnecting = status === "pending";

  const checkRegistrationStatus = useCallback(async () => {
    if (!address) {
      setIsStoryChainRegistered(false);
      onStoryChainConnected(false);
      return;
    }

    try {
      onStoryChainConnected(true); // NFT 소유 여부 상관 없이 연결됨으로 처리
    } catch (err) {
      console.error("StoryChain 네트워크 연결 확인 실패:", err);
      onStoryChainConnected(false);
    }
  }, [address, onStoryChainConnected]);

  useEffect(() => {
    const sync = async () => {
      if (isConnected && address) {
        onWalletConnected(address);
        await checkRegistrationStatus();
      } else {
        setIsStoryChainRegistered(false);
        onStoryChainConnected(false);
      }
    };

    sync();
  }, [
    address,
    isConnected,
    onWalletConnected,
    checkRegistrationStatus,
    onStoryChainConnected,
  ]);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  const registerToStoryChain = async () => {
    try {
      setIsRegistering(true);
      setError(null);

      if (!walletClient || !address) {
        throw new Error("Wallet connection required");
      }

      const hash = await writeContract(wagmiConfig, {
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "mint",
        args: [address, "initial-registration"],
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      setIsStoryChainRegistered(true);
      onStoryChainConnected(true);
    } catch (err) {
      console.error("스토리체인 등록 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "스토리체인 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsRegistering(false);
    }
  };

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
        {!isStoryChainRegistered ? (
          <MenuItem onClick={registerToStoryChain} disabled={isRegistering}>
            {isRegistering ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Registering NFT...
              </>
            ) : (
              "Register NFT"
            )}
          </MenuItem>
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="success.main">
              NFT Registration Complete
            </Typography>
          </MenuItem>
        )}
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
