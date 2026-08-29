export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  modules: [
    '@nuxt/ui'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    public: {
      siteName: 'CCD Fiolhais',
      siteUrl: 'http://localhost:3000',
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  }
})