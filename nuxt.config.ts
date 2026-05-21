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
        { name: 'theme-color', content: '#e2b34a' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://zakatemas.app/' },
        { property: 'og:site_name', content: 'ZakatEmas' },
        { property: 'og:title', content: 'ZakatEmas — Kalkulator Zakat Emas & Perak' },
        { property: 'og:description', content: 'Harga spot harian, nisab automatik, dan uruf khusus 13 negeri — disimpan terus dalam telefon anda.' },
        { property: 'og:image', content: 'https://zakatemas.app/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'ms_MY' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ZakatEmas — Kalkulator Zakat Emas & Perak' },
        { name: 'twitter:description', content: 'Harga spot harian, nisab automatik, dan uruf khusus 13 negeri — disimpan terus dalam telefon anda.' },
        { name: 'twitter:image', content: 'https://zakatemas.app/og-image.png' },
        { name: 'apple-mobile-web-app-title', content: 'ZakatEmas' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      script: [
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-GWMVH6M68Z', async: true },
        { innerHTML: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-GWMVH6M68Z')" },
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
      short_name: 'ZakatEmas',
      description: 'Kalkulator zakat emas dan perak mengikut kadar semasa',
      theme_color: '#e2b34a',
      background_color: '#0d0b08',
      lang: 'ms',
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: '/',
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
