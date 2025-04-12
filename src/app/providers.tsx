'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '../config/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 테마 설정
const theme = createTheme({
  // 테마 설정 유지
});

// React Query 클라이언트 생성
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  // 클라이언트 사이드 렌더링 관리
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* hydration 이슈를 방지하기 위해 마운트될 때만 내용 표시 */}
          {mounted ? children : null}
        </ThemeProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}