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

const isBrideFirst = computed(() => props.content?.meta?.displayOrder === 'bride_first')

const firstNickname = computed(() => isBrideFirst.value ? props.content?.hero?.brideNickname : props.content?.hero?.groomNickname)
const secondNickname = computed(() => isBrideFirst.value ? props.content?.hero?.groomNickname : props.content?.hero?.brideNickname)

const firstProfile = computed(() => isBrideFirst.value ? props.content?.bride : props.content?.groom)
const secondProfile = computed(() => isBrideFirst.value ? props.content?.groom : props.content?.bride)

const isOpened = ref(route.query.preview === 'true')
const activeSectionId = ref('header')
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

// Scroll to specific section by ID
const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el && scrollContainer.value) {
       const top = el.offsetTop
       smoothScrollTo(scrollContainer.value, top, 1200) 
       activeSectionId.value = sectionId
    }
}

const handleScroll = () => {
    if (!scrollContainer.value) return
    
    const scrollPosition = scrollContainer.value.scrollTop + (window.innerHeight / 2)
    const navSectionIds = ['header', 'mempelai', 'events', 'gallery', 'rsvp']
    
    for (let i = navSectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(navSectionIds[i]!)
        if (el && scrollPosition >= el.offsetTop) {
            activeSectionId.value = navSectionIds[i]!
            break
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
  <div class="h-screen w-full relative bg-[#F9F8F6] text-[#2C2C2C] font-lora overflow-hidden selection:bg-[#2C2C2C] selection:text-white" data-theme="kunikaa">
    
    <!-- GLOBAL APAR TEXTURE + NOISE -->
    <div class="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-multiply" style="background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');"></div>
    <div class="pointer-events-none fixed inset-0 z-0 opacity-5" style="background-image: url('https://www.transparenttextures.com/patterns/stardust.png');"></div>

    <!-- 0. INCOMPLETE DATA WARNING (FULL PAGE) -->
    <div v-if="!isDataComplete" class="fixed inset-0 z-[100] bg-[#F9F8F6] flex items-center justify-center p-6 text-center relative z-50">
         <div class="max-w-md space-y-6 relative">
            <div class="w-16 h-16 border-2 border-[#2C2C2C] rounded-full flex items-center justify-center mx-auto text-2xl mb-6">
                <i class="fas fa-pen-nib animate-pulse"></i>
            </div>
            <div v-if="isOwnerOrPartner">
               <h2 class="text-4xl font-lexend uppercase font-bold text-[#2C2C2C] tracking-tighter mb-2">Editor Mode</h2>
               <p class="text-[#555] text-sm leading-relaxed font-lora italic">You need to complete your invitation data.</p>
                <div class="pt-8 mt-6 border-t border-[#2C2C2C]/10">
                    <NuxtLink to="/dashboard" class="inline-flex items-center gap-3 bg-[#2C2C2C] text-white px-8 py-3 rounded-none font-bold hover:bg-black transition-all text-xs uppercase tracking-[0.2em] font-lexend">
                        Edit Data
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>


    <!-- MAIN CONTENT -->
    <template v-else>
        <div 
        @scroll="handleScroll"
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto scroll-smooth md:px-0 relative no-scrollbar z-10"
        >
        
        <!-- 1. HERO: VOGUE COVER STYLE -->
        <section 
            id="header"
            class="min-h-screen w-full flex flex-col justify-between snap-start snap-always reveal-on-scroll relative overflow-hidden pt-24 pb-12 px-6 lg:px-20"
        >
            <!-- REVOLVING MONOGRAM BG -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none animate-[spin_60s_linear_infinite]">
                 <svg viewBox="0 0 200 200" fill="currentColor" class="text-[#2C2C2C] w-full h-full">
                     <path id="curve" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="transparent"/>
                     <text width="500">
                         <textPath xlink:href="#curve" class="font-lora text-[15px] uppercase tracking-[0.4em]">
                             {{ firstNickname }} & {{ secondNickname }} • The Wedding Celebration • {{ content?.hero?.date }} •
                         </textPath>
                     </text>
                 </svg>
            </div>

const year = computed(() => {
    // Try to get year from Hero date or Akad date
    const d = props.content?.hero?.date || props.content?.events?.akad?.date
    if (d) {
        const parts = d.split(' ')
        const y = parts.find(p => p.match(/^\d{4}$/))
        return y || new Date().getFullYear().toString()
    }
    return new Date().getFullYear().toString()
})

const location = computed(() => {
    const loc = props.content?.events?.akad?.location
    if (loc) {
        // Extract city (naive: last part after comma, or just the location)
        const parts = loc.split(',')
        return parts.length > 1 ? parts[parts.length - 1].trim() : 'Indonesia'
    }
    return 'Indonesia'
})

// ... inside template ...

            <!-- TOP: DATE & ISSUE NO -->
            <div class="w-full flex justify-between items-start border-b border-[#2C2C2C] pb-4 mb-auto">
                 <div class="flex flex-col">
                     <span class="font-lexend text-xs font-bold uppercase tracking-[0.2em]">The Wedding</span>
                     <span class="font-lora italic text-[#555] text-sm">Vol. 01</span>
                 </div>
                 <div class="flex flex-col text-right">
                     <span class="font-lexend text-xs font-bold uppercase tracking-[0.2em]">{{ content?.hero?.date }}</span>
                     <span class="font-lora italic text-[#555] text-sm">{{ location }}</span>
                 </div>
            </div>

            <!-- CENTER: GIANT TYPOGRAPHY -->
            <div class="flex-1 flex flex-col justify-center relative z-10 py-10 w-full overflow-hidden">
                <h1 class="font-lexend text-[10vw] md:text-[12vw] leading-[0.85] font-black uppercase tracking-tighter text-[#2C2C2C] mix-blend-darken text-center lg:text-left break-words w-full">
                    {{ firstNickname }}<span class="text-[#E0BFB8]">.</span>
                </h1>
                <div class="font-lora italic text-4xl md:text-6xl text-right lg:text-center text-[#555] -mt-2 lg:-mt-8 mr-4 lg:mr-0 z-0">
                    and
                </div>
                <h1 class="font-lexend text-[10vw] md:text-[12vw] leading-[0.85] font-black uppercase tracking-tighter text-[#2C2C2C] mix-blend-darken text-right break-words w-full">
                    {{ secondNickname }}
                </h1>
            </div>

            <!-- BOTTOM: INVITATION TEXT -->
            <div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-[#2C2C2C] pt-6 mt-auto">
                 <div class="hidden lg:block text-left">
                      <span class="font-lexend text-[10px] uppercase tracking-widest block mb-2">Established</span>
                      <span class="font-lora text-lg">{{ year }}</span>
                 </div>
                 <div class="text-center">
                      <p class="font-lora text-sm md:text-base italic leading-relaxed max-w-sm mx-auto">
                          "We invite you to witness the beginning of our forever."
                      </p>
                 </div>
                 <div class="text-center lg:text-right">
                      <button @click="scrollToSection('countdown')" class="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:text-[#E0BFB8] transition-colors">
                          Scroll Down <i class="fas fa-arrow-down transform group-hover:translate-y-1 transition-transform"></i>
                      </button>
                 </div>
            </div>
        </section>

        <!-- 2. COUNTDOWN: MINIMALIST STRIP -->
        <section id="countdown" class="w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll border-y border-[#2C2C2C]">
            <div class="w-full bg-[#E0BFB8] py-2 overflow-hidden whitespace-nowrap">
                 <div class="animate-marquee inline-block">
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">Save The Date</span>
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">•</span>
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">Counting Down</span>
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">•</span>
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">Save The Date</span>
                      <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">•</span>
                     <span class="text-[#2C2C2C] font-lexend text-xs font-bold uppercase tracking-[0.3em] mx-8">Counting Down</span>
                 </div>
            </div>
            
            <div class="py-24 text-center">
                 <div class="font-lexend text-[#2C2C2C] scale-150">
                    <CountdownSection :target-date="content?.events?.akad?.isoDate || '2025-01-01T00:00:00Z'" class="!font-lexend [&_.text-xs]:!hidden [&_.text-3xl]:!text-5xl [&_.text-3xl]:!font-thin [&_.gap-4]:!gap-8 [&_.bg-white]:!bg-transparent [&_.shadow-sm]:!shadow-none [&_.rounded-lg]:!rounded-none"></CountdownSection>
                </div>
            </div>
        </section>

         <!-- 3. QUOTE: BIG & BOLD -->
        <section id="quote" v-if="content?.quote?.content" class="min-h-[50vh] w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-8 py-20 bg-[#2C2C2C] text-[#F9F8F6]">
             <div class="max-w-3xl text-center">
                <i class="fas fa-quote-left text-3xl mb-8 opacity-50"></i>
                <p class="font-lora text-3xl md:text-5xl leading-tight font-light mb-8">
                    {{ content?.quote?.content }}
                </p>
                <div class="inline-block border border-[#F9F8F6] px-6 py-2 rounded-full">
                    <p class="font-lexend text-xs uppercase tracking-[0.2em]">{{ content?.quote?.source }}</p>
                </div>
             </div>
        </section>
        
        <!-- 4. PROFILE: EDITORIAL SPLIT -->
        <section id="mempelai" class="w-full flex flex-col snap-start snap-always reveal-on-scroll bg-[#F9F8F6]">
            <!-- Bride/Groom 1 -->
            <div class="grid md:grid-cols-2 min-h-[80vh] border-b border-[#2C2C2C]">
                 <div class="relative border-r border-[#2C2C2C] group overflow-hidden bg-[#E5E5E5]">
                      <img v-if="firstProfile?.image" :src="firstProfile.image" class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" />
                      <div class="absolute bottom-0 left-0 bg-white px-6 py-4 border-t border-r border-[#2C2C2C]">
                          <span class="font-lexend text-xs font-bold uppercase tracking-widest">01 / {{ isBrideFirst ? 'The Bride' : 'The Groom' }}</span>
                      </div>
                 </div>
                 <div class="flex flex-col justify-center p-12 lg:p-24 relative">
                     <h2 class="font-lexend text-6xl md:text-8xl font-black uppercase text-[#2C2C2C]/5 absolute top-10 right-10 leading-none pointer-events-none">One</h2>
                     <h3 class="font-lora italic text-5xl md:text-6xl text-[#2C2C2C] mb-6">{{ firstProfile?.nickname }}</h3>
                     <p class="font-lexend text-lg font-bold uppercase tracking-widest mb-2">{{ firstProfile?.fullName }}</p>
                     <div class="w-12 h-1 bg-[#2C2C2C] mb-6"></div>
                     <p class="font-lora text-[#555] leading-relaxed">
                         Son/Daughter of <br>
                         <span class="font-bold text-[#2C2C2C]">{{ firstProfile?.fatherName }}</span> <br>& <br><span class="font-bold text-[#2C2C2C]">{{ firstProfile?.motherName }}</span>
                     </p>
                 </div>
            </div>

             <!-- Bride/Groom 2 -->
             <div class="grid md:grid-cols-2 min-h-[80vh]">
                 <div class="flex flex-col justify-center p-12 lg:p-24 relative order-2 md:order-1 border-r border-[#2C2C2C]">
                     <h2 class="font-lexend text-6xl md:text-8xl font-black uppercase text-[#2C2C2C]/5 absolute top-10 left-10 leading-none pointer-events-none">Two</h2>
                     <h3 class="font-lora italic text-5xl md:text-6xl text-[#2C2C2C] mb-6 text-right md:text-left">{{ secondProfile?.nickname }}</h3>
                     <p class="font-lexend text-lg font-bold uppercase tracking-widest mb-2 text-right md:text-left">{{ secondProfile?.fullName }}</p>
                     <div class="w-12 h-1 bg-[#2C2C2C] mb-6 ml-auto md:ml-0"></div>
                     <p class="font-lora text-[#555] leading-relaxed text-right md:text-left">
                         Son/Daughter of <br>
                         <span class="font-bold text-[#2C2C2C]">{{ secondProfile?.fatherName }}</span> <br>& <br><span class="font-bold text-[#2C2C2C]">{{ secondProfile?.motherName }}</span>
                     </p>
                 </div>
                 <div class="relative group overflow-hidden bg-[#E5E5E5] order-1 md:order-2">
                      <img v-if="secondProfile?.image" :src="secondProfile.image" class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" />
                      <div class="absolute bottom-0 right-0 bg-white px-6 py-4 border-t border-l border-[#2C2C2C]">
                          <span class="font-lexend text-xs font-bold uppercase tracking-widest">02 / {{ isBrideFirst ? 'The Groom' : 'The Bride' }}</span>
                      </div>
                 </div>
            </div>
        </section>

        <!-- 5. EVENTS: MAGAZINE SPREAD (CLEAN LINES) -->
        <section id="events" class="min-h-screen w-full flex flex-col snap-start snap-always reveal-on-scroll bg-[#F9F8F6] pt-24 pb-24 px-6 md:px-20 relative">
             <div class="mb-16 border-b border-[#2C2C2C] pb-4 flex justify-between items-end">
                <h2 class="font-lexend text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#2C2C2C]">The<br>Schedule</h2>
                <span class="font-lora italic text-xl hidden md:block">Mark your calendar</span>
            </div>
            
            <div class="space-y-0">
                <!-- Akad -->
                <div v-if="content?.events?.akad?.date" class="group border-b border-[#2C2C2C] py-12 hover:bg-white transition-colors duration-500 -mx-6 md:-mx-20 px-6 md:px-20">
                    <div class="grid md:grid-cols-12 gap-8 items-start">
                        <div class="md:col-span-3">
                            <span class="font-lexend text-xs font-bold uppercase tracking-[0.2em] bg-[#2C2C2C] text-white px-3 py-1">Event 01</span>
                        </div>
                        <div class="md:col-span-5">
                            <h3 class="font-lora text-4xl md:text-5xl italic mb-4">Akad Nikah</h3>
                            <p class="font-lexend text-sm uppercase tracking-wider text-[#555]">{{ content?.events?.akad?.date?.split(',')[0] }}</p>
                            <p class="font-lexend text-2xl font-bold uppercase tracking-tighter mt-1">{{ content?.events?.akad?.date?.split(',')[1] || content?.events?.akad?.date }}</p>
                        </div>
                        <div class="md:col-span-4 flex flex-col justify-between h-full">
                            <div>
                                <p class="font-lexend font-bold text-lg mb-2">{{ content?.events?.akad?.time }}</p>
                                <p class="font-lora text-sm leading-relaxed text-[#555] max-w-xs">{{ content?.events?.akad?.location }}</p>
                            </div>
                            <a :href="content?.events?.akad?.mapsUrl" target="_blank" class="mt-8 inline-flex items-center gap-2 font-lexend text-xs uppercase font-bold tracking-widest hover:underline">
                                Get Directions <i class="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Resepsi -->
                 <div v-if="content?.events?.reception?.date" class="group border-b border-[#2C2C2C] py-12 hover:bg-white transition-colors duration-500 -mx-6 md:-mx-20 px-6 md:px-20">
                    <div class="grid md:grid-cols-12 gap-8 items-start">
                        <div class="md:col-span-3">
                            <span class="font-lexend text-xs font-bold uppercase tracking-[0.2em] bg-[#E0BFB8] text-[#2C2C2C] px-3 py-1">Event 02</span>
                        </div>
                        <div class="md:col-span-5">
                            <h3 class="font-lora text-4xl md:text-5xl italic mb-4">Resepsi</h3>
                            <p class="font-lexend text-sm uppercase tracking-wider text-[#555]">{{ content?.events?.reception?.date?.split(',')[0] }}</p>
                            <p class="font-lexend text-2xl font-bold uppercase tracking-tighter mt-1">{{ content?.events?.reception?.date?.split(',')[1] || content?.events?.reception?.date }}</p>
                        </div>
                        <div class="md:col-span-4 flex flex-col justify-between h-full">
                            <div>
                                <p class="font-lexend font-bold text-lg mb-2">{{ content?.events?.reception?.time }}</p>
                                <p class="font-lora text-sm leading-relaxed text-[#555] max-w-xs">{{ content?.events?.reception?.location }}</p>
                            </div>
                           <a :href="content?.events?.reception?.mapsUrl" target="_blank" class="mt-8 inline-flex items-center gap-2 font-lexend text-xs uppercase font-bold tracking-widest hover:underline">
                                Get Directions <i class="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 6. GALLERY: BENTO GRID / MOSAIC -->
        <section id="gallery" class="min-h-screen w-full flex flex-col snap-start snap-always reveal-on-scroll bg-[#2C2C2C] text-[#F9F8F6] py-24 px-4 md:px-12">
             <div class="text-center mb-16">
                 <h2 class="font-lexend text-4xl md:text-6xl uppercase tracking-tighter font-black">Visual<br>Journal</h2>
            </div>
            
            <!-- MOSAIC GRID CSS -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px] w-full max-w-7xl mx-auto">
                <div v-for="(img, idx) in content?.gallery" :key="idx" 
                     :class="[
                        'relative overflow-hidden group grayscale hover:grayscale-0 transition-all duration-700 bg-[#333]',
                        idx % 3 === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                     ]">
                     <img :src="img" class="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000" />
                     <div class="absolute inset-0 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex justify-between items-end">
                         <span class="font-lexend text-[10px] uppercase font-bold tracking-widest">No. {{idx + 1}}</span>
                         <i class="fas fa-plus text-xs"></i>
                     </div>
                </div>
            </div>
        </section>
        
        <!-- 7. GIFT-->
        <section id="gift" class="min-h-[70vh] w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll bg-[#F9F8F6] px-6 py-20">
             <div class="w-full max-w-4xl border border-[#2C2C2C] p-8 md:p-16 relative">
                 <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F9F8F6] px-6">
                     <span class="font-lexend text-2xl font-black uppercase tracking-widest bg-[#2C2C2C] text-white px-2 py-1">Gift</span>
                 </div>

                 <p class="font-lora text-center text-xl md:text-2xl text-[#2C2C2C] mb-12 italic max-w-lg mx-auto leading-relaxed">
                     "Your love and prayers are the greatest gift we could ask for."
                 </p>
                 
                 <div class="font-lexend">
                    <GiftSection :gift="content?.gift || {}" class="!bg-transparent"></GiftSection>
                 </div>
             </div>
        </section>
        
        <!-- 8. RSVP -->
        <section id="rsvp" class="min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-4 bg-[#E0BFB8]">
            <div class="relative w-full max-w-xl text-center">
                <h2 class="font-lexend text-[15vw] md:text-9xl font-black text-[#2C2C2C]/10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0 leading-none pointer-events-none">RSVP</h2>
                
                <div class="relative z-10 bg-white border border-[#2C2C2C] p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(44,44,44,1)]">
                    <h2 class="font-lexend text-4xl font-bold uppercase mb-8 text-[#2C2C2C]">Attendace</h2>
                    <RSVPSection 
                        :rsvp="content?.rsvp || {}" 
                        :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                        :is-authorized="(content as any)?._auth?.isAuthorized || false"
                        class="!text-[#2C2C2C]"
                    ></RSVPSection>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <section class="w-full py-12 bg-[#2C2C2C] text-[#F9F8F6] px-6">
            <div class="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
                 <div class="text-center md:text-left">
                     <h3 class="font-lexend font-bold uppercase tracking-widest text-lg">{{ firstNickname }} & {{ secondNickname }}</h3>
                     <p class="font-lora text-xs italic opacity-50">Established {{ year }} • {{ location }}</p>
                 </div>
                 <div class="text-center md:text-right">
                    <p class="font-lexend text-[10px] uppercase tracking-[0.2em] opacity-50">Designed by Mengundang</p>
                 </div>
            </div>
        </section>

        </div>
        
        <!-- COVER SECTION CUSTOM -->
        <div class="font-lora">
            <CoverSection 
            @open="handleOpen" 
            :groom-name="firstNickname || ''" 
            :bride-name="secondNickname || ''" 
            :date="content?.hero?.date || ''"
            :background-image="content?.cover?.backgroundImage || ''"
            :guest-name="(route.query.to as string)"
            ></CoverSection>
        </div>

        <!-- FLOATING MUSIC -->
        <ClientOnly>
            <FloatingMusic 
            ref="audioPlayer" 
            :url="content?.music?.url || ''" 
            :start-time="content?.music?.startTime || 0"
            :fade="content?.music?.fade || false"
            ></FloatingMusic>
            
            <FloatingNav v-if="isOpened" :current-section-id="activeSectionId" @navigate="scrollToSection" />
        </ClientOnly>
    </template>
  </div>
</template>

<style scoped>
/* Google Font Imports should be in Nuxt Config, but defining classes here */
/* Ideally we add Lexend to config too for the bold sans serif look */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;700;900&display=swap');

.font-alex {
    font-family: 'Alex Brush', cursive;
}
.font-lora {
    font-family: 'Lora', serif;
}
.font-lexend {
    font-family: 'Lexend', sans-serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none; 
}

/* Animations */
.reveal-on-scroll {
    opacity: 0;
    transition: opacity 1s ease-out;
}
.reveal-on-scroll.is-visible {
    opacity: 1;
}

.animate-marquee {
    animation: marquee 20s linear infinite;
}
@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* DEEP OVERRIDES FOR SHARED COMPONENTS */
:deep(.text-gold-500) {
    color: #E0BFB8 !important; 
}
:deep(.bg-stone-900) {
    background-color: #2C2C2C !important;
}
:deep(.border-stone-200) {
    border-color: #eee !important;
}
/* Force inputs to be sharp square */
:deep(input), :deep(textarea), :deep(select) {
    border-radius: 0px !important;
    border: 1px solid #ddd !important;
    background: #fff !important;
}
:deep(button) {
    border-radius: 0px !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
</style>
