// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  app: {
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
        { property: 'og:locale', content: 'ms_MY' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Kalkulator Zakat Emas & Perak' },
        { name: 'twitter:description', content: 'Kalkulator zakat emas dan perak mengikut kadar semasa.' },
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
      icons: [/* ... */],
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
