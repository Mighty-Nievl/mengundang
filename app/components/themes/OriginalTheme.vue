<script setup lang="ts">
import FloatingMusic from '~/components/FloatingMusic.vue'
import CoverSection from '~/components/CoverSection.vue'
import SingleProfile from '~/components/SingleProfile.vue'
import EventDetails from '~/components/EventDetails.vue'
import GallerySection from '~/components/GallerySection.vue'
import GiftSection from '~/components/GiftSection.vue'
import RSVPSection from '~/components/RSVPSection.vue'
import CountdownSection from '~/components/CountdownSection.vue'
import QuoteSection from '~/components/QuoteSection.vue'
import LoveStorySection from '~/components/LoveStorySection.vue'
import FloatingNav from '~/components/FloatingNav.vue'

const props = defineProps<{
    content: any
}>()

const route = useRoute()

// Data completeness check (can be moved to helper if needed elsewhere)
const isDataComplete = computed(() => {
    const hero = props.content?.hero
    const akad = props.content?.events?.akad
    return hero?.groomNickname !== 'Groom' && 
           hero?.brideNickname !== 'Bride' && 
           akad?.location && 
           akad?.location !== ''
})

const isOwnerOrPartner = computed(() => {
    const user = (props.content as any)?._auth
    return user?.isAuthorized || false
})

const isOpened = ref(route.query.preview === 'true')
const activeSection = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
const audioPlayer = ref<any>(null)

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

// Custom Smooth Scroll
const smoothScrollTo = (element: HTMLElement, target: number, duration: number) => {
    const start = element.scrollTop
    const change = target - start
    const startTime = performance.now()

    const animateScroll = (currentTime: number) => {
        const timeElapsed = currentTime - startTime
        
        if (timeElapsed < duration) {
            let val = timeElapsed / (duration / 2)
            if (val < 1) {
                element.scrollTop = start + (change / 2) * val * val
            } else {
                val--
                element.scrollTop = start - (change / 2) * (val * (val - 2) - 1)
            }
            requestAnimationFrame(animateScroll)
        } else {
            element.scrollTop = target
        }
    }

    requestAnimationFrame(animateScroll)
}

// Scroll to specific section index
const scrollToSection = (index: number) => {
    const sectionIds = ['header', 'countdown', 'groom', 'bride', 'events', 'gallery', 'gift', 'rsvp']
    const id = sectionIds[index]
    
    if (id) {
        const el = document.getElementById(id)
        if (el && scrollContainer.value) {
           const top = el.offsetTop
           smoothScrollTo(scrollContainer.value, top, 1200) 
           activeSection.value = index
        }
    }
}

const handleScroll = () => {
    if (!scrollContainer.value) return
    
    const scrollPosition = scrollContainer.value.scrollTop + (window.innerHeight / 2)
    const sectionIds = ['header', 'countdown', 'groom', 'bride', 'events', 'gallery', 'gift', 'rsvp']
    
    for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]!)
        if (el) {
            const { offsetTop, offsetHeight } = el
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                activeSection.value = i
                break
            }
        }
    }
}

onMounted(() => {
    handleScroll()
    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.15
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
                observer.unobserve(entry.target) 
            }
        })
    }, observerOptions)

    setTimeout(() => {
        const elements = document.querySelectorAll('.reveal-on-scroll')
        elements.forEach(el => observer.observe(el))
    }, 100)
})

useHead({
    title: computed(() => `The Wedding of ${props.content?.hero?.groomNickname || 'Groom'} & ${props.content?.hero?.brideNickname || 'Bride'}`)
})
</script>

