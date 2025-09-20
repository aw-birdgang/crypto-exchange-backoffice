import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env': 'import.meta.env',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@crypto-exchange/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 관련 라이브러리
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          // Ant Design 관련
          if (id.includes('antd') || id.includes('@ant-design')) {
            return 'antd';
          }
          // 라우팅 관련
          if (id.includes('react-router')) {
            return 'router';
          }
          // 상태 관리
          if (id.includes('zustand')) {
            return 'state';
          }
          // HTTP 클라이언트
          if (id.includes('axios')) {
            return 'http';
          }
          // 유틸리티
          if (id.includes('dayjs') || id.includes('lodash')) {
            return 'utils';
          }
          // 차트 라이브러리
          if (id.includes('recharts')) {
            return 'charts';
          }
          // node_modules의 다른 라이브러리들
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 청크 파일명 최적화
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // 특정 함수 제거
      },
      mangle: {
        safari10: true, // Safari 10 호환성
      },
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      'react-router-dom',
      'zustand',
      'axios',
      'dayjs',
    ],
  },
});
