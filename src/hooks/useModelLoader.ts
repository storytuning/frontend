import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface ModelData {
  modelName: string;
  walletAddress: string;
  description?: string;
  status: string;
  selectedCids: string[];
  selectedIpIds: string[];
  selectedLicenseTermsIds: string[];
  createdAt: string;
  updatedAt: string;
  modelCid?: string;
  error?: string;
  modelIpfsHash?: string;
}

interface ApiResponse {
  success: boolean;
  data: ModelData[];
}

// 📌 특정 지갑 주소에 대한 모델만 로드
export const useModelLoader = (walletAddress: string | null) => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!walletAddress) {
      setModels([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/models/${walletAddress}`
      );

      setModels(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      setError("모델 로딩 중 오류가 발생했습니다.");
      console.error("모델 로딩 실패:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchModels();
  }, [walletAddress, fetchModels]);

  const refetchModels = useCallback(() => fetchModels(), [fetchModels]);

  return { models, loading, error, refetchModels };
};

// 전체 모델 로드
export const useAllModelsLoader = () => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/models`
      );

      console.log("모든 모델 데이터:", JSON.stringify(response.data.data, null, 2));
      console.log("첫번째 모델 세부 정보:", response.data.data[0]);

      // 중요 데이터가 있는지 확인
      if (response.data.data.length > 0) {
        const firstModel = response.data.data[0];
        console.log("모델 ID:", firstModel.modelName);
        console.log("모델 상태:", firstModel.status);
        console.log("modelIpfsHash:", firstModel.modelIpfsHash);
        console.log("selectedIpIds:", firstModel.selectedIpIds);
        console.log("selectedCids:", firstModel.selectedCids);
      }

      setModels(response.data.data);
    } catch (error) {
      setError("모델 로딩 중 오류가 발생했습니다.");
      console.error("모델 로딩 실패:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllModels();
  }, [fetchAllModels]);

  const refetchAllModels = useCallback(
    () => fetchAllModels(),
    [fetchAllModels]
  );

  return { models, loading, error, refetchAllModels };
};
