<script setup lang="ts">
import OriginalTheme from '~/components/themes/OriginalTheme.vue'
import KunikaaTheme from '~/components/themes/KunikaaTheme.vue'
import MidnightTheme from '~/components/themes/MidnightTheme.vue'
import GununganTheme from '~/components/themes/GununganTheme.vue'

const route = useRoute()
const slug = route.params.slug as string
const { data: content, error, refresh: refreshNuxtData } = await useFetch('/api/v2-content', {
    key: `invitation-${slug}`,
    params: { slug },
    server: false // Force Client-Side Fetch
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


// Keep SEO Meta here or move to themes?
// If themes have vastly different SEO needs, move to theme. 
// For now, basic title is common.
useHead({
    title: computed(() => `The Wedding of ${content.value?.hero?.groomNickname || 'Groom'} & ${content.value?.hero?.brideNickname || 'Bride'}`)
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


