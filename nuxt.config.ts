// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Nuxt4 PouchDB PWA',
      short_name: 'PouchPWA',
      theme_color: '#ffffff',
      icons: [/* ... */],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
