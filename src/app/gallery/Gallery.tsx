import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useGalleryLoader from "../../hooks/useGalleryLoader";

interface GalleryProps {
  walletAddress: string | null;
}

const Gallery: React.FC<GalleryProps> = ({ walletAddress }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();

  // 갤러리 이미지 로딩
  const { images, loading, error } = useGalleryLoader(walletAddress);

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

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 검색 기능
  const filteredImages = searchTerm.trim()
    ? images.filter(
        (image) =>
          image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.modelName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  if (!walletAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: 4,
            color: theme.palette.text.secondary,
          }}
        >
          갤러리를 보려면 지갑을 연결해주세요
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
            background: "linear-gradient(135deg, #ff4081, #7b61ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          내 생성 이미지 갤러리
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          내가 생성한 이미지 컬렉션을 확인해보세요
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="프롬프트나 모델 이름으로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{
            maxWidth: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <Skeleton variant="rectangular" height={300} animation="wave" />
                <CardContent>
                  <Skeleton
                    animation="wave"
                    height={24}
                    width="60%"
                    sx={{ mb: 1 }}
                  />
                  <Skeleton animation="wave" height={16} width="90%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredImages.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          {searchTerm ? (
            <Typography variant="h6" color="text.secondary">
              검색 결과가 없습니다
            </Typography>
          ) : (
            <Typography variant="h6" color="text.secondary">
              생성된 이미지가 없습니다
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredImages.map((image) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={image.cid}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={image.url}
                  alt={image.prompt}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={image.modelName}
                      size="small"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {image.prompt}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(image.createdAt)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Tooltip title="프롬프트 복사">
                    <IconButton onClick={() => handleCopyPrompt(image.prompt)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="이미지 다운로드">
                    <IconButton
                      onClick={() =>
                        downloadImage(image.url, `generated_${image.cid}.png`)
                      }
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Gallery;
