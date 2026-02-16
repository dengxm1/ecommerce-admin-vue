import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vite.dev/config/
export default defineConfig(({command, mode}) => {
  const base = command === 'serve' ? '/' : '/ecommerce/'
 return {
  base: base,
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'element-plus': [
            'ElMessage',
            'ElMessageBox',
            'ElNotification',
            'ElLoading'
          ]
        }
      ],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/eapi': {
        target: 'http://localhost:8081', // 后端地址
        changeOrigin: true
      }
    }
  }
}
})
