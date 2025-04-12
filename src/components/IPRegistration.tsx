"use client";

import React, { useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { keccak256 } from "viem";
import { useStoryClient } from "../hooks/useStoryClient";
import { LicenseTerms } from "@story-protocol/core-sdk";
import { zeroAddress } from "viem";

interface IPRegistrationProps {
  cid: string;
  walletAddress: string | null;
  onSuccess?: (
    tokenId: string,
    ipId: string,
    licenseTermsIds: bigint[]
  ) => void;
  onError?: (error: Error) => void;
}

const IPRegistration: React.FC<IPRegistrationProps> = ({
  cid,
  walletAddress,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { client } = useStoryClient();

  const handleRegisterIP = async () => {
    if (!client || !walletAddress) {
      setError("Wallet connection required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // IPFS CID를 metadata URI로 사용
      const metadataURI = `ipfs://${cid}`;

      // 해시 생성
      const metadataHash = keccak256(
        new TextEncoder().encode(`metadata-${cid}`)
      );
      const nftMetadataHash = keccak256(new TextEncoder().encode(`nft-${cid}`));

      const commercialRemixTerms: LicenseTerms = {
        transferable: true,
        royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: true,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: zeroAddress,
        commercialRevShare: 0,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: false, //derivative IP can use new license
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: 0n,
        currency: "0x1514000000000000000000000000000000000000", // $WIP address from https://docs.story.foundation/docs/deployed-smart-contracts
        uri: "",
      };

      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
        licenseTermsData: [{ terms: commercialRemixTerms }],
        ipMetadata: {
          ipMetadataURI: metadataURI,
          ipMetadataHash: metadataHash,
          nftMetadataHash: nftMetadataHash,
          nftMetadataURI: metadataURI,
        },
        txOptions: {
          waitForTransaction: true,
          confirmations: 1,
        },
      });

      console.log(response);
      onSuccess?.(
        response.tokenId ? response.tokenId.toString() : "",
        response.ipId ? response.ipId : "",
        response.licenseTermsIds ? response.licenseTermsIds : [0n]
      );
    } catch (err) {
      console.error("IP registration failed:", err);
      setError(
        err instanceof Error ? err.message : "Error during IP registration"
      );
      if (onError)
        onError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleRegisterIP}
        disabled={isLoading || !walletAddress || !client}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
        sx={{
          background: "linear-gradient(135deg, #7b61ff, #00bcd4)",
          color: "white",
          fontWeight: "bold",
          "&:hover": {
            background: "linear-gradient(135deg, #6a50e8, #00a2c0)",
          },
        }}
      >
        {isLoading ? "Registering..." : "Register IP"}
      </Button>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default IPRegistration;