<template>
  <div class="h-screen w-full relative bg-stone-50 font-sans overflow-hidden" data-theme="original">
    
    <!-- 0. INCOMPLETE DATA WARNING (FULL PAGE) -->
    <div v-if="!isDataComplete" class="fixed inset-0 z-[100] bg-stone-950 flex items-center justify-center p-6 text-center">
        <div class="max-w-md space-y-6">
            <div class="w-24 h-24 bg-stone-900 border border-stone-800 text-gold-500 rounded-2xl flex items-center justify-center mx-auto text-4xl mb-6 shadow-2xl shadow-black/50">
                <i class="fas fa-compass-drafting animate-pulse"></i>
            </div>
            
            <div v-if="isOwnerOrPartner">
               <h2 class="text-3xl font-serif font-bold text-white mb-2">Halo, Kak!</h2>
               <p class="text-stone-400 text-sm leading-relaxed">Undangan ini belum lengkap datanya. Tamu tidak bisa melihat undangan ini sampai kakak melengkapinya di dashboard.</p>
               
                <div class="pt-8 mt-6 border-t border-stone-800">
                    <NuxtLink to="/dashboard" class="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-xl font-bold hover:bg-gold-500 transition-all shadow-lg hover:shadow-gold-500/20 active:scale-95 text-xs uppercase tracking-widest">
                        <i class="fas fa-edit"></i>
                        Lengkapi Data
                    </NuxtLink>
                </div>
            </div>

            <div v-else>
               <h2 class="text-3xl font-serif font-bold text-white mb-2">Segera Hadir</h2>
               <p class="text-stone-400 text-sm leading-relaxed">Undangan ini sedang dalam proses sentuhan akhir untuk menampilkan momen terbaik.</p>
               
               <div class="pt-8 mt-6 border-t border-stone-800 text-[10px] text-stone-600 uppercase tracking-widest">
                    Check Back Soon
               </div>
            </div>
        </div>
    </div>


    <!-- MAIN CONTENT (Only Render if Data Complete) -->
    <template v-else>
        <!-- MAIN CONTENT (Full Page Scroll Container) -->
        <div 
        @scroll="handleScroll"
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto scroll-smooth bg-stone-50 md:px-0 relative no-scrollbar"
        >
        
        <!-- 1. Header Section -->
        <section 
            id="header"
            class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 relative overflow-hidden transition-all duration-700"
        >
            <div v-if="content?.hero?.backgroundImage" class="absolute inset-0">
                <img :src="content.hero.backgroundImage" class="w-full h-full object-cover grayscale-[20%]" referrerpolicy="no-referrer" />
            </div>
            <div v-if="content?.hero?.backgroundImage" class="absolute inset-0 bg-black/40 z-0"></div>

            <div class="text-center space-y-6 relative z-10" :class="{'text-white': content?.hero?.backgroundImage}">
                <h3 class="font-serif italic text-xl transition-colors opacity-90" :class="content?.hero?.backgroundImage ? 'text-gold-200' : 'text-gold-600'">The Wedding of</h3>
                <h2 class="font-serif text-6xl md:text-7xl leading-tight transition-colors" :class="content?.hero?.backgroundImage ? 'text-white' : 'text-stone-900'">
                {{ content?.hero?.groomNickname }} <br> 
                <span class="text-4xl" :class="content?.hero?.backgroundImage ? 'text-stone-300' : 'text-stone-300'">&amp;</span> <br> 
                {{ content?.hero?.brideNickname }}
                </h2>
                <div class="w-12 h-0.5 bg-gold-500 mx-auto opacity-70"></div>
                <p class="font-bold uppercase tracking-[0.2em] text-xs transition-colors" :class="content?.hero?.backgroundImage ? 'text-stone-200' : 'text-stone-500'">{{ content?.hero?.date }}</p>
            </div>
            
            <button @click="scrollToSection(1)" class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce cursor-pointer group">
                <span class="text-[9px] uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">Scroll</span>
                <i class="fas fa-chevron-down text-white/70 group-hover:text-white text-lg"></i>
            </button>

            <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-stone-900/50 to-transparent z-10 pointer-events-none" v-if="content?.hero?.backgroundImage"></div>
        </section>
        
        <!-- 2. Countdown Section -->
        <section id="countdown" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
            <CountdownSection :target-date="content?.events?.akad?.isoDate || '2025-01-01T00:00:00Z'"></CountdownSection>
        </section>

         <!-- 2.5 Quote Section -->
        <section id="quote" v-if="content?.quote?.content || content?.quote?.arabic" class="min-h-[50vh] w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
            <QuoteSection :quote="content?.quote"></QuoteSection>
        </section>
        
        <!-- 2.7 Love Story Section -->
        <section id="story" v-if="content?.story?.length > 0" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-0">
            <LoveStorySection :stories="content?.story"></LoveStorySection>
        </section>

        <!-- 3. Groom Profile -->
        <section id="groom" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
            <SingleProfile :profile="content?.groom || {}" title="The Groom"></SingleProfile>
        </section>

        <!-- 4. Bride Profile -->
        <section id="bride" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-50 px-4">
            <SingleProfile :profile="content?.bride || {}" title="The Bride"></SingleProfile>
        </section>

        <!-- 5. Event Details -->
        <section id="events" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
            <EventDetails :events="content?.events || {}"></EventDetails>
        </section>
        
        <!-- 6. Gallery -->
        <section id="gallery" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll">
            <GallerySection :images="content?.gallery"></GallerySection>
        </section>
        
        <!-- 7. Gift -->
        <section id="gift" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-stone-100 px-4">
            <GiftSection :gift="content?.gift || {}"></GiftSection>
        </section>
        
        <!-- 8. RSVP -->
        <section id="rsvp" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4">
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
            
            <FloatingNav v-if="isOpened" :current="activeSection" @navigate="scrollToSection" />
        </ClientOnly>
    </template>
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
