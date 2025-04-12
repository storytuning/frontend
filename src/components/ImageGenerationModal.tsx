import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Slider,
  CircularProgress,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  GetApp as DownloadIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { generateImage } from "../utils/api";

interface GeneratedImage {
  cid: string;
  prompt: string;
  url: string;
  modelName: string;
  modelOwner: string;
  createdAt: string;
}

interface ImageGenerationModalProps {
  open: boolean;
  onClose: () => void;
  modelName: string;
  modelOwner: string;
  walletAddress: string;
  onSuccess: (images: any[]) => void;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  open,
  onClose,
  modelName,
  modelOwner,
  walletAddress,
  onSuccess,
}) => {
  const [prompt, setPrompt] = useState("");
  const [numOfImages, setNumOfImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const theme = useTheme();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await generateImage({
        modelName,
        modelOwnerAddress: modelOwner,
        walletAddress,
        prompt,
        numOfImages,
      });

      setGeneratedImages(response.data.images);
      onSuccess(response.data.images);
    } catch (err) {
      console.error("Image generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating the image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt("");
    setNumOfImages(1);
    setGeneratedImages([]);
    setError("");
    onClose();
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadImage = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="span">
          Generate Image
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" component="div">
          Model: {modelName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <TextField
            label="Prompt"
            fullWidth
            multiline
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate in detail"
            helperText="Example: A cat looking at the ocean, watercolor style"
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Number of images: {numOfImages}
            </Typography>
            <Slider
              value={numOfImages}
              onChange={(_, value) => setNumOfImages(value as number)}
              step={1}
              marks
              min={1}
              max={4}
              valueLabelDisplay="auto"
            />
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                my: 4,
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Generating images...</Typography>
            </Box>
          )}

          {generatedImages.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generated Images
              </Typography>
              <Grid container spacing={2}>
                {generatedImages.map((image, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.url}
                        alt={`Generated Image ${index + 1}`}
                        sx={{ objectFit: "contain" }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>

        {!generatedImages.length && (
          <Button
            onClick={handleGenerateImage}
            variant="contained"
            disabled={loading || !prompt.trim()}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #ff4081, #7b61ff)",
              "&:hover": {
                background: "linear-gradient(135deg, #f50057, #6a1b9a)",
              },
            }}
          >
            Generate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImageGenerationModal;
