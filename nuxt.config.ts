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
  typescript: {
    typeCheck: true
  },

  // 添加运行时配置
  runtimeConfig: {
    // 私有密钥，仅在服务器端可用
    mongodbUri: process.env.MONGODB_URI,
    
    // 公共密钥，在客户端也可用
    public: {
      // 如果需要在客户端使用一些配置，可以放在这里
    }
  }
})