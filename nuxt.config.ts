// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: [
    '~/styles/index.css',
    '~/styles/background.scss',
  ],
  devtools: { enabled: true },
  plugins: [
    '~/plugins/fontawesome.ts',
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxt/eslint', ['@pinia/nuxt',
  {
    autoImports: [
      // 自动引入 `defineStore()`
      'defineStore',
      // 自动引入 `defineStore()` 并重命名为 `definePiniaStore()`
      ['defineStore', 'definePiniaStore'],
    ],
  }], 'pinia-plugin-persistedstate/nuxt', '@nuxt/image'],
  image: {
    dir: 'public',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  typescript: {
    typeCheck: true
  },
  ssr: true,
  // 添加运行时配置
  runtimeConfig: {
    // 私有密钥，仅在服务器端可用
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    // 公共密钥，在客户端也可用
    public: {
      apibase: '/api'
    }
  },
  build: {
    transpile: ['vue-toastification']
  }
})