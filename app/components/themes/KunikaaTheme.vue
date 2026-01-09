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

// Data completeness check
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
  <div class="h-screen w-full relative bg-[#F3F1FA] text-[#676483] font-roboto overflow-hidden" data-theme="kunikaa">
    
    <!-- 0. INCOMPLETE DATA WARNING (FULL PAGE) -->
    <div v-if="!isDataComplete" class="fixed inset-0 z-[100] bg-stone-950 flex items-center justify-center p-6 text-center">
        <!-- Reusing same warning for now -->
         <div class="max-w-md space-y-6">
            <div class="w-24 h-24 bg-stone-900 border border-stone-800 text-gold-500 rounded-2xl flex items-center justify-center mx-auto text-4xl mb-6 shadow-2xl shadow-black/50">
                <i class="fas fa-compass-drafting animate-pulse"></i>
            </div>
            <div v-if="isOwnerOrPartner">
               <h2 class="text-3xl font-serif font-bold text-white mb-2">Halo, Kak!</h2>
               <p class="text-stone-400 text-sm leading-relaxed">Undangan ini belum lengkap datanya.</p>
                <div class="pt-8 mt-6 border-t border-stone-800">
                    <NuxtLink to="/dashboard" class="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-xl font-bold hover:bg-gold-500 transition-all shadow-lg hover:shadow-gold-500/20 active:scale-95 text-xs uppercase tracking-widest">
                        <i class="fas fa-edit"></i>
                        Lengkapi Data
                    </NuxtLink>
                </div>
            </div>
            <div v-else>
               <h2 class="text-3xl font-serif font-bold text-white mb-2">Segera Hadir</h2>
            </div>
        </div>
    </div>


    <!-- MAIN CONTENT (Only Render if Data Complete) -->
    <template v-else>
        <!-- MAIN CONTENT (Full Page Scroll Container) -->
        <div 
        @scroll="handleScroll"
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto scroll-smooth md:px-0 relative no-scrollbar"
        >
        
        <!-- 1. Header Section -->
        <section 
            id="header"
            class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 relative overflow-hidden transition-all duration-700"
        >
            <div v-if="content?.hero?.backgroundImage" class="absolute inset-0">
                <img :src="content.hero.backgroundImage" class="w-full h-full object-cover transition-transform duration-[20s] hover:scale-110" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-[#EBE9F4]/70"></div> <!-- Lavender Overlay -->
            </div>
            
            <div class="text-center space-y-4 relative z-10 p-8 border-4 border-[#676483]/20 bg-white/80 backdrop-blur-sm max-w-2xl w-full">
                <h3 class="font-roboto tracking-[0.4em] text-xs uppercase text-[#7A7A7A]">The Wedding Of</h3>
                <h2 class="font-alex text-6xl md:text-8xl leading-none text-[#676483] py-4">
                    {{ content?.hero?.groomNickname }} <span class="text-4xl text-[#B3B1C6]">&</span> {{ content?.hero?.brideNickname }}
                </h2>
                <div class="w-full h-px bg-[#676483]/20 mx-auto my-6"></div>
                <p class="font-roboto font-bold uppercase tracking-[0.2em] text-sm text-[#676483]">{{ content?.hero?.date }}</p>
            </div>
            
            <button @click="scrollToSection(1)" class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce cursor-pointer group">
                <span class="text-[9px] uppercase tracking-widest text-[#676483]/70 group-hover:text-[#676483] transition-colors">Scroll</span>
                <i class="fas fa-chevron-down text-[#676483]/70 group-hover:text-[#676483] text-lg"></i>
            </button>
        </section>
        
        <!-- 2. Countdown Section -->
        <section id="countdown" class="min-h-[70vh] w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-white px-4">
            <div class="text-center mb-12">
                <img src="https://templatekit.hellokuro.com/kunikaa/wp-content/uploads/2020/10/divider.png" class="h-6 mx-auto mb-4 opacity-50 grayscale" />
                <h2 class="font-alex text-5xl text-[#676483]">Save The Date</h2>
            </div>
            <!-- Custom Styled Countdown -->
             <!-- We wrap the component but styling it externally is hard. 
                  Ideally we'd create a KunikaaCountdown component. 
                  For now, we'll use the existing one but maybe it clashes styles. 
                  Actually, existing Countdown uses specific classes. 
                  Let's replicate logic here for full custom styling. 
             -->
            <CountdownSection :target-date="content?.events?.akad?.isoDate || '2025-01-01T00:00:00Z'" class="!text-[#676483] scale-90"></CountdownSection>
        </section>

         <!-- Quote Section -->
        <section id="quote" v-if="content?.quote?.content" class="min-h-[50vh] w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 bg-[#F3F1FA]">
             <div class="max-w-2xl text-center space-y-6">
                <i class="fas fa-quote-left text-4xl text-[#B3B1C6]"></i>
                <p class="font-alex text-4xl md:text-5xl leading-relaxed text-[#676483]">{{ content?.quote?.content }}</p>
                <p class="font-roboto text-sm uppercase tracking-widest text-[#7A7A7A] mt-4">{{ content?.quote?.source }}</p>
             </div>
        </section>
        
        <!-- Story -->
        <section id="story" v-if="content?.story?.length > 0" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-0 bg-white">
            <LoveStorySection :stories="content?.story"></LoveStorySection>
        </section>

        <!-- Groom & Bride Mixed -->
        <section id="groom" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 bg-[#F3F1FA]">
             <div class="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
                <!-- Groom -->
                <div class="text-center space-y-6">
                    <div class="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                         <img :src="content?.groom?.image" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 class="font-alex text-5xl text-[#676483]">{{ content?.groom?.nickname || 'Groom' }}</h3>
                        <p class="font-roboto text-sm text-[#7A7A7A] mt-2">{{ content?.groom?.fullName }}</p>
                        <p class="font-roboto text-xs text-[#B3B1C6] mt-4 max-w-xs mx-auto">{{ content?.groom?.fatherName }} & {{ content?.groom?.motherName }}</p>
                    </div>
                </div>

                 <!-- Bride -->
                <div class="text-center space-y-6">
                     <div class="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                         <img :src="content?.bride?.image" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 class="font-alex text-5xl text-[#676483]">{{ content?.bride?.nickname || 'Bride' }}</h3>
                        <p class="font-roboto text-sm text-[#7A7A7A] mt-2">{{ content?.bride?.fullName }}</p>
                        <p class="font-roboto text-xs text-[#B3B1C6] mt-4 max-w-xs mx-auto">{{ content?.bride?.fatherName }} & {{ content?.bride?.motherName }}</p>
                    </div>
                </div>
             </div>
        </section>

        <!-- Events -->
        <section id="events" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-white px-4">
             <div class="text-center mb-16">
                <h2 class="font-alex text-6xl text-[#676483]">Wedding Events</h2>
                <div class="w-24 h-1 bg-[#EBE9F4] mx-auto mt-4"></div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
                <!-- Akad -->
                <div class="bg-[#F3F1FA] p-10 text-center rounded-lg border border-[#EBE9F4] hover:shadow-lg transition-all">
                    <h3 class="font-bold tracking-widest uppercase text-[#676483] mb-4">Akad Nikah</h3>
                     <p class="font-alex text-4xl text-[#676483] mb-6">{{ content?.events?.akad?.date }}</p>
                     <p class="text-[#7A7A7A] mb-2">{{ content?.events?.akad?.time }}</p>
                     <p class="text-[#7A7A7A] italic">{{ content?.events?.akad?.location }}</p>
                     <div class="mt-8">
                        <a :href="content?.events?.akad?.mapsUrl" target="_blank" class="px-6 py-2 border border-[#676483] text-[#676483] hover:bg-[#676483] hover:text-white transition-colors text-xs uppercase tracking-widest rounded-full">Open Map</a>
                     </div>
                </div>
                
                 <!-- Resepsi -->
                <div class="bg-[#F3F1FA] p-10 text-center rounded-lg border border-[#EBE9F4] hover:shadow-lg transition-all">
                    <h3 class="font-bold tracking-widest uppercase text-[#676483] mb-4">Resepsi</h3>
                     <p class="font-alex text-4xl text-[#676483] mb-6">{{ content?.events?.reception?.date }}</p>
                     <p class="text-[#7A7A7A] mb-2">{{ content?.events?.reception?.time }}</p>
                     <p class="text-[#7A7A7A] italic">{{ content?.events?.reception?.location }}</p>
                     <div class="mt-8">
                        <a :href="content?.events?.reception?.mapsUrl" target="_blank" class="px-6 py-2 border border-[#676483] text-[#676483] hover:bg-[#676483] hover:text-white transition-colors text-xs uppercase tracking-widest rounded-full">Open Map</a>
                     </div>
                </div>
            </div>
        </section>
        
        <!-- Gallery -->
        <section id="gallery" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-[#F3F1FA]">
             <div class="text-center mb-10">
                <h2 class="font-alex text-6xl text-[#676483]">Our Gallery</h2>
            </div>
            <GallerySection :images="content?.gallery" class="!bg-transparent"></GallerySection>
        </section>
        
        <!-- Gift -->
        <section id="gift" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-white px-4">
             <div class="bg-[#F3F1FA] p-12 max-w-3xl w-full text-center rounded-2xl">
                 <h2 class="font-alex text-5xl text-[#676483] mb-8">Wedding Gift</h2>
                 <p class="text-[#7A7A7A] mb-8 max-w-md mx-auto">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.</p>
                 <GiftSection :gift="content?.gift || {}" class="!bg-transparent"></GiftSection>
             </div>
        </section>
        
        <!-- RSVP -->
        <section id="rsvp" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 bg-[#676483] text-white">
            <h2 class="font-alex text-6xl mb-8">RSVP</h2>
            <div class="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-2xl w-full max-w-2xl border border-white/20">
                <RSVPSection 
                    :rsvp="content?.rsvp || {}" 
                    :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                    :is-authorized="(content as any)?._auth?.isAuthorized || false"
                    class="!text-white"
                ></RSVPSection>
            </div>
        </section>

        <!-- Footer -->
        <section class="min-h-[50vh] w-full flex flex-col items-center justify-end pb-10 snap-start snap-always reveal-on-scroll bg-[#F3F1FA]">
            <div class="text-center text-xs text-[#7A7A7A]">
                <p class="font-alex text-2xl mb-2">{{ content?.hero?.groomNickname }} & {{ content?.hero?.brideNickname }}</p>
                <p>© 2025 All Rights Reserved.</p>
                <p class="opacity-50 mt-4">Theme Kunikaa by Mengundang</p>
            </div>
        </section>

        </div>
        

        <!-- COVER SECTION CUSTOM -->
        <!-- Reuse Logic but Custom UI needed or Reuse Component? 
             CoverSection is quite complex with logic. 
             Let's reuse it but pass a prop for theme-style if possible? 
             No, CoverSection has strict HTML. 
             Let's use a slot or just overlay logic.
             For now, reuse existing CoverSection but wrapped. 
             Ideally we create a KunikaaCover. 
        -->
        <CoverSection 
        @open="handleOpen" 
        :groom-name="content?.hero?.groomNickname || ''" 
        :bride-name="content?.hero?.brideNickname || ''" 
        :date="content?.hero?.date || ''"
        :background-image="content?.cover?.backgroundImage || ''"
        :guest-name="(route.query.to as string)"
        class="!font-roboto"
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
.font-alex {
    font-family: 'Alex Brush', cursive;
}
.font-roboto {
    font-family: 'Roboto', sans-serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none; 
}

/* Override Child Component Styles Deeply if needed */
:deep(.text-gold-500) {
    color: #676483 !important;
}
:deep(.bg-stone-900) {
    background-color: white !important;
    color: #676483 !important;
}
</style>
