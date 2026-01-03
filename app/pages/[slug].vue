<script setup lang="ts">
import FloatingMusic from '~/components/FloatingMusic.vue'
import CoverSection from '~/components/CoverSection.vue'
import SingleProfile from '~/components/SingleProfile.vue'
import EventDetails from '~/components/EventDetails.vue'
import GallerySection from '~/components/GallerySection.vue'
import GiftSection from '~/components/GiftSection.vue'
import RSVPSection from '~/components/RSVPSection.vue'
import CountdownSection from '~/components/CountdownSection.vue'
import { animate, stagger } from 'motion'

const route = useRoute()
const slug = route.params.slug as string

const { data: content, error } = await useFetch('/api/v2-content', {
    params: { slug, v: Date.now() }
})

if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })
}

const isDataComplete = computed(() => {
    const hero = content.value?.hero
    const akad = content.value?.events?.akad
    return hero?.groomNickname !== 'Groom' && 
           hero?.brideNickname !== 'Bride' && 
           akad?.location && 
           akad?.location !== ''
})

const isOwnerOrPartner = computed(() => {
    const user = (content as any).value?._auth
    return user?.isAuthorized || false
})

const handleOpen = () => {
    if (!isDataComplete.value) {
        if (isOwnerOrPartner.value) {
            alert('Halo Owner! Data undanganmu belum lengkap. Silakan lengkapi di Dashboard agar undangan bisa dilihat tamu.')
            navigateTo('/dashboard')
        } else {
             alert('Undangan belum siap.')
        }
        return
    }
    
    isOpened.value = true
    // Play music after user interaction (allowed by browsers)
    nextTick(() => {
        if (audioPlayer.value && typeof audioPlayer.value.playMusic === 'function') {
            audioPlayer.value.playMusic()
        }
    })
}

const isOpened = ref(route.query.preview === 'true')
const activeSection = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
const audioPlayer = ref(null)

// Scroll to specific section index
const scrollToSection = (index: number) => {
    if (scrollContainer.value) {
        const height = window.innerHeight
        scrollContainer.value.scrollTo({
            top: index * height,
            behavior: 'smooth'
        })
    }
}

// Handle scroll event to update active dot
const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    const height = window.innerHeight
    const scrollTop = target.scrollTop
    
    // Calculate current section index based on scroll position
    const index = Math.round(scrollTop / height)
    if (activeSection.value !== index) {
        activeSection.value = index
    }
}

onMounted(() => {
    // 1. Check for tab=galeri
    if (route.query.tab === 'galeri') {
        isOpened.value = true
        // Allow time for DOM to render before scrolling
        nextTick(() => {
            // Gallery is at index 6 (based on 0-index in template v-for)
            // But let's verify visual index:
            // 0: Header, 1: Countdown, 2: Groom, 3: Bride, 4: Events, 5: Gallery
            // Wait, template has:
            // 1. Header (Index 0)
            // 2. Countdown (Index 1)
            // 3. Groom (Index 2)
            // 4. Bride (Index 3)
            // 5. Event Details (Index 4)
            // 6. Gallery (Index 5)
             scrollToSection(5)
        })
    }
    
    // 2. Real-time Preview Listener
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'PREVIEW_UPDATE' && event.data?.data) {
             // Deep merge or direct assignment depending on structure
             // For simplicity in this stack, we direct assign specific keys or the whole object if compatible
             const newData = event.data.data
             if (content.value) {
                 // Update known sections to trigger reactivity
                 if(newData.hero) content.value.hero = newData.hero
                 if(newData.cover) content.value.cover = newData.cover
                 if(newData.groom) content.value.groom = newData.groom
                 if(newData.bride) content.value.bride = newData.bride
                 if(newData.events) content.value.events = newData.events
                 if(newData.gallery) content.value.gallery = newData.gallery
                 if(newData.gift) content.value.gift = newData.gift
                 if(newData.rsvp) content.value.rsvp = newData.rsvp
                 if(newData.meta) content.value.meta = newData.meta
                 if(newData.music) content.value.music = newData.music
             }
        }
    })
})

