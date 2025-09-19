import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import App from './App';
import { appConfig } from './config/app.config';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: appConfig.query.staleTime,
      gcTime: appConfig.query.gcTime,
      retry: (failureCount, error: any) => {
        // 401 에러는 재시도하지 않음
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < appConfig.query.retryCount;
      },
      refetchOnWindowFocus: appConfig.query.refetchOnWindowFocus,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // 401 에러는 재시도하지 않음
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={koKR}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
