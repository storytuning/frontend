"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Skeleton,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useAccount } from "wagmi";
import { useModelLoader, useAllModelsLoader } from "../../hooks/useModelLoader";
import ImageGenerationModal from "../../components/ImageGenerationModal";
import useImageGeneration from "../../hooks/useImageGeneration";
import { keccak256 } from "viem";
import { useStoryClient } from "../../hooks/useStoryClient";
import Image from "next/image";
import { LicenseTerms } from "@story-protocol/core-sdk";
import { zeroAddress } from "viem";

export default function ModelsPage() {
  const { client } = useStoryClient();
  const { address: walletAddress } = useAccount();
  const [tabValue, setTabValue] = useState(0);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{
    name: string;
    owner: string;
  } | null>(null);
  const { generateImage } = useImageGeneration();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const {
    models: myModels,
    loading: myLoading,
    error: myError,
  } = useModelLoader(walletAddress ?? null);
  const {
    models: allModels,
    loading: allLoading,
    error: allError,
  } = useAllModelsLoader();

  const modelUsageLicenseTerms: LicenseTerms = {
    transferable: true,
    royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
    defaultMintingFee: BigInt(1),
    expiration: BigInt(0),
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: 0,
    commercialRevCeiling: BigInt(0),
    derivativesAllowed: false,
    derivativesAttribution: false,
    derivativesApproval: false,
    derivativesReciprocal: false,
    derivativeRevCeiling: BigInt(0),
    currency: "0x1514000000000000000000000000000000000000", // STORY token
    uri: "",
  };

  // Model IP 등록
  const [isRegistering, setIsRegistering] = useState<{ [key: string]: boolean }>({});
  const [registeredModels, setRegisteredModels] = useState<Set<string>>(new Set());

  const RegisterModelIP = async (model: any) => {
    console.log("RegisterModelIP called with model:", model);
    console.log("Client state:", client);
    console.log("Address state:", walletAddress);
    
    if (!client || !walletAddress) {
      console.error("Client or address is not connected");
      setNotification({
        open: true,
        message: "지갑이 연결되지 않았습니다. 지갑을 연결해주세요.",
        severity: "error",
      });
      return;
    }

    setIsRegistering(prev => ({ ...prev, [model.modelName]: true }));
    try {
      console.log("Starting IP registration process...");
      const metadataURI = `ipfs://${model.Cid}`;

      const response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
        derivData: {
          parentIpIds: model.selectedIpIds,
          licenseTermsIds: model.selectedLicenseTermsIds,
          maxMintingFee: BigInt(0),
          maxRevenueShare: 0,
          maxRts: 0,
        },
        ipMetadata: {
          ipMetadataURI: metadataURI,
          ipMetadataHash: keccak256(
            new TextEncoder().encode(`metadata-${model.Cid}`)
          ),
          nftMetadataURI: metadataURI,
          nftMetadataHash: keccak256(
            new TextEncoder().encode(`nft-${model.Cid}`)
          ),
        },
        recipient: walletAddress,
        txOptions: {
          waitForTransaction: true,
          confirmations: 1,
        },
      });

      console.log("IP registration response:", response);

      if (response && response.ipId) {
        console.log("Successfully registered IP with ID:", response.ipId);
        setRegisteredModels(prev => new Set([...prev, model.modelName]));
        setNotification({
          open: true,
          message: `모델이 성공적으로 IP로 등록되었습니다! IP ID: ${response.ipId}`,
          severity: "success",
        });
      } else {
        console.error("Invalid response from IP registration:", response);
        setNotification({
          open: true,
          message: "IP 등록에 실패했습니다. 응답이 올바르지 않습니다.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error during IP registration:", error);
      setNotification({
        open: true,
        message: `IP 등록 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        severity: "error",
      });
    } finally {
      setIsRegistering(prev => ({ ...prev, [model.modelName]: false }));
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleOpenGenerationModal = (modelName: string, modelOwner: string) => {
    setSelectedModel({ name: modelName, owner: modelOwner });
    setGenerationModalOpen(true);
  };

  const handleGenerateImage = async (data: {
    prompt: string;
    numOfImages: number;
  }) => {
    if (!selectedModel || !walletAddress)
      throw new Error("모델 정보가 올바르지 않습니다");

    try {
      const images = await generateImage({
        modelName: selectedModel.name,
        modelOwnerAddress: selectedModel.owner,
        walletAddress,
        prompt: data.prompt,
        numOfImages: data.numOfImages,
      });

      setNotification({
        open: true,
        message: "Images generated successfully!",
        severity: "success",
      });
      return images;
    } catch (err) {
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : "이미지 생성 실패",
        severity: "error",
      });
      throw err;
    }
  };

  const handleGenerateSuccess = (images: any[]) => {
    setNotification({
      open: true,
      message: "Images generated successfully!",
      severity: "success",
    });
  };

  const renderModelCard = (model: any, showCreator = false) => (
    <Card sx={{ height: "100%", borderRadius: 3 }}>
      <CardHeader
        title={
          <Typography variant="h6" component="div">
            {model.modelName}
          </Typography>
        }
        subheader={
          <Box sx={{ mt: 1 }}>
            <Chip
              label={getStatusText(model.status)}
              size="small"
              color={model.status === "completed" ? "success" : "default"}
              sx={{ mr: 1 }}
            />
            {showCreator && (
              <Tooltip title={model.walletAddress}>
                <Chip
                  label={`Creator: ${shortenAddress(model.walletAddress)}`}
                  size="small"
                  sx={{ mr: 1 }}
                />
              </Tooltip>
            )}
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {model.description || "No description provided"}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 1 }}
        >
          Created: {formatDate(model.createdAt)}
        </Typography>

        {/* selectedIpIds 표시 - IP 링크와 아이콘 추가 */}
        {model.selectedIpIds && model.selectedIpIds.length > 0 && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected IP IDs:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {model.selectedIpIds.map((ipId: string, index: number) => (
                <Chip
                  key={index}
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
                  label={`${ipId.substring(0, 6)}...${ipId.substring(
                    ipId.length - 4
                  )}`}
                  size="small"
                  variant="outlined"
                  color="info"
                  clickable
                  onClick={() => {
                    window.open(
                      `https://aeneid.explorer.story.foundation/ipa/${ipId}`,
                      "_blank"
                    );
                  }}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(123, 97, 255, 0.1), rgba(0, 188, 212, 0.1))",
                    borderColor: "rgba(123, 97, 255, 0.4)",
                    color: "#7b61ff",
                    fontWeight: 500,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, rgba(123, 97, 255, 0.2), rgba(0, 188, 212, 0.2))",
                    },
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(123, 97, 255, 0.7)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {model.status === "failed" && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Error: {model.error || "Unknown error occurred"}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          size="small"
          variant="contained"
          disabled={model.status !== "completed"}
          onClick={() =>
            model.status === "completed" &&
            handleOpenGenerationModal(model.modelName, model.walletAddress)
          }
          sx={{
            background:
              model.status === "completed"
                ? "linear-gradient(135deg, #ff4081, #7b61ff)"
                : undefined,
          }}
        >
          {model.status === "completed" ? "Use Model" : "Training..."}
        </Button>
        {!registeredModels.has(model.modelName) && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            disabled={model.status !== "completed" || isRegistering[model.modelName]}
            onClick={() => model.status === "completed" && RegisterModelIP(model)}
            startIcon={isRegistering[model.modelName] ? <CircularProgress size={20} /> : null}
            sx={{
              background:
                model.status === "completed"
                  ? "linear-gradient(135deg, #7b61ff, #ff4081)"
                  : undefined,
            }}
          >
            {isRegistering[model.modelName] ? "Registering..." : "Register IP"}
          </Button>
        )}
      </CardActions>
    </Card>
  );

  const renderLoading = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader
              title={<Skeleton animation="wave" height={30} width="80%" />}
            />
            <CardContent>
              <Skeleton
                animation="wave"
                height={20}
                width="40%"
                sx={{ mb: 2 }}
              />
              <Skeleton animation="wave" height={80} width="100%" />
            </CardContent>
            <CardActions>
              <Skeleton animation="wave" height={36} width="100%" />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #ff4081, #7b61ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          AI Models
        </Typography>
        {!walletAddress && (
          <Alert severity="info" sx={{ mt: 2 }}>
            지갑을 연결하여 모델을 생성하고 사용하세요.
          </Alert>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="My Models" />
          <Tab label="All Models" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 ? (
            myLoading ? (
              renderLoading()
            ) : myError ? (
              <Typography color="error">{myError}</Typography>
            ) : myModels.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary">
                  No fine-tuned models yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select images in the dashboard and request model tuning
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myModels.map((model, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    {renderModelCard(model)}
                  </Grid>
                ))}
              </Grid>
            )
          ) : allLoading ? (
            renderLoading()
          ) : allError ? (
            <Typography color="error">{allError}</Typography>
          ) : allModels.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No models available
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {allModels.map((model, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  {renderModelCard(model, true)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {selectedModel && walletAddress && (
        <ImageGenerationModal
          open={generationModalOpen}
          onClose={() => setGenerationModalOpen(false)}
          modelName={selectedModel.name}
          modelOwner={selectedModel.owner}
          walletAddress={walletAddress}
          onSuccess={handleGenerateSuccess}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
