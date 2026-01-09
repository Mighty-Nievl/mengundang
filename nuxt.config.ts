// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@sentry/nuxt/module',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@nuxt/icon'
  ],

  // Site Config for SEO
  site: {
    url: 'https://mengundang.site',
    name: 'Mengundang',
    description: 'Platform Undangan Pernikahan Digital Premium',
    defaultLocale: 'id',
  },

  // Nuxt Fonts Config
  fonts: {
    families: [
      { name: 'Playfair Display', provider: 'google' },
      { name: 'Lato', provider: 'google' }
    ]
  },



  // Sentry Configuration
  sentry: {
    sourceMapsUploadOptions: {
      enabled: false // Disable source map upload for now (revisit if needed)
    },
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
      betterAuthUrl: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mengundang.site'),
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
      title: 'Mengundang: Platform Undangan Digital Premium #1',
      htmlAttrs: {
        lang: 'id'
      },
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Mengundang",
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
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://mengundang.site",
            "name": "Mengundang",
            "description": "Platform pembuatan undangan pernikahan digital premium dengan desain eksklusif dan mewah.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://mengundang.site/search?q={search_term_string}",
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
        { name: 'author', content: 'Mengundang' },
        { name: 'theme-color', content: '#1C1917' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mengundang' },
        { property: 'og:title', content: 'Mengundang: Platform Undangan Digital Premium' },
        { property: 'og:description', content: 'Buat undangan pernikahan digital berkelas dengan Mengundang.' },
        { property: 'og:image', content: 'https://mengundang.site/cover.png' },
        { property: 'og:url', content: 'https://mengundang.site' },
        { property: 'og:locale', content: 'id_ID' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mengundang: Wedding Invitation Premium' },
        { name: 'twitter:description', content: 'Platform undangan pernikahan digital premium Indonesia.' },
        { name: 'twitter:image', content: 'https://mengundang.site/cover.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png?v=3' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=3' },
        { rel: 'apple-touch-icon', href: '/favicon.png?v=3' },
        { rel: 'canonical', href: 'https://mengundang.site' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Icons: Font Awesome
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }
      ]
    },
    buildAssetsDir: '/_nuxt/',
  },
  experimental: {
    appManifest: false
  },

  // Build Optimizations
  sourcemap: {
    server: false,
    client: false
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    // Pre-generate sitemap during build time (Zero Runtime)
    xsl: false,
  },

  nitro: {
    preset: 'cloudflare-pages',
    minify: false,
    sourceMap: false,
    experimental: {
      tasks: true,
    },
    // externals: {
    //   external: ['bun:sqlite']
    // }
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
