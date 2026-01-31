import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    Icons({
      autoInstall: true,
    }),
  ],
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