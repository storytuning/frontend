"use client";

import React from "react";
import { Container, Typography, Box, Paper, useTheme } from "@mui/material";
import ImageUpload from "./ImageUpload";

interface UploadProps {
  walletAddress: string | null;
  isStoryChainConnected: boolean;
}

const Upload: React.FC<UploadProps> = ({
  walletAddress,
  isStoryChainConnected,
}) => {
  const theme = useTheme();
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: theme.typography.h3.fontWeight,
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
            textShadow: `0 0 30px ${theme.palette.primary.main}33`,
          }}
        >
          Upload Your IP, Own Your Model
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.8,
            color: theme.palette.text.secondary,
          }}
        >
          Turn your art into trainable datasets. Create, fine-tune, and monetize
          your AI models.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: "32px",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}1A 0%, ${theme.palette.secondary.main}1A 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.palette.primary.main}33`,
          boxShadow: `0 4px 30px ${theme.palette.primary.main}33`,
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: `0 0 20px ${theme.palette.primary.main}33`,
            }}
          >
            Create Your Own AI Model
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Upload your images to create a unique dataset that will be used to
            train your personalized AI model.
          </Typography>
        </Box>
        <ImageUpload
          walletAddress={walletAddress}
          isStoryChainConnected={isStoryChainConnected}
        />
      </Paper>
    </Container>
  );
};

export default Upload;
