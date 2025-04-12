"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Button, Box, Stack } from "@mui/material";
import { UploadFile, Dashboard } from "@mui/icons-material";
import { useAccount } from "wagmi";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h2"
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
          Welcome to Story IP
        </Typography>

        <Typography variant="h5" color="text.secondary" paragraph>
          Manage your digital assets securely with Story Protocol
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<UploadFile />}
            onClick={() => router.push("/upload")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "50px",
              background: "linear-gradient(135deg, #00bcd4, #2196f3)",
              "&:hover": {
                background: "linear-gradient(135deg, #00a0b7, #1976d2)",
              },
            }}
          >
            Upload Images
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<Dashboard />}
            onClick={() => router.push("/dashboard")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "50px",
              background: "linear-gradient(135deg, #ff4081, #7b61ff)",
              "&:hover": {
                background: "linear-gradient(135deg, #f50057, #6a1b9a)",
              },
            }}
          >
            View Dashboard
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
