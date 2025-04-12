import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface ImageData {
  id?: string;
  cid: string;
  fileName: string;
  size: number;
  mimeType: string;
  timestamp: string;
  creatorAddress?: string;
  tokenId?: string;
  mintedAt?: string;
  ipId?: string;
  licenseTermsIds?: string[];
}

export const useImageLoader = (walletAddress: string | null) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
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
      
      const response = await axios.get<ImageData[]>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/images/${walletAddress}`
      );
      
      // 파일명 디코딩
      const decodedImages = response.data.map(image => ({
        ...image,
        fileName: decodeFileName(image.fileName)
      }));
      
      setImages(decodedImages);
    } catch (error) {
      setError("Error loading images.");
      console.error("Image loading failed:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // 한글 파일명 디코딩 함수
  const decodeFileName = (fileName: string): string => {
    try {
      // URL 인코딩된 문자열 처리
      if (/%[0-9A-F]{2}/.test(fileName)) {
        return decodeURIComponent(fileName);
      }
      // URI 컴포넌트로 인코딩된 경우 처리
      return fileName;
    } catch (error) {
      console.error("Filename decoding error:", error);
      return fileName; // 오류 발생 시 원본 반환
    }
  };

  useEffect(() => {
    fetchImages();
  }, [walletAddress, fetchImages]);

  const refetchImages = useCallback(() => {
    return fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refetchImages, setImages };
};

export default useImageLoader;
