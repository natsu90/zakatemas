// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  ssr: false,
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'ms' },
      title: 'Kalkulator Zakat Emas & Perak',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Kalkulator zakat emas dan perak mengikut kadar semasa. Kira zakat fizikal, digital, barang kemas dan pelaburan dengan mudah.' },
        { name: 'theme-color', content: '#d4a017' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Kalkulator Zakat Emas & Perak' },
        { property: 'og:title', content: 'Kalkulator Zakat Emas & Perak' },
        { property: 'og:description', content: 'Kalkulator zakat emas dan perak mengikut kadar semasa. Kira zakat fizikal, digital, barang kemas dan pelaburan dengan mudah.' },
        { property: 'og:image', content: '/pwa-512x512.png' },
        { property: 'og:locale', content: 'ms_MY' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Kalkulator Zakat Emas & Perak' },
        { name: 'twitter:description', content: 'Kalkulator zakat emas dan perak mengikut kadar semasa.' },
        { name: 'twitter:image', content: '/pwa-512x512.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Kalkulator Zakat Emas & Perak',
      short_name: 'Zakat Emas',
      description: 'Kalkulator zakat emas dan perak mengikut kadar semasa',
      theme_color: '#d4a017',
      background_color: '#fafafa',
      lang: 'ms',
      icons: [
        { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },
})
