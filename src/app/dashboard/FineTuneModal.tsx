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
} from "@mui/material";

interface FineTuneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { modelName: string; description?: string }) => void;
}

const FineTuneModal: React.FC<FineTuneModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState(false);

  const handleSubmit = () => {
    if (!modelName.trim()) {
      setNameError(true);
      return;
    }

    onSubmit({
      modelName: modelName.trim(),
      description: description.trim() || undefined,
    });

    // Reset form
    setModelName("");
    setDescription("");
    setNameError(false);
  };

  const handleClose = () => {
    // Reset form
    setModelName("");
    setDescription("");
    setNameError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="span" fontWeight={600}>
          Model Fine-tuning
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Train an AI model using your selected images. Specify a model name and optionally add a description.
          </Typography>

          <TextField
            label="Model Name"
            fullWidth
            required
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value);
              setNameError(false);
            }}
            error={nameError}
            helperText={nameError ? "Model name is required" : ""}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description about the model's characteristics or purpose."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            background: "linear-gradient(135deg, #ff4081, #7b61ff)",
            "&:hover": {
              background: "linear-gradient(135deg, #f50057, #6a1b9a)",
            },
          }}
        >
          Start Fine-tuning
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FineTuneModal;
