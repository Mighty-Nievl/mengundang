<script setup lang="ts">
import OriginalTheme from '~/components/themes/OriginalTheme.vue'
import KunikaaTheme from '~/components/themes/KunikaaTheme.vue'
import MidnightTheme from '~/components/themes/MidnightTheme.vue'
import GununganTheme from '~/components/themes/GununganTheme.vue'

const route = useRoute()
const config = useRuntimeConfig()
const slug = route.params.slug as string

// Type for SEO metadata
interface SeoMetaData {
    title: string
    description: string
    image: string
    groomName?: string
    brideName?: string
    weddingDate?: string
}

// Fetch SEO metadata server-side for Open Graph tags
// This runs on server for SSR, enabling social media crawlers to read OG tags
const { data: seoMeta } = await useFetch<SeoMetaData>('/api/seo-meta', {
    key: `seo-${slug}`,
    params: { slug },
    server: true // SSR: necessary for OG tags
})

// Fetch full content client-side (auth-aware, heavier)
const { data: content, error, refresh: refreshNuxtData } = await useFetch('/api/v2-content', {
    key: `invitation-${slug}`,
    params: { slug },
    server: false // Client-side: auth-aware
})

if (error.value) {
    console.error('API Error Details:', {
        statusCode: error.value?.statusCode,
        message: error.value?.message,
        data: error.value?.data
    })
}

// Dynamic Theme Resolution
const themeComponent = computed(() => {
    const rawTheme = (route.query.theme as string) || content.value?.theme || content.value?.meta?.theme || 'original'
    const theme = rawTheme?.toLowerCase()
    
    if (theme === 'kunikaa') return KunikaaTheme
    if (theme === 'midnight') return MidnightTheme
    if (theme === 'gunungan') return GununganTheme
    return OriginalTheme
})

// Build full URL for OG image and URL
const siteUrl = config.public?.siteUrl || 'https://mengundang.site'
const pageUrl = `${siteUrl}/${slug}`

// SEO Meta using server-fetched data
// Note: og:image uses proxied URL from seo-meta API which handles watermarking
useSeoMeta({
    title: () => seoMeta.value?.title || `The Wedding of ${content.value?.hero?.groomNickname || 'Groom'} & ${content.value?.hero?.brideNickname || 'Bride'}`,
    description: () => seoMeta.value?.description || 'Undangan pernikahan digital premium.',
    ogType: 'website',
    ogTitle: () => seoMeta.value?.title || `Pernikahan ${content.value?.hero?.groomNickname || 'Groom'} & ${content.value?.hero?.brideNickname || 'Bride'}`,
    ogDescription: () => seoMeta.value?.description || 'Kami mengundang Anda untuk hadir di pernikahan kami.',
    ogImage: () => seoMeta.value?.image || 'https://mengundang.site/cover.png',
    ogUrl: pageUrl,
    ogSiteName: 'Mengundang',
    twitterCard: 'summary_large_image',
    twitterTitle: () => seoMeta.value?.title || 'Undangan Pernikahan',
    twitterDescription: () => seoMeta.value?.description || 'Undangan pernikahan digital premium.',
    twitterImage: () => seoMeta.value?.image || 'https://mengundang.site/cover.png',
})
</script>

<template>
  <div class="page-wrapper-root">
      
      <!-- ERROR STATE -->
      <div v-if="error" class="h-screen w-full flex flex-col items-center justify-center bg-stone-950 px-6 text-center">
          <div class="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
              <i class="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <h2 class="text-2xl font-serif font-bold text-white mb-2">Terjadi Kesalahan</h2>
          <p class="text-stone-400 max-w-md mb-8">{{ error.message || 'Gagal memuat data undangan.' }} ({{ error.statusCode }})</p>
          
          <button @click="() => refreshNuxtData()" class="px-6 py-3 bg-white text-stone-900 rounded-lg font-bold hover:bg-gold-500 transition-colors shadow-lg">
              <i class="fas fa-sync-alt mr-2"></i> Coba Lagi
          </button>
      </div>

      <!-- LOADING STATE -->
      <div v-else-if="!content" class="h-screen w-full flex flex-col items-center justify-center bg-stone-50 gap-4">
          <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-2 border-stone-200 rounded-full"></div>
              <div class="absolute inset-0 border-2 border-gold-500 rounded-full border-t-transparent animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center font-serif text-gold-600 font-bold text-lg animate-pulse">
                  &amp;
              </div>
          </div>
          <p class="text-xs uppercase tracking-[0.2em] text-stone-400 animate-pulse">Loading Invitation</p>
      </div>

      <!-- THEME CONTENT -->
      <component v-else :is="themeComponent" :content="content" />

  </div>
</template>


