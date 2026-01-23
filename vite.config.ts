import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 保留原有别名配置
    }
  },
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '5174'), // 默认5174，支持环境变量切换
    strictPort: true, // 端口被占用时直接报错，不自动切换（避免混乱）
    
    proxy: {
      '/api': {
        // 动态指向后端端口，支持BACKEND_PORT环境变量，默认8081
        target: `http://127.0.0.1:${process.env.BACKEND_PORT || '8081'}`,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 移除 rewrite，后端路由包含 /api
      }
    }
  }
})