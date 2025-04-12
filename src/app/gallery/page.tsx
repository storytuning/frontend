"use client";

import Gallery from "./Gallery";
import { Container, Typography } from "@mui/material";

export default function GalleryPage() {
  const walletAddress = null;

  if (!walletAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Connect your wallet to view generated images
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 4,
          background: "linear-gradient(135deg, #ff4081, #7b61ff)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        My Generated Images
      </Typography>

      <Gallery walletAddress={walletAddress} />
    </Container>
  );
}
