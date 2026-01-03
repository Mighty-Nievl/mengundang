// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@sentry/nuxt/module'
  ],

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      tasks: true,
      webhooks: true,
    },
    externals: {
      external: ['bun:sqlite']
    }
  },

  // Sentry Configuration
  sentry: {
    sourceMapsUploadOptions: {
      enabled: false // Disable source map upload for now (revisit if needed)
    },
    clientIntegrations: {
      // Integration settings here
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },
  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    internalApiSecret: process.env.INTERNAL_API_SECRET,
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'https://undangan.zalan.web.id',
      sentry: {
        dsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
        environment: process.env.NODE_ENV || 'development',
      }
    },
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    flipSecretKey: process.env.FLIP_SECRET_KEY,
    flipValidationToken: process.env.FLIP_VALIDATION_TOKEN
  },
  app: {
    head: {
      title: 'Undangan Digital Pernikahan Mewah & Elegan #1 | Undangan.',
      htmlAttrs: {
        lang: 'id'
      },
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Undangan.",
            "operatingSystem": "Web",
            "applicationCategory": "WeddingApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "IDR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1250"
            }
          })
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://undangan.zalan.web.id",
            "name": "Undangan.",
            "description": "Platform pembuatan undangan pernikahan digital premium dengan desain eksklusif dan mewah.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://undangan.zalan.web.id/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'referrer', content: 'no-referrer' },
        { name: 'description', content: 'Buat website undangan pernikahan digital premium dengan desain eksklusif, fitur RSVP cinematic, dan real-time editor. Murah, cepat, dan mewah di Indonesia.' },
        { name: 'keywords', content: 'undangan pernikahan digital mewah, website undangan pernikahan premium, undangan digital elegan jakarta, jasa undangan online eksklusif' },
        { name: 'author', content: 'Undangan.' },
        { name: 'theme-color', content: '#1C1917' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Undangan.' },
        { property: 'og:title', content: 'Undangan Digital Pernikahan Mewah & Elegan #1' },
        { property: 'og:description', content: 'Ciptakan momen tak terlupakan dengan website undangan pernikahan digital paling premium di Indonesia.' },
        { property: 'og:image', content: 'https://undangan.zalan.web.id/cover.png' },
        { property: 'og:url', content: 'https://undangan.zalan.web.id' },
        { property: 'og:locale', content: 'id_ID' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Undangan: Wedding Invitation Premium' },
        { name: 'twitter:description', content: 'Platform undangan pernikahan digital premium Indonesia dengan fitur terlengkap.' },
        { name: 'twitter:image', content: 'https://undangan.zalan.web.id/cover.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png?v=3' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=3' },
        { rel: 'apple-touch-icon', href: '/favicon.png?v=3' },
        { rel: 'canonical', href: 'https://undangan.zalan.web.id' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Premium Fonts: Playfair Display (Serif) & Lato (Sans)
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
        // Icons: Font Awesome
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }
      ]
    },
    buildAssetsDir: '/_nuxt/',
  },
  experimental: {
    appManifest: false
  },


  routeRules: {
    // Assets in public/ folder (like favicons) - Temporary low cache for debugging
    '/favicon.**': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/logo_loader.png': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/cover.png': { headers: { 'Cache-Control': 'public, max-age=3600' } },
    '/banner.png': { headers: { 'Cache-Control': 'public, max-age=3600' } },

    // Don't cache HTML pages to prevent 404s on new deployments
    // Using a more specific pattern for pages
    '/': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/pricing': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/dashboard': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/admin/**': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/editor/**': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    '/payment/**': { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },

    // Cache Nuxt build assets for performance
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
  }
})