useHead({
  title: computed(() => content.value?.meta?.title || 'Wedding Invitation'),
  meta: [
    { name: 'referrer', content: 'no-referrer' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    { name: 'description', content: computed(() => content.value?.meta?.description || '') },
    // Open Graph
    { property: 'og:title', content: computed(() => content.value?.meta?.title || 'Wedding Invitation') },
    { property: 'og:description', content: computed(() => content.value?.meta?.description || '') },
    { property: 'og:image', content: computed(() => {
        let img = content.value?.meta?.image || content.value?.groom?.image || ''
        const ver = content.value?.meta?.updatedAt || Date.now()
        
        // Ensure Absolute URL for WhatsApp/FB
        if (img && !img.startsWith('http')) {
             try {
                const url = useRequestURL()
                img = `${url.origin}${img}`
             } catch (e) { /* Fallback if client-side/error */ }
        }
        
        return img ? `${img}?v=${ver}` : ''
    })},
    { property: 'og:type', content: 'website' },
    { property: 'fb:app_id', content: '966242223397117' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => content.value?.meta?.title || '') },
    { name: 'twitter:description', content: computed(() => content.value?.meta?.description || '') },
    { name: 'twitter:image', content: computed(() => {
        let img = content.value?.meta?.image || content.value?.groom?.image || ''
        const ver = content.value?.meta?.updatedAt || Date.now()
        
         if (img && !img.startsWith('http')) {
             try {
                const url = useRequestURL()
                img = `${url.origin}${img}`
             } catch (e) { }
        }

        return img ? `${img}?v=${ver}` : ''
    })},
  ],
})
</script>




