"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Modal,
  IconButton,
  Pagination,
  Snackbar,
  Alert,
  Chip,
  Checkbox,
  Button,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  TokenOutlined,
  CheckBoxOutlineBlank,
  CheckBox,
} from "@mui/icons-material";
import { useImageLoader } from "../../hooks/useImageLoader";
import { useStoryProtocol } from "../../hooks/useStoryProtocol";
import axios from "axios";
import FineTuneModal from "./FineTuneModal";
import Link from "next/link";
import Image from "next/image";
import IPRegistration from "../../components/IPRegistration";
import { useStoryClient } from "../../hooks/useStoryClient";
import { keccak256 } from "viem";
import { LicenseTerms } from "@story-protocol/core-sdk";

interface ImageData {
  cid: string;
  fileName: string;
  mimeType: string;
  size: number;
  timestamp: string;
  tokenId?: string;
  mintedAt?: string;
  ipId?: string;
  licenseTermsIds?: string[];
}

interface DashboardProps {
  walletAddress?: string | null;
}

const ITEMS_PER_PAGE = 50;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ImageModal: React.FC<{
  open: boolean;
  onClose: () => void;
  image: ImageData | null;
}> = ({ open, onClose, image }) => {
  const theme = useTheme();

  if (!image) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 600,
          bgcolor: theme.palette.background.paper,
          backdropFilter: "blur(16px)",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          color: theme.palette.text.primary,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Image
          src={`https://gateway.pinata.cloud/ipfs/${image.cid}`}
          alt={image.fileName}
          width={800}
          height={600}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>CID:</strong> {image.cid}
          <br />
          <strong>File:</strong> {image.fileName}
          <br />
          <strong>Type:</strong> {image.mimeType}
          <br />
          <strong>Size:</strong> {(image.size / 1024).toFixed(2)} KB
          <br />
          <strong>Uploaded:</strong>{" "}
          {new Date(image.timestamp).toLocaleString()}
          <br />
          {image.tokenId && (
            <>
              <strong>Token ID:</strong> #{image.tokenId}
              <br />
              <strong>Minted At:</strong>{" "}
              {new Date(image.mintedAt || "").toLocaleString()}
            </>
          )}
        </Typography>
      </Box>
    </Modal>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [openFineTuneModal, setOpenFineTuneModal] = useState(false);

  const theme = useTheme();
  const { images, loading, error, refetchImages, setImages } = useImageLoader(
    walletAddress || null
  );
  const { getNFTInfo } = useStoryProtocol(walletAddress || null);
  const { client } = useStoryClient();

  const toggleSelect = (cid: string) => {
    const image = images.find((img) => img.cid === cid);
    if (!image?.ipId) {
      setNotification({
        open: true,
        message: "Only IP registered images can be selected for fine-tuning",
        severity: "info",
      });
      return;
    }

    setSelectedCids((prev) =>
      prev.includes(cid) ? prev.filter((c) => c !== cid) : [...prev, cid]
    );
  };

  const selectAllIPImages = () => {
    const ipRegisteredCids = images
      .filter((img) => img.ipId)
      .map((img) => img.cid);

    // If all IP images are already selected, deselect all
    const allIPImagesSelected = ipRegisteredCids.every((cid) =>
      selectedCids.includes(cid)
    );

    if (allIPImagesSelected) {
      setSelectedCids([]);
    } else {
      setSelectedCids(ipRegisteredCids);
    }
  };

  // Check if all IP registered images are selected
  const areAllIPImagesSelected = () => {
    const ipRegisteredCids = images
      .filter((img) => img.ipId)
      .map((img) => img.cid);

    return (
      ipRegisteredCids.length > 0 &&
      ipRegisteredCids.every((cid) => selectedCids.includes(cid))
    );
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleMintSuccess = async (
    cid: string,
    tokenId: string,
    ipId?: string,
    licenseTermsIds?: bigint[]
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/api/update-nft-info`, {
        cid,
        tokenId,
        walletAddress,
        ipId,
        licenseTermsIds: licenseTermsIds?.map((id) => id.toString()),
      });

      await refetchImages();

      setNotification({
        open: true,
        message: `NFT minted & IP registered! (Token ID: ${tokenId}, IP ID: ${
          ipId || "None"
        })`,
        severity: "success",
      });
    } catch (error) {
      console.error("Minting error:", error);
      setNotification({
        open: true,
        message:
          "Failed to update database with NFT info: " +
          (error instanceof Error ? error.message : "Unknown error"),
        severity: "error",
      });
    }
  };

  const handleMintError = (error: Error) => {
    setNotification({
      open: true,
      message: "Mint failed: " + error.message,
      severity: "error",
    });
  };

  const handleFineTuneSubmit = async (data: {
    modelName: string;
    description?: string;
  }) => {
    try {
      const selectedIpIds = images
        .filter((img) => selectedCids.includes(img.cid))
        .map((img) => img.ipId)
        .filter((ipId): ipId is string => ipId !== undefined);

      const selectedLicenseTermsIds = images
        .filter((img) => selectedCids.includes(img.cid))
        .map((img) => img.licenseTermsIds)
        .filter((ids): ids is string[] => ids !== undefined)
        .flat();

      await axios.post(`${API_BASE_URL}/api/fine-tune-dataset`, {
        walletAddress,
        modelName: data.modelName,
        description: data.description,
        selectedCids,
        selectedIpIds,
        selectedLicenseTermsIds,
      });

      setNotification({
        open: true,
        message: "Fine-tuning request submitted successfully",
        severity: "success",
      });
      setOpenFineTuneModal(false);
      setSelectedCids([]);
    } catch (error) {
      console.error("Fine-tuning request failed:", error);
      setNotification({
        open: true,
        message: "Failed to submit fine-tuning request",
        severity: "error",
      });
    }
  };

  // const registerAllUnmintedImages = async () => {
  //   if (!client || !walletAddress) return;

  //   try {
  //     const toRegister = images.filter((img) => !img.tokenId);

  //     for (const img of toRegister) {
  //       const metadataURI = `ipfs://${img.cid}`;
  //       const metadataHash = keccak256(
  //         new TextEncoder().encode(`metadata-${img.cid}`)
  //       );
  //       const nftMetadataHash = keccak256(
  //         new TextEncoder().encode(`nft-${img.cid}`)
  //       );

  //       const commercialRemixTerms: LicenseTerms = {
  //         transferable: true,
  //         royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
  //         defaultMintingFee: 0n,
  //         expiration: 0n,
  //         commercialUse: true,
  //         commercialAttribution: true,
  //         commercializerChecker: zeroAddress,
  //         commercializerCheckerData: zeroAddress,
  //         commercialRevShare: 0,
  //         commercialRevCeiling: 0n,
  //         derivativesAllowed: true,
  //         derivativesAttribution: true,
  //         derivativesApproval: false,
  //         derivativesReciprocal: true,
  //         derivativeRevCeiling: 0n,
  //         currency: "0x1514000000000000000000000000000000000000",
  //         uri: "",
  //       };

  //       const response = await client.ipAsset.mintAndRegisterIp({
  //         spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
  //         licenseTermsData: [{ terms: commercialRemixTerms }],
  //         ipMetadata: {
  //           ipMetadataURI: metadataURI,
  //           ipMetadataHash: metadataHash,
  //           nftMetadataURI: metadataURI,
  //           nftMetadataHash: nftMetadataHash,
  //         },
  //         txOptions: {
  //           waitForTransaction: true,
  //           confirmations: 1,
  //         },
  //       });
  //       handleMintSuccess(
  //         img.cid,
  //         response.tokenId.toString(),
  //         response.ipId,
  //         response.licenseTermsIds ? response.licenseTermsIds : [0n]
  //       );
  //     }

  //     await refetchImages();
  //     setNotification({
  //       open: true,
  //       message: "All unregistered images have been registered as IPs",
  //       severity: "success",
  //     });
  //   } catch (error) {
  //     console.error("Batch mint failed", error);
  //     setNotification({
  //       open: true,
  //       message: "Failed to register some images",
  //       severity: "error",
  //     });
  //   }
  // };

  if (!walletAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" color="text.secondary">
          Please connect your wallet to view images
        </Typography>
      </Container>
    );
  }

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!images.length) return <Typography>No images uploaded.</Typography>;

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        className="header-container"
        sx={{
          textAlign: "center",
          px: 3,
          py: 4,
          mb: 4,
          background:
            "linear-gradient(135deg, rgba(255, 64, 129, 0.05), rgba(123, 97, 255, 0.05))",
          borderRadius: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            background: "linear-gradient(135deg, #ff4081, #7b61ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {`Image Dashboard`}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage your images and register them as intellectual property
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          component={Link}
          href="/models"
          variant="outlined"
          startIcon={<TokenOutlined />}
          sx={{
            borderRadius: 8,
            textTransform: "none",
            px: 3,
            py: 1,
            borderColor: "rgba(123, 97, 255, 0.5)",
            color: "#7b61ff",
            "&:hover": {
              borderColor: "#7b61ff",
              backgroundColor: "rgba(123, 97, 255, 0.04)",
            },
          }}
        >
          View My Models
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          background: "#ffffff",
        }}
      >
        <Grid container spacing={3} sx={{ p: 3 }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={selectAllIPImages}
              startIcon={
                areAllIPImagesSelected() ? (
                  <CheckBox />
                ) : (
                  <CheckBoxOutlineBlank />
                )
              }
              sx={{
                borderRadius: 8,
                textTransform: "none",
                px: 3,
                py: 1,
                borderColor: "rgba(123, 97, 255, 0.5)",
                color: "#7b61ff",
                "&:hover": {
                  borderColor: "#7b61ff",
                  backgroundColor: "rgba(123, 97, 255, 0.04)",
                },
              }}
            >
              {areAllIPImagesSelected()
                ? "Deselect All IP Images"
                : "Select All IP Images"}
            </Button>
            <Button
              variant="outlined"
              sx={{
                ml: 2,
                borderRadius: 8,
                textTransform: "none",
                px: 3,
                py: 1,
                borderColor: "rgba(123, 97, 255, 0.5)",
                color: "#ff4081",
                "&:hover": {
                  borderColor: "#ff4081",
                  backgroundColor: "rgba(255, 64, 129, 0.04)",
                },
              }}
            >
              Register All Unminted
            </Button>
          </Box>
          {currentImages.map((image, index) => (
            <Grid key={`${image.cid}-${index}`}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  transform: "translateY(0)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  },
                  border: selectedCids.includes(image.cid)
                    ? `2px solid ${theme.palette.primary.main}`
                    : "2px solid transparent",
                }}
              >
                <Checkbox
                  checked={selectedCids.includes(image.cid)}
                  onChange={() => toggleSelect(image.cid)}
                  sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}
                />
                <Image
                  src={`https://gateway.pinata.cloud/ipfs/${image.cid}`}
                  alt={image.fileName}
                  width={300}
                  height={200}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "200px",
                  }}
                  onClick={() => setSelectedImage(image)}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    p: 1,
                    transition: "0.3s ease",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {decodeURIComponent(image.fileName)}
                  </Typography>
                  {image.tokenId && (
                    <Chip
                      icon={<TokenOutlined />}
                      label={`NFT #${image.tokenId}`}
                      color="primary"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>

              {image.ipId && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Chip
                    icon={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: -0.5 }}
                      >
                        <Image
                          src="/ip_token.svg"
                          alt="IP Token"
                          width={16}
                          height={16}
                        />
                      </Box>
                    }
                    label={`IP: ${image.ipId.substring(
                      0,
                      6
                    )}...${image.ipId.substring(image.ipId.length - 4)}`}
                    size="small"
                    color="secondary"
                    sx={{
                      background: "linear-gradient(135deg, #7b61ff, #00bcd4)",
                      color: "white",
                      fontWeight: 500,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => {
                      window.open(
                        `https://aeneid.explorer.story.foundation/ipa/${image.ipId}`,
                        "_blank"
                      );
                    }}
                  />
                </Box>
              )}

              {!image.tokenId && (
                <Box sx={{ mt: 1 }}>
                  <IPRegistration
                    cid={image.cid}
                    walletAddress={walletAddress}
                    onSuccess={(
                      tokenId: string,
                      ipId: string,
                      licenseTermsIds: bigint[]
                    ) =>
                      handleMintSuccess(
                        image.cid,
                        tokenId,
                        ipId,
                        licenseTermsIds
                      )
                    }
                    onError={handleMintError}
                  />
                </Box>
              )}
            </Grid>
          ))}
        </Grid>

        {selectedCids.length > 0 && (
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "center",
              p: 3,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(255, 64, 129, 0.03), rgba(123, 97, 255, 0.03))",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => setOpenFineTuneModal(true)}
              sx={{
                px: 5,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #ff4081, #7b61ff)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(123, 97, 255, 0.3)",
              }}
            >
              Fine-Tune Model ({selectedCids.length})
            </Button>
            <FineTuneModal
              open={openFineTuneModal}
              onClose={() => setOpenFineTuneModal(false)}
              onSubmit={handleFineTuneSubmit}
            />
          </Box>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      <ImageModal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
