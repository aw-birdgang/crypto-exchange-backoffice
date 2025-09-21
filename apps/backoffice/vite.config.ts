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
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Form 관련
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          // Validation
          if (id.includes('zod')) {
            return 'validation';
          }
          // node_modules의 다른 라이브러리들
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 청크 파일명 최적화
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console 제거
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'], // 특정 함수 제거
        passes: 2, // 압축 패스 수 증가
      },
      mangle: {
        safari10: true, // Safari 10 호환성
        toplevel: true, // 최상위 스코프 변수명 변경
      },
      format: {
        comments: false, // 주석 제거
      },
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 에셋 인라인 임계값
    assetsInlineLimit: 4096,
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