<template>
  <div class="page-wrapper-root" data-theme="original"> <!-- Root Wrapper to fix Fragment/End-Tag Issues -->
      <div v-if="content" class="min-h-screen w-full relative bg-stone-50 font-sans" :class="{ 'overflow-hidden h-screen': !isOpened }">
        
        <!-- 0. INCOMPLETE DATA WARNING (FULL PAGE) -->
        <div v-if="!isDataComplete" class="fixed inset-0 z-[100] bg-stone-50 flex items-center justify-center p-6 text-center">
            <div class="max-w-md space-y-6">
                <div class="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-5xl mb-6">
                    <i class="fas fa-hammer"></i>
                </div>
                
                <!-- OWNER VIEW -->
                <div v-if="isOwnerOrPartner">
                   <h2 class="text-3xl font-serif font-bold text-stone-800 mb-2">Halo, Kak!</h2>
                   <p class="text-stone-500">Undangan ini belum lengkap datanya. Tamu tidak bisa melihat undangan ini sampai kakak melengkapinya di dashboard.</p>
                   
                    <div class="pt-6 mt-6 border-t border-stone-200">
                        <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 bg-gold-500 text-stone-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <i class="fas fa-edit"></i>
                            Lengkapi Data Sekarang
                        </NuxtLink>
                    </div>
                </div>

                <!-- GUEST VIEW -->
                <div v-else>
                   <h2 class="text-3xl font-serif font-bold text-stone-800 mb-2">Undangan Belum Siap</h2>
                   <p class="text-stone-500">Undangan ini sedang dalam proses pembuatan dan belum dipublikasikan oleh pemilik.</p>
                   
                   <div class="pt-6 mt-6 border-t border-stone-200 text-xs text-stone-400 italic">
                        Silakan kunjungi halaman ini beberapa saat lagi.
                   </div>
                </div>
            </div>
        </div>


        <!-- MAIN CONTENT (Only Render if Data Complete) -->
        <template v-else>
            <!-- CHECK: Removed isOpened logic wrapper from here, applied directly to CoverSection logic -->
            
            <!-- MAIN CONTENT (Full Page Scroll Container) -->
            <!-- h-screen + overflow-y-scroll + snap-y mandatory creates the snap effect -->
            <div 
            v-if="!isOpened"
            class="hidden"
            ></div>
            
            <div 
            v-else
            @scroll="handleScroll"
            ref="scrollContainer"
            class="h-full w-full overflow-y-auto scroll-smooth bg-stone-50 md:px-0 relative no-scrollbar"
            >
            
            <!-- 1. Header Section -->
            <section 
                class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 relative overflow-hidden transition-all duration-700"
            >
                <!-- Background Image Fix for Referrer Policy -->
                <div v-if="content?.hero?.backgroundImage" class="absolute inset-0">
                    <img :src="content.hero.backgroundImage" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                </div>
                <!-- Optional Overlay for Contrast -->
                <div v-if="content?.hero?.backgroundImage" class="absolute inset-0 bg-black/40 z-0"></div>

                <div class="text-center space-y-4 relative z-10" :class="{'text-white': content?.hero?.backgroundImage}">
                    <h3 class="font-sans text-xs tracking-[0.3em] font-bold uppercase transition-colors" :class="content?.hero?.backgroundImage ? 'text-gold-200' : 'text-gold-600'">Wedding Invitation</h3>
                    <h2 class="font-serif text-5xl leading-tight transition-colors" :class="content?.hero?.backgroundImage ? 'text-white' : 'text-stone-800'">
                    {{ content?.hero?.groomNickname }} <br> 
                    <span class="text-3xl" :class="content?.hero?.backgroundImage ? 'text-stone-300' : 'text-stone-400'">&amp;</span> <br> 
                    {{ content?.hero?.brideNickname }}
                    </h2>
                    <p class="italic transition-colors" :class="content?.hero?.backgroundImage ? 'text-stone-200' : 'text-stone-500'">{{ content?.hero?.date }}</p>
                </div>
                
                <!-- UX: Elegant Gradient Overlay -->
                <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent z-10 pointer-events-none"></div>
            </section>
            
            <!-- 2. Countdown Section -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
                <CountdownSection :target-date="content?.events?.akad?.isoDate || new Date().toISOString()"></CountdownSection>
            </section>

            <!-- 3. Groom Profile -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
                <SingleProfile :profile="content?.groom || {}" title="The Groom"></SingleProfile>
            </section>

            <!-- 4. Bride Profile -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-50 px-4">
                <SingleProfile :profile="content?.bride || {}" title="The Bride"></SingleProfile>
            </section>

            <!-- 5. Event Details -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
                <EventDetails :events="content?.events || {}"></EventDetails>
            </section>
            
            <!-- 6. Gallery -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
                <GallerySection :images="content?.gallery"></GallerySection>
            </section>
            
            <!-- 7. Gift -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
                <GiftSection :gift="content?.gift || {}"></GiftSection>
            </section>
            
            <!-- 8. RSVP -->
            <section class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
                <RSVPSection 
                    :rsvp="content?.rsvp || {}" 
                    :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                    :is-authorized="(content as any)?._auth?.isAuthorized || false"
                ></RSVPSection>
            </section>

            <!-- 9. Footer -->
            <section class="min-h-[50vh] w-full flex flex-col items-center justify-end pb-10 snap-start snap-always reveal-on-scroll">
                <div class="text-center text-xs text-stone-400">
                    <p>© 2025 {{ content?.hero?.groomNickname }} &amp; {{ content?.hero?.brideNickname }}. All Rights Reserved.</p>
                    <p>Created with Love by Undangan</p>
                </div>
            </section>

            </div>
            

            <!-- COVER SECTION -->
            <CoverSection 
            @open="handleOpen" 
            :groom-name="content?.hero?.groomNickname || ''" 
            :bride-name="content?.hero?.brideNickname || ''" 
            :date="content?.hero?.date || ''"
            :background-image="content?.cover?.backgroundImage || ''"
            :guest-name="(route.query.to as string)"
            ></CoverSection>

            <!-- FLOATING MUSIC -->
            <ClientOnly>
                <FloatingMusic 
                ref="audioPlayer" 
                :url="content?.music?.url || ''" 
                :start-time="content?.music?.startTime || 0"
                :fade="content?.music?.fade || false"
                ></FloatingMusic>
            </ClientOnly>
        </template>

      </div>
      
      <!-- UX: Premium Loading Screen -->
      <div v-else class="h-screen w-full flex flex-col items-center justify-center bg-stone-50 gap-4">
          <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-2 border-stone-200 rounded-full"></div>
              <div class="absolute inset-0 border-2 border-gold-500 rounded-full border-t-transparent animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center font-serif text-gold-600 font-bold text-lg animate-pulse">
                  &amp;
              </div>
          </div>
          <p class="text-xs uppercase tracking-[0.2em] text-stone-400 animate-pulse">Loading Invitation</p>
      </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>


