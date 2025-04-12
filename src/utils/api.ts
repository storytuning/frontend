import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 이미지 생성 API 호출
export async function generateImage({
  modelName,
  modelOwnerAddress,
  walletAddress,
  prompt,
  numOfImages = 1,
}: {
  modelName: string;
  modelOwnerAddress: string;
  walletAddress: string;
  prompt: string;
  numOfImages?: number;
}) {
  try {
    const response = await axios.post(`${API_URL}/api/generate-image`, {
      modelName,
      modelOwnerAddress,
      walletAddress,
      prompt,
      numOfImages,
    });

    return response.data;
  } catch (error: any) {
    console.error("이미지 생성 API 호출 실패:", error);
    throw new Error(error.response?.data?.error || "이미지 생성에 실패했습니다");
  }
}

// 생성된 이미지 목록 조회
export async function getGeneratedImages(walletAddress: string) {
  try {
    const response = await axios.get(
      `${API_URL}/api/generated-images/${walletAddress}`
    );
    return response.data;
  } catch (error) {
    console.error("생성된 이미지 목록 조회 실패:", error);
    throw error;
  }
} 