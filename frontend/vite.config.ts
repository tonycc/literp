import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle 可视化分析
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    // 目标浏览器版本
    target: 'es2020',
    // 启用最小化压缩
    minify: 'esbuild',
    // CSS 代码分割
    cssCodeSplit: true,
    // 报告压缩后大小
    reportCompressedSize: true,
    // Chunk 大小警告阈值 (KB)
    chunkSizeWarningLimit: 1000,

    // 手动代码分块
    rollupOptions: {
      output: {
        manualChunks: {
          // React 生态
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design 生态
          'antd-vendor': [
            'antd',
            '@ant-design/pro-components',
            '@ant-design/pro-layout',
          ],
          // UI 相关
          'ui-vendor': ['lucide-react', 'dayjs'],
          // HTTP 客户端
          'http-vendor': ['axios'],
          // 共享代码
          'shared': ['@shared'],
        },

        // Chunk 文件名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
      },
    },

    // 启用 Source Map
    sourcemap: true,
  },

  // 开发服务器优化
  server: {
    // 启用热更新
    hmr: true,
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/**/*.{ts,tsx,jsx,js}'],
    },
  },

  // 优化依赖
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'axios',
      'dayjs',
    ],
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/types/**',
        '**/constants/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
