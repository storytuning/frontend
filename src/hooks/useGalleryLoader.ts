import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface GeneratedImage {
  cid: string;
  prompt: string;
  url: string;
  modelName: string;
  modelOwner: string;
  createdAt: string;
}

// API 응답 타입 명시
interface ApiResponse {
  success: boolean;
  data: GeneratedImage[];
}

export const useGalleryLoader = (walletAddress: string | null) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!walletAddress) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/generated-images/${walletAddress}`
      );

      if (response.data.success) {
        setImages(response.data.data);
      } else {
        throw new Error("Failed to load gallery images");
      }
    } catch (err) {
      setError("갤러리 이미지 로딩 중 오류가 발생했습니다");
      console.error("갤러리 로딩 실패:", err);

      // 개발 환경에서 목업 데이터 제공
      if (process.env.NODE_ENV === "development") {
        const mockImages: GeneratedImage[] = [
          {
            cid: "mock1",
            prompt: "고양이가 모자를 쓰고 있는 만화 스타일의 이미지",
            url: "https://picsum.photos/seed/mock1/500/500",
            modelName: "고양이 모델",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock2",
            prompt: "바다 위의 요트, 석양이 비치는 풍경",
            url: "https://picsum.photos/seed/mock2/500/500",
            modelName: "풍경 모델",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock3",
            prompt: "네온 불빛이 있는 미래적인 도시 풍경",
            url: "https://picsum.photos/seed/mock3/500/500",
            modelName: "도시 모델",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock4",
            prompt: "쿠키와 우유가 있는 테이블",
            url: "https://picsum.photos/seed/mock4/500/500",
            modelName: "음식 모델",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
        ];

        setImages(mockImages);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchImages();
  }, [walletAddress, fetchImages]);

  const refetchImages = useCallback(() => {
    return fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refetchImages };
};

export default useGalleryLoader;
