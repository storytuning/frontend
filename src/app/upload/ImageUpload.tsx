"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

interface ImagePreview {
  file: File;
  preview: string;
  fileName: string;
  duplicated?: boolean;
}

interface ImageUploadProps {
  walletAddress: string | null;
  isStoryChainConnected: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  walletAddress,
  isStoryChainConnected,
}) => {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    setSuccessMessage(null);
  }, []);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [previews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    disabled: !walletAddress || !isStoryChainConnected,
  });

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);

      if (!walletAddress) throw new Error("Wallet connection required");
      if (!isStoryChainConnected) throw new Error("NFT registration required");

      const formData = new FormData();
      previews.forEach((preview) => formData.append("images", preview.file));
      formData.append("creatorAddress", walletAddress);

      type UploadResult = {
        duplicated: boolean;
        fileName: string;
        originalName: string;
        cid: string;
        size?: number;
        ipfsUrl?: string;
      };

      const response = await axios.post<{ data: UploadResult[] }>(
        "http://localhost:3001/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const duplicated = response.data.data.filter(
        (item: UploadResult) => item.duplicated
      );

      // previews 중 duplicated만 남기고 표시
      setPreviews((prev) =>
        prev
          .filter((preview) =>
            duplicated.some((dup) => preview.file.name === dup.originalName)
          )
          .map((preview) => ({ ...preview, duplicated: true }))
      );

      if (duplicated.length > 0) {
        setNotification({
          open: true,
          message: `${duplicated.length}개의 이미지는 이미 업로드된 이미지입니다.`,
          severity: "info",
        });
      } else {
        setNotification({
          open: true,
          message: "모든 이미지가 성공적으로 업로드되었습니다!",
          severity: "success",
        });
        setPreviews([]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setNotification({
        open: true,
        message: "업로드 도중 오류가 발생했습니다.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseNotification = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const removePreview = (index: number) => {
    const previewToRemove = previews[index];
    if (previewToRemove.preview.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove.preview);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: "center",
          backgroundColor: isDragActive
            ? "rgba(123, 97, 255, 0.08)"
            : "rgba(123, 97, 255, 0.04)",
          borderRadius: "24px",
          cursor:
            !walletAddress || !isStoryChainConnected
              ? "not-allowed"
              : "pointer",
          opacity: !walletAddress || !isStoryChainConnected ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(123, 97, 255, 0.08)",
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon
          sx={{
            fontSize: 64,
            color: isDragActive ? "primary.main" : "primary.light",
            mb: 3,
            transition: "all 0.2s ease-in-out",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            color: isDragActive ? "primary.main" : "text.primary",
          }}
        >
          {!walletAddress
            ? "Connect Wallet"
            : !isStoryChainConnected
            ? "Register NFT"
            : isDragActive
            ? "Drop your images here"
            : "Upload Images"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          Supported formats: JPG, PNG, GIF
        </Typography>
      </Box>

      {previews.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Paper
                  sx={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(123, 97, 255, 0.05)",
                    border: preview.duplicated ? "3px solid red" : "none", // 🔹 추가
                  }}
                >
                  <img
                    src={
                      preview.preview.startsWith("blob:")
                        ? preview.preview
                        : `https://gateway.pinata.cloud/ipfs/${preview.preview}`
                    }
                    alt={`Preview ${index}`}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() => removePreview(index)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      minWidth: "auto",
                      px: 1,
                    }}
                  >
                    Remove
                  </Button>
                  {preview.duplicated && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        backgroundColor: "red",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      중복됨
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={uploading || !walletAddress || !isStoryChainConnected}
              startIcon={uploading ? <CircularProgress size={20} /> : null}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "999px",
                background: "linear-gradient(135deg, #7b61ff 0%, #4fc3f7 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #6f55e6 0%, #47b0df 100%)",
                },
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </Box>
        </Box>
      )}

      {error && (
        <Typography
          color="error"
          sx={{
            mt: 3,
            textAlign: "center",
          }}
        >
          {error}
        </Typography>
      )}

      {successMessage && (
        <Typography
          color="success.main"
          sx={{
            mt: 3,
            textAlign: "center",
          }}
        >
          {successMessage}
        </Typography>
      )}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUpload;
