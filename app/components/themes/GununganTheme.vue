<script setup lang="ts">
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  GUNUNGAN THEME - Cloned from WeddingPress Demo 58                        ║
 * ║  A premium Javanese-inspired wedding invitation with Gunungan motif       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * Design Features:
 * - Black background with champagne gold (#D4AF37) accents
 * - Gunungan (wayang shadow puppet) as central decorative motif
 * - Gold filigree circular frames for profile photos
 * - Floating bottom navigation with circular icons
 * - Heavy dark overlays on photos for text legibility
 */

import FloatingMusic from '~/components/FloatingMusic.vue'
import GiftSection from '~/components/GiftSection.vue'
import RSVPSection from '~/components/RSVPSection.vue'
import CountdownSection from '~/components/CountdownSection.vue'

const props = defineProps<{
    content: any
}>()

const route = useRoute()

/* === SCROLL SKEW LOGIC (JELLY EFFECT) === */
const scrollSkew = ref(0)
let lastScrollPos = 0
let skewTimeout: any = null

const handleScrollSkew = () => {
    const currentPos = window.pageYOffset || document.documentElement.scrollTop
    const diff = currentPos - lastScrollPos
    const velocity = diff * 0.10 // Sensitivity adjusted

    // Clamp velocity
    const clampedSkew = Math.max(Math.min(velocity, 3), -3) // Max 3 deg skew
    
    scrollSkew.value = clampedSkew
    lastScrollPos = currentPos

    clearTimeout(skewTimeout)
    skewTimeout = setTimeout(() => {
        scrollSkew.value = 0
    }, 50)
}

onMounted(() => {
    window.addEventListener('scroll', handleScrollSkew, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScrollSkew)
    if (skewTimeout) clearTimeout(skewTimeout)
})

/* === LIGHTBOX LOGIC === */
const selectedImage = ref<string | null>(null)

const openLightbox = (img: string) => {
    selectedImage.value = img
    document.body.style.overflow = 'hidden' // Prevent scrolling bg
}

const closeLightbox = () => {
    selectedImage.value = null
    document.body.style.overflow = ''
}

/* === LOAD MORE LOGIC === */
const galleryVisibleCount = ref(9) // Initially show 9 images as requested
const galleryIncrement = 6
const isLoadingMore = ref(false)

const visibleGallery = computed(() => {
    return props.content?.gallery?.slice(0, galleryVisibleCount.value) || []
})

const hasMoreGallery = computed(() => {
    return (props.content?.gallery?.length || 0) > galleryVisibleCount.value
})

const loadMoreGallery = async () => {
    // FLIP Animation for smooth button movement
    const button = document.querySelector('.load-more-container') as HTMLElement
    const oldRect = button?.getBoundingClientRect()
    
    // Update data (triggers re-render)
    galleryVisibleCount.value += galleryIncrement
    
    // Wait for DOM update
    await nextTick()
    
    // FLIP: Animate from old position to new
    if (button && oldRect) {
        const newRect = button.getBoundingClientRect()
        const deltaY = oldRect.top - newRect.top
        
        // Apply inverse transform (teleport to old position)
        button.style.transform = `translateY(${deltaY}px)`
        button.style.transition = 'none'
        
        // Force reflow
        button.offsetHeight
        
        // Animate back to new natural position
        button.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        button.style.transform = 'translateY(0)'
    }
}

// === DATA VALIDATION ===
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

// === COUPLE DATA ===
const isBrideFirst = computed(() => props.content?.meta?.displayOrder === 'bride_first')

const firstNickname = computed(() => isBrideFirst.value ? props.content?.hero?.brideNickname : props.content?.hero?.groomNickname)
const secondNickname = computed(() => isBrideFirst.value ? props.content?.hero?.groomNickname : props.content?.hero?.brideNickname)

const normalizeProfile = (profile: any, isBride: boolean) => {
    if (!profile) return null
    return {
        ...profile,
        nickname: profile.nickname || profile.fullName?.split(' ')[0] || '',
        fatherName: profile.fatherName || (profile.parents?.split(' & ')[0] || ''),
        motherName: profile.motherName || (profile.parents?.split(' & ')[1] || ''),
        isBride,
    }
}

const firstProfile = computed(() => normalizeProfile(
    isBrideFirst.value ? props.content?.bride : props.content?.groom, 
    isBrideFirst.value
))
const secondProfile = computed(() => normalizeProfile(
    isBrideFirst.value ? props.content?.groom : props.content?.bride, 
    !isBrideFirst.value
))

const receptionEvent = computed(() => props.content?.events?.reception || props.content?.events?.resepsi)

const createCalendarLink = (event: any, title: string) => {
    if (!event?.date) return '#'
    
    const startTime = new Date(event.date)
    // Adjust time if available, otherwise default to specified hours
    if (event.time) {
        const [hours, minutes] = event.time.split('.').length > 1 
            ? event.time.split('.') 
            : event.time.split(':')
        if (hours && minutes) {
            startTime.setHours(parseInt(hours), parseInt(minutes))
        }
    }
    
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)) // Default 2 hours duration
    
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "")
    
    const details = `Acara: ${title}\nLokasi: ${event.location || ''}\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.`
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.location || '')}&sf=true&output=xml`
}

const heroBackground = computed(() => {
    // Priority: 1) Explicit hero.backgroundImage, 2) Cover, 3) First gallery item
    return props.content?.hero?.backgroundImage || props.content?.cover?.backgroundImage || props.content?.gallery?.[0] || ''
})

// === UI STATE ===
const isOpened = ref(route.query.preview === 'true')
const activeSectionId = ref('home')
const scrollContainer = ref<HTMLElement | null>(null)
const audioPlayer = ref<any>(null)

const handleOpen = () => {
    if (!isDataComplete.value) {
        if (isOwnerOrPartner.value) {
            alert('Halo Owner! Data undanganmu belum lengkap. Silakan lengkapi di Dashboard.')
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

const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el && scrollContainer.value) {
        el.scrollIntoView({ behavior: 'smooth' })
        activeSectionId.value = sectionId
    }
}

const handleScroll = () => {
    if (!scrollContainer.value) return
    const scrollPosition = scrollContainer.value.scrollTop + (window.innerHeight / 2)
    const navSectionIds = ['home', 'mempelai', 'acara', 'galeri', 'ucapan']
    
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
        threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
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

// === TEXT CONFIG ===
const texts = computed(() => {
    const t = props.content?.texts || {}
    return {
        weddingOf: t.weddingOf || 'THE WEDDING OF',
        openInvitation: t.openInvitation || 'Buka Undangan',
        invitedGuest: t.invitedGuest || 'Tamu Undangan',
        weddingDay: t.weddingDay || 'Kami Akan Menikah',
        countdown: t.countdown || 'Dan Kami Ingin Anda Menjadi Bagian Dari Hari Istimewa Kami!',
        sonOf: t.sonOf || 'Putra Pertama Dari Keluarga',
        daughterOf: t.daughterOf || 'Putri Keempat Dari Keluarga',
        fatherMother: t.fatherMother || 'Bapak Lorem Dan Ibu Ipsum',
        theCeremony: t.theCeremony || 'Akad Nikah',
        theReception: t.theReception || 'Resepsi',
        visitLocation: t.visitLocation || 'Kunjungi Lokasi',
        ourGallery: t.ourGallery || 'Galeri Foto',
        weddingGift: t.weddingGift || 'Hadiah Pernikahan',
        rsvpTitle: t.rsvpTitle || 'Ucapan & Doa',
        quoteDefault: t.quoteDefault || 'Maka Ijinkanlah Kami Menikahkannya. Ya Allah Pertemukan Kami Merangkulkan Kasih Sayang Yang Kau Ciptakan Diantara Putra Putri Kami.',
        thankYou: t.thankYou || 'Terima Kasih',
        days: t.days || 'Hari',
        hours: t.hours || 'Jam',
        minutes: t.minutes || 'Menit',
        seconds: t.seconds || 'Detik',
    }
})
</script>

<template>
  <div class="gunungan-theme h-screen w-full relative overflow-hidden" data-theme="gunungan">
    
    <!-- ═══════════════════════════════════════════════════════════════════════
         COVER SECTION - "The Royal Frame"
         ═══════════════════════════════════════════════════════════════════════ -->
    <Transition name="cover-slide">
    <div 
        v-if="!isOpened" 
        class="cover-overlay absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
    >
        <!-- 1. BACKGROUND LAYER (Parang Batik Frame) -->
        <div class="absolute inset-0 z-0 opacity-40">
             <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-cover bg-center"></div>
             <!-- Vignette for depth -->
             <div class="absolute inset-0 bg-radial-vignette"></div>
        </div>

        <!-- 2. MAIN CARD (CMS Photo Container) - 85% Size -->
        <div class="relative z-10 w-[85%] h-[85%] rounded-[2rem] overflow-hidden shadow-2xl">
            <!-- Hero Photo -->
            <img v-if="heroBackground" :src="heroBackground" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
            
            <!-- Dark Overlay for Text Readability -->
            <div class="absolute inset-0 bg-black/60"></div>
            
            <!-- Inner Border Decoration (REMOVED) -->
            <!-- <div class="absolute inset-4 border border-white/10 rounded-[1.5rem] pointer-events-none"></div> -->

            <!-- CONTENT INSIDE THE CARD -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                
                <!-- GUNUNGAN MOTIF -->
                <div class="gunungan-icon w-32 h-auto md:w-48 mb-6 relative animate-pulse-slow">
                    <!-- Inner Glow -->
                    <div class="absolute inset-0 bg-gold/20 blur-2xl rounded-full"></div>
                    <NuxtImg 
                        src="/images/themes/gunungan-motif.png" 
                        alt="Gunungan Motif" 
                        format="webp"
                        quality="85"
                        class="w-full h-auto drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] relative z-10"
                    />
                </div>
                
                <!-- Couple Names -->
                <h1 class="font-script text-4xl md:text-5xl lg:text-7xl text-gold mb-6 leading-tight drop-shadow-md pb-2">
                    {{ firstNickname }} <span class="text-white/50 text-2xl font-serif align-middle mx-1">&</span> {{ secondNickname }}
                </h1>
                
                <!-- VIP GUEST BADGE -->
                <div class="mb-10 relative group w-full max-w-xs mx-auto">
                    <p class="text-white/40 text-[9px] uppercase tracking-widest mb-2">
                        {{ route.query.to ? 'Kepada Yth. Tamu Kehormatan' : 'Kepada Yth. Bapak/Ibu/Saudara/i' }}
                    </p>
                    
                    <div class="relative bg-white/5 backdrop-blur-md px-6 py-3 rounded-sm transform transition-all duration-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <!-- Corner Ornaments -->
                        <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gold"></div>
                        <div class="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-gold"></div>
                        <div class="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-gold"></div>
                        <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-gold"></div>
                        
                        <h3 class="font-display text-base md:text-xl text-white tracking-wider capitalize break-words leading-relaxed">
                            {{ route.query.to || 'Tamu Undangan' }}
                        </h3>
                    </div>
                </div>
                
                <!-- "ROYAL PILL" BUTTON -->
                <button 
                    @click="handleOpen" 
                    class="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-float"
                >
                    <div class="absolute inset-0 bg-gold opacity-90 transition-transform duration-300 group-hover:scale-105"></div>
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine"></div>
                    <div class="relative flex items-center justify-center gap-2">
                        <span class="text-[#050505] font-bold text-[10px] uppercase tracking-[0.2em]">Buka Undangan</span>
                        <i class="fas fa-chevron-down text-[#050505] text-[9px]"></i>
                    </div>
                </button>
            </div>
        </div>
    </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════════════
         MAIN CONTENT
         ═══════════════════════════════════════════════════════════════════════ -->
    <div 
        ref="scrollContainer"
        @scroll="handleScroll"
        class="h-[100dvh] w-full overflow-y-auto no-scrollbar snap-y snap-proximity scroll-pt-0"
    >
        <!-- ═══════════════════════════════════════════════════════════════════
             HERO SECTION - Photo with Dark Overlay
             ═══════════════════════════════════════════════════════════════════ -->
        <section id="home" class="hero-section h-[100dvh] w-full relative flex flex-col items-center justify-end pb-24 overflow-hidden group">
            <!-- 1. Background Photo & Smart Gradient -->
            <div class="absolute inset-0 z-0">
                <!-- Foto dengan efek scale pelan saat load -->
                <img v-if="heroBackground" :src="heroBackground" class="w-full h-full object-cover scale-105 animate-subtle-zoom" referrerpolicy="no-referrer" />
                
                <!-- Smart Gradient: Gelap di bawah (untuk teks), Terang di tengah (untuk wajah) -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"></div>
                
                <!-- Vignette halus di pinggir -->
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
            </div>

            <!-- 2. Gunungan "Giant watermark" yang megah -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] md:w-[80%] opacity-10 pointer-events-none mix-blend-overlay animate-pulse-slow">
                <NuxtImg src="/images/themes/gunungan-motif.png" class="w-full h-auto" />
            </div>
            
            <!-- 3. Content dengan Entrance Animation -->
            <div class="relative z-20 text-center px-6 w-full max-w-4xl">
                <!-- Small Floating Gunungan Icon (Logo) -->
                <div class="w-24 md:w-32 h-auto mx-auto mb-6 opacity-0 animate-fade-in-down" style="animation-delay: 0.3s;">
                    <NuxtImg 
                        src="/images/themes/gunungan-motif.png" 
                        class="w-full h-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] filter brightness-110"
                    />
                </div>
                
                <!-- Super Large Names with Overlap Effect -->
                <div class="mb-8 relative">
                    <h1 class="font-script text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-tr from-[#bf953f] via-[#fcf6ba] to-[#b38728] drop-shadow-2xl leading-none opacity-0 animate-scale-in" style="animation-delay: 0.6s;">
                        {{ firstNickname }}
                    </h1>
                    <div class="text-3xl md:text-5xl text-white/80 font-serif italic my-[-10px] md:my-[-20px] relative z-10 opacity-0 animate-fade-in" style="animation-delay: 0.9s;">&</div>
                    <h1 class="font-script text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-bl from-[#b38728] via-[#fcf6ba] to-[#bf953f] drop-shadow-2xl leading-none opacity-0 animate-scale-in" style="animation-delay: 1.1s;">
                        {{ secondNickname }}
                    </h1>
                </div>
                
                <!-- Modern Minimalist Details -->
                <div class="space-y-4 opacity-0 animate-fade-in-up" style="animation-delay: 1.5s;">
                    <div class="flex items-center justify-center gap-4 text-gold/90 font-display tracking-[0.2em] text-sm md:text-base uppercase shadow-black/50 drop-shadow-lg">
                        <span class="border-b border-gold/30 pb-1 font-bold">{{ texts.weddingDay }}</span>
                    </div>
                </div>

                <!-- Simple Elegant Countdown -->
                <div class="mt-10 opacity-0 animate-fade-in-up w-full flex justify-center" style="animation-delay: 1.8s;">
                     <CountdownSection 
                        :target-date="content?.events?.akad?.isoDate || '2026-12-31T00:00:00Z'" 
                        class="gunungan-countdown horizontal-counter"
                    />
                </div>
            </div>
            
            <!-- Scroll Indicator -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style="animation-delay: 2.5s;">
                <span class="text-[10px] uppercase tracking-widest text-white/50">Scroll to Begin</span>
                <div class="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent"></div>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             QUOTE SECTION - With Mandala Background
             ═══════════════════════════════════════════════════════════════════ -->
        <section class="quote-section w-full flex flex-col items-center justify-center py-16 px-8 bg-[#1a1a1a] relative overflow-hidden">
            <!-- Mandala Background Decoration - Optimized with NuxtImg -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl opacity-20 pointer-events-none">
                <NuxtImg 
                    src="/images/themes/mandala-gold.jpg" 
                    alt="" 
                    width="600"
                    loading="lazy"
                    format="webp"
                    quality="60"
                    class="w-full h-auto"
                />
            </div>
            
            <!-- Gradient Overlay for text readability -->
            <div class="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/40 via-transparent to-[#1a1a1a]"></div>
            
            <div class="max-w-2xl text-center relative z-10">
                <p class="font-serif text-base md:text-lg lg:text-xl text-white/80 italic leading-relaxed">
                    "{{ content?.quote?.content || texts.quoteDefault }}"
                </p>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             COUPLE PROFILES - With Gold Filigree Frames
             ═══════════════════════════════════════════════════════════════════ -->
        
        <!-- First Profile (Direct Snap Target) -->
        <section id="mempelai" class="profile-slide h-[100dvh] w-full bg-[#1a1a1a] relative overflow-hidden flex flex-col justify-center items-center snap-start px-6">
            <!-- Background Watermark Gunungan -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] md:w-[100%] opacity-5 pointer-events-none mix-blend-overlay animate-pulse-slow">
                <NuxtImg src="/images/themes/gunungan-motif.png" class="w-full h-auto" />
            </div>

            <div class="profile-card text-center reveal-on-scroll max-w-sm relative z-10">
                <!-- Circular Photo with Premium Frame -->
                <div class="profile-frame w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 relative group">
                    <!-- Outer Glow -->
                    <div class="absolute inset-[-10px] rounded-full bg-gold/10 blur-xl group-hover:bg-gold/20 transition-all duration-700"></div>
                    
                    <!-- Decorative Rotating Ring -->
                    <div class="absolute inset-0 rounded-full border border-gold/30 border-dashed animate-[spin_20s_linear_infinite]"></div>
                    
                    <!-- Main Frame -->
                    <div class="absolute inset-2 rounded-full border-[3px] border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] z-10"></div>
                    
                    <!-- Image Container -->
                    <div class="absolute inset-4 rounded-full overflow-hidden bg-[#2a2a2a] ring-2 ring-gold/20 z-0">
                        <img v-if="firstProfile?.image" :src="firstProfile.image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" referrerpolicy="no-referrer" />
                        <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
                            <i class="fas fa-user-tie text-5xl text-gold/20"></i>
                        </div>
                    </div>
                    
                    <!-- Bottom Ornament (CSS Based) -->
                    <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-gold drop-shadow-lg z-20">
                         <i class="fas fa-certificate text-2xl animate-bounce-slow"></i>
                    </div>
                </div>

                <div class="relative z-20 p-4">
                    <h3 class="font-script text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] mb-2 drop-shadow-md leading-tight">{{ firstProfile?.fullName || firstProfile?.nickname }}</h3>
                    
                    <div class="flex items-center justify-center gap-4 my-4 opacity-80">
                         <div class="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
                         <i class="fas fa-mars text-gold text-sm"></i>
                         <div class="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
                    </div>

                    <div class="space-y-1">
                        <p class="text-gold/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">{{ firstProfile?.isBride ? 'Putri' : 'Putra' }} Tercinta Dari</p>
                        <div class="text-white/90 font-serif italic text-lg leading-relaxed">
                            Bpk. {{ firstProfile?.fatherName }} <br/>
                            <span class="text-gold/50 text-sm">&</span> <br/>
                            Ibu {{ firstProfile?.motherName }}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Second Profile (Direct Snap Target) -->
        <section class="profile-slide h-[100dvh] w-full bg-[#1a1a1a] relative overflow-hidden flex flex-col justify-center items-center snap-start px-6">
            <!-- Background Watermark Gunungan -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] md:w-[100%] opacity-5 pointer-events-none mix-blend-overlay animate-pulse-slow">
                <NuxtImg src="/images/themes/gunungan-motif.png" class="w-full h-auto" />
            </div>

            <div class="profile-card text-center reveal-on-scroll max-w-sm relative z-10">
                <!-- Circular Photo with Premium Frame -->
                <div class="profile-frame w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 relative group">
                    <!-- Outer Glow -->
                    <div class="absolute inset-[-10px] rounded-full bg-gold/10 blur-xl group-hover:bg-gold/20 transition-all duration-700"></div>
                    
                    <!-- Decorative Rotating Ring -->
                    <div class="absolute inset-0 rounded-full border border-gold/30 border-dashed animate-[spin_20s_linear_infinite_reverse]"></div>
                    
                    <!-- Main Frame -->
                    <div class="absolute inset-2 rounded-full border-[3px] border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] z-10"></div>
                    
                    <!-- Image Container -->
                    <div class="absolute inset-4 rounded-full overflow-hidden bg-[#2a2a2a] ring-2 ring-gold/20 z-0">
                        <img v-if="secondProfile?.image" :src="secondProfile.image" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" referrerpolicy="no-referrer" />
                        <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]">
                             <i class="fas fa-user-dress text-5xl text-gold/20"></i>
                        </div>
                    </div>

                    <!-- Bottom Ornament (CSS Based) -->
                    <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-gold drop-shadow-lg z-20">
                         <i class="fas fa-certificate text-2xl animate-bounce-slow" style="animation-delay: 0.5s;"></i>
                    </div>
                </div>

                <div class="relative z-20 p-4">
                    <h3 class="font-script text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] mb-2 drop-shadow-md leading-tight">{{ secondProfile?.fullName || secondProfile?.nickname }}</h3>
                    
                    <div class="flex items-center justify-center gap-4 my-4 opacity-80">
                         <div class="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
                         <i class="fas fa-venus text-gold text-sm"></i>
                         <div class="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
                    </div>

                    <div class="space-y-1">
                        <p class="text-gold/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">{{ secondProfile?.isBride ? 'Putri' : 'Putra' }} Tercinta Dari</p>
                        <div class="text-white/90 font-serif italic text-lg leading-relaxed">
                            Bpk. {{ secondProfile?.fatherName }} <br/>
                            <span class="text-gold/50 text-sm">&</span> <br/>
                            Ibu {{ secondProfile?.motherName }}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════════
             EVENTS SECTION - "The Twin Royal Cards" (Merged View)
             ═══════════════════════════════════════════════════════════════════════ -->
        <section id="acara" class="event-slide min-h-[100dvh] w-full bg-[#111] relative overflow-hidden flex flex-col justify-center items-center py-24 px-4">
            
            <!-- Background Texture -->
            <div class="absolute inset-0 opacity-5 pointer-events-none">
                <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-fixed bg-cover bg-center grayscale mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-radial-vignette"></div>
            </div>

            <div class="max-w-7xl mx-auto w-full relative z-10">
                <div class="text-center mb-16 reveal-on-scroll">
                    <h2 class="font-display text-4xl md:text-5xl text-gold mb-4 drop-shadow-md">Rangakaian Acara</h2>
                    <div class="flex items-center justify-center gap-3 opacity-60">
                         <div class="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                         <i class="fas fa-gem text-gold text-xs animate-pulse-slow"></i>
                         <div class="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start justify-center">
                    
                    <!-- AKAD CARD -->
                    <div v-if="content?.events?.akad?.date" class="relative group perspective reveal-on-scroll">
                        <div class="relative bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-sm shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:-translate-y-2">
                            <!-- Corner Ornaments -->
                            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold opacity-80"></div>
                            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold opacity-80"></div>
                            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold opacity-80"></div>
                            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold opacity-80"></div>

                            <!-- Content -->
                            <div class="text-center relative z-10">
                                <!-- Icon -->
                                <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center relative">
                                    <div class="absolute inset-0 bg-gold/10 rounded-full blur-xl animate-pulse-slow"></div>
                                    <i class="fas fa-ring text-4xl text-gold drop-shadow-md"></i>
                                </div>

                                <h3 class="font-display text-2xl text-white mb-8 tracking-widest uppercase">{{ texts.theCeremony }}</h3>
                                
                                <!-- Date Display -->
                                <div class="flex items-center justify-center gap-6 mb-8 border-y border-white/5 py-6">
                                    <div class="text-right">
                                        <p class="text-sm uppercase tracking-widest text-gold/80 mb-1">{{ new Date(content?.events?.akad?.date).toLocaleString('id-ID', { weekday: 'long' }) }}</p>
                                        <p class="text-xs text-white/50">{{ new Date(content?.events?.akad?.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }}</p>
                                    </div>
                                    <div class="w-px h-12 bg-white/10"></div>
                                    <div class="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] drop-shadow-sm">
                                        {{ new Date(content?.events?.akad?.date).getDate() }}
                                    </div>
                                </div>

                                <div class="mb-8 space-y-2">
                                    <p class="text-xl text-white font-serif italic">{{ content?.events?.akad?.time }} WIB</p>
                                    <p class="text-sm text-white/60 leading-relaxed px-4">{{ content?.events?.akad?.location }}</p>
                                </div>
                                
                                <!-- Buttons (No White Borders) -->
                                <div class="flex flex-col gap-3">
                                    <a v-if="content?.events?.akad?.mapsUrl" :href="content?.events?.akad?.mapsUrl" target="_blank" 
                                       class="w-full inline-flex justify-center items-center gap-2 bg-gold hover:bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm shadow-lg">
                                        <i class="fas fa-location-arrow"></i> {{ texts.visitLocation }}
                                    </a>
                                    <a :href="createCalendarLink(content?.events?.akad, `The Wedding of ${firstNickname} & ${secondNickname} (${texts.theCeremony})`)" target="_blank"
                                       class="w-full inline-flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 text-gold px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm">
                                        <i class="far fa-calendar-plus"></i> Add to Calendar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RESEPSI CARD -->
                    <div v-if="receptionEvent?.date" class="relative group perspective reveal-on-scroll" style="transition-delay: 200ms;">
                        <div class="relative bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-sm shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:-translate-y-2">
                            <!-- Corner Ornaments -->
                            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold opacity-80"></div>
                            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold opacity-80"></div>
                            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold opacity-80"></div>
                            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold opacity-80"></div>

                            <!-- Content -->
                            <div class="text-center relative z-10">
                                <!-- Icon -->
                                <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center relative">
                                    <div class="absolute inset-0 bg-gold/10 rounded-full blur-xl animate-pulse-slow"></div>
                                    <i class="fas fa-champagne-glasses text-4xl text-gold drop-shadow-md"></i>
                                </div>

                                <h3 class="font-display text-2xl text-white mb-8 tracking-widest uppercase">{{ texts.theReception }}</h3>
                                
                                <!-- Date Display -->
                                <div class="flex items-center justify-center gap-6 mb-8 border-y border-white/5 py-6">
                                    <div class="text-right">
                                        <p class="text-sm uppercase tracking-widest text-gold/80 mb-1">{{ new Date(receptionEvent.date).toLocaleString('id-ID', { weekday: 'long' }) }}</p>
                                        <p class="text-xs text-white/50">{{ new Date(receptionEvent.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }}</p>
                                    </div>
                                    <div class="w-px h-12 bg-white/10"></div>
                                    <div class="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] drop-shadow-sm">
                                        {{ new Date(receptionEvent.date).getDate() }}
                                    </div>
                                </div>

                                <div class="mb-8 space-y-2">
                                    <p class="text-xl text-white font-serif italic">{{ receptionEvent.time }} WIB</p>
                                    <p class="text-sm text-white/60 leading-relaxed px-4">{{ receptionEvent.location }}</p>
                                </div>
                                
                                <!-- Buttons (No White Borders) -->
                                <div class="flex flex-col gap-3">
                                    <a v-if="receptionEvent.mapsUrl" :href="receptionEvent.mapsUrl" target="_blank" 
                                       class="w-full inline-flex justify-center items-center gap-2 bg-gold hover:bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm shadow-lg">
                                        <i class="fas fa-location-arrow"></i> {{ texts.visitLocation }}
                                    </a>
                                    <a :href="createCalendarLink(receptionEvent, `The Wedding of ${firstNickname} & ${secondNickname} (${texts.theReception})`)" target="_blank"
                                       class="w-full inline-flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 text-gold px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm">
                                        <i class="far fa-calendar-plus"></i> Add to Calendar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             GALLERY SECTION - With Gunungan Header
             ═══════════════════════════════════════════════════════════════════ -->
        <section id="galeri" v-if="content?.gallery?.length" class="gallery-section w-full min-h-[100dvh] flex flex-col justify-center bg-[#111] relative overflow-hidden py-24">
            
            <!-- Background Texture (Subtle Parang Fixed) -->
            <div class="absolute inset-0 opacity-5 pointer-events-none">
                <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-fixed bg-cover bg-center grayscale mix-blend-overlay"></div>
            </div>

            <!-- Gradient Fade Bottom (Seamless Transition) -->
            <div class="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-[#111]/80 to-transparent pointer-events-none z-20"></div>

            <!-- Title Header (Floating) -->
            <div class="absolute top-10 left-0 w-full text-center z-20 pointer-events-none mix-blend-difference text-white">
                <h2 class="font-display text-5xl md:text-7xl font-bold tracking-widest uppercase opacity-80">{{ texts.ourGallery }}</h2>
                <p class="text-xs md:text-sm font-serif italic tracking-[0.5em] mt-2 opacity-60">SCROLL TO EXPLORE</p>
            </div>
            
            <!-- 3-Column Layout -->
            <div class="w-full px-2 md:px-4 grid grid-cols-3 gap-2 md:gap-4 relative z-10 transform -skew-y-0">
                <!-- Column 1 -->
                <TransitionGroup tag="div" class="flex flex-col gap-2 md:gap-4"
                                 enter-active-class="transition-all duration-700 ease-out"
                                 enter-from-class="opacity-0 translate-y-20 scale-95"
                                 enter-to-class="opacity-100 translate-y-0 scale-100"
                                 leave-active-class="absolute opacity-0">
                    <div v-for="(img, idx) in visibleGallery.filter((_: any, i: number) => i % 3 === 0)" :key="`col1-${idx}`"
                         class="relative group cursor-pointer aspect-[3/4] mb-2 md:mb-4 overflow-hidden"
                         @click="openLightbox(img)">
                        <div class="w-full h-full"
                             :style="{ 
                                 transform: `skewY(${scrollSkew}deg)`,
                                 transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)' 
                             }">
                            <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    </div>
                </TransitionGroup>

                <!-- Column 2 (Offset Top) -->
                <TransitionGroup tag="div" class="flex flex-col gap-2 md:gap-4 pt-12 md:pt-24"
                                 enter-active-class="transition-all duration-700 ease-out delay-100"
                                 enter-from-class="opacity-0 translate-y-20 scale-95"
                                 enter-to-class="opacity-100 translate-y-0 scale-100"
                                 leave-active-class="absolute opacity-0">
                     <div v-for="(img, idx) in visibleGallery.filter((_: any, i: number) => i % 3 === 1)" :key="`col2-${idx}`"
                         class="relative group cursor-pointer aspect-[3/4] mb-2 md:mb-4 overflow-hidden"
                         @click="openLightbox(img)">
                        <div class="w-full h-full"
                             :style="{ 
                                 transform: `skewY(${scrollSkew}deg)`,
                                 transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)' 
                             }">
                            <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    </div>
                </TransitionGroup>

                <!-- Column 3 -->
                <TransitionGroup tag="div" class="flex flex-col gap-2 md:gap-4"
                                 enter-active-class="transition-all duration-700 ease-out delay-200"
                                 enter-from-class="opacity-0 translate-y-20 scale-95"
                                 enter-to-class="opacity-100 translate-y-0 scale-100"
                                 leave-active-class="absolute opacity-0">
                     <div v-for="(img, idx) in visibleGallery.filter((_: any, i: number) => i % 3 === 2)" :key="`col3-${idx}`"
                         class="relative group cursor-pointer aspect-[3/4] mb-2 md:mb-4 overflow-hidden"
                         @click="openLightbox(img)">
                        <div class="w-full h-full"
                             :style="{ 
                                 transform: `skewY(${scrollSkew}deg)`,
                                 transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)' 
                             }">
                            <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>

            <!-- Load More Button - With FLIP Animation -->
            <div v-if="hasMoreGallery" class="load-more-container relative w-full z-30 flex flex-col items-center mt-8 pb-12">
                <!-- Gradient Fade Above Button -->
                <div class="absolute -top-32 left-0 w-full h-32 bg-gradient-to-t from-[#111] via-[#111]/50 to-transparent pointer-events-none"></div>
                
                <div class="text-center">
                    <button @click="loadMoreGallery" :disabled="isLoadingMore"
                            class="inline-flex items-center gap-3 px-10 py-4 border border-[#D4AF37] text-[#D4AF37] bg-[#111] hover:bg-[#D4AF37] hover:text-black transition-all duration-500 uppercase tracking-widest text-xs md:text-sm font-medium group shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-full disabled:opacity-70 disabled:cursor-wait">
                        <span v-if="!isLoadingMore">Eksplor Galeri</span>
                        <span v-else>Memuat...</span>
                        
                        <i v-if="!isLoadingMore" class="fas fa-arrow-down group-hover:translate-y-1 transition-transform"></i>
                        <i v-else class="fas fa-circle-notch fa-spin"></i>
                    </button>
                    <p class="text-white/40 text-[10px] uppercase tracking-widest mt-3">{{ galleryVisibleCount }} / {{ content?.gallery?.length }} MOMENTS</p>
                </div>
            </div>

            <!-- Lightbox Modal -->
            <Transition enter-active-class="transition duration-300 ease-out"
                        enter-from-class="opacity-0 scale-95"
                        enter-to-class="opacity-100 scale-100"
                        leave-active-class="transition duration-200 ease-in"
                        leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-95">
                <div v-if="selectedImage" class="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md" @click="closeLightbox">
                    <div class="relative max-w-5xl w-full max-h-screen flex flex-col items-center justify-center p-2" @click.stop>
                         <!-- Close Button -->
                        <button class="absolute -top-12 right-0 md:-right-4 text-white hover:text-gold transition-colors p-2 z-[10000]" @click="closeLightbox">
                            <i class="fas fa-times text-2xl md:text-3xl"></i>
                        </button>
                        
                        <div class="relative border-4 border-white/10 p-1 bg-[#050505] shadow-2xl max-h-[85vh] overflow-hidden">
                             <img :src="selectedImage" class="w-auto h-auto max-h-[80vh] object-contain" />
                        </div>
                    </div>
                </div>
            </Transition>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             GIFT SECTION
             ═══════════════════════════════════════════════════════════════════ -->
        <section id="hadiah" class="gift-section w-full min-h-[100dvh] flex flex-col justify-center py-24 px-6 bg-[#111] relative">
            <!-- Background Texture -->
            <!-- Background Texture -->
             <div class="absolute inset-0 opacity-5 pointer-events-none">
                <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-fixed bg-cover bg-center grayscale mix-blend-overlay"></div>
            </div>

            <div class="max-w-lg mx-auto text-center relative z-10">
                <h2 class="font-display text-4xl md:text-5xl text-gold mb-2 drop-shadow-md">{{ texts.weddingGift }}</h2>
                <div class="flex items-center justify-center gap-3 mb-8">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <i class="fas fa-gift text-gold text-lg animate-bounce-slow"></i>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                
                <GiftSection :gift="content?.gift || {}" class="gunungan-gift" />
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             RSVP SECTION
             ═══════════════════════════════════════════════════════════════════ -->
        <section id="ucapan" class="rsvp-section w-full min-h-[100dvh]  py-24 px-6 bg-[#1a1a1a] relative">
             <!-- Background Texture -->
             <div class="absolute inset-0 opacity-5 pointer-events-none">
                  <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-fixed bg-cover bg-center grayscale mix-blend-overlay"></div>
            </div>

            <div class="max-w-xl mx-auto text-center relative z-10">
                
                <!-- "THE ROYAL SCROLL" CONTAINER -->
                <div class="relative bg-gradient-to-b from-[#111] to-[#0a0a0a] p-8 md:p-12 rounded-sm shadow-2xl overflow-hidden">
                    
                    <!-- 0. INTERNAL TEXTURE (Batik Pattern) -->
                    <div class="absolute inset-0 opacity-10 pointer-events-none">
                        <NuxtImg src="/images/themes/mandala-gold.jpg" class="w-full h-full object-cover grayscale opacity-50" />
                    </div>
                    
                    <!-- 1. DECORATIVE BORDERS (REMOVED due to 'White Border' issue) -->
                    <!-- Clean look, relying on shadow and corners only -->
                    
                    <!-- 2. CORNER ORNAMENTS (Siku Wayang Style) -->
                    <!-- Top Left -->
                    <div class="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold opacity-80"></div>
                    <!-- Top Right -->
                    <div class="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold opacity-80"></div>
                    <!-- Bottom Left -->
                    <div class="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold opacity-80"></div>
                    <!-- Bottom Right -->
                    <div class="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold opacity-80"></div>
                    
                    <!-- 3. HEADER (Moved Inside the Scroll) -->
                    <div class="mb-10 relative z-10">
                        <!-- Gunungan Icon Divider -->
                        <div class="w-16 mx-auto mb-4 opacity-80">
                            <NuxtImg src="/images/themes/gunungan-motif.png" class="w-full h-auto drop-shadow-md" />
                        </div>
                        
                        <h2 class="font-display text-3xl md:text-4xl text-gold mb-4">{{ texts.rsvpTitle }}</h2>
                        <div class="flex items-center justify-center gap-3 opacity-60">
                            <div class="w-12 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                            <div class="w-2 h-2 rotate-45 border border-gold"></div>
                            <div class="w-12 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        </div>
                    </div>

                    <!-- 4. RSVP CONTENT -->
                    <RSVPSection 
                        :rsvp="content?.rsvp || {}" 
                        :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                        :is-authorized="(content as any)?._auth?.isAuthorized || false"
                        class="gunungan-rsvp relative z-10"
                    />
                </div>
            </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════
             FOOTER
             ═══════════════════════════════════════════════════════════════════ -->
        <footer class="w-full min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_70%,_#000000_100%)] text-center relative overflow-hidden">
            <!-- 1. BACKGROUND: Solid Color Only -->

            <!-- 2. CORNER ORNAMENTS (Siku Emas) -->
            <div class="absolute top-10 left-6 w-16 h-16 border-t-2 border-l-2 border-gold opacity-50"></div>
            <div class="absolute top-10 right-6 w-16 h-16 border-t-2 border-r-2 border-gold opacity-50"></div>
            <div class="absolute bottom-24 left-6 w-16 h-16 border-b-2 border-l-2 border-gold opacity-50"></div>
            <div class="absolute bottom-24 right-6 w-16 h-16 border-b-2 border-r-2 border-gold opacity-50"></div>

            <!-- 3. MAIN CONTENT -->
            <div class="relative z-10 max-w-2xl mx-auto space-y-8 reveal-on-scroll">
                
                <!-- Gunungan Icon Divider -->
                <div class="w-16 mx-auto mb-6 opacity-80">
                    <NuxtImg src="/images/themes/gunungan-motif.png" class="w-full h-auto drop-shadow-md" />
                </div>

                <!-- Closing Greeting -->
                <div>
                     <p class="font-display text-2xl md:text-3xl text-gold mb-3 italic">Wassalamu'alaikum Wr. Wb.</p>
                     <p class="text-white/60 font-serif text-sm md:text-base leading-relaxed italic tracking-wide">
                        "Merupakan suatu kehormatan dan kebahagiaan bagi kami <br class="hidden md:block"/> apabila Bapak/Ibu/Saudara/i berkenan hadir <br class="hidden md:block"/> untuk memberikan doa restu kepada kami."
                     </p>
                </div>

                <!-- Couple Signature -->
                <div class="py-8">
                     <p class="text-[10px] uppercase tracking-[0.4em] text-gold/40 mb-4">Kami yang berbahagia</p>
                     <h2 class="font-display text-4xl md:text-6xl text-gradient-gold">{{ content?.hero?.groomNickname }} & {{ content?.hero?.brideNickname }}</h2>
                     <p class="text-[10px] uppercase tracking-[0.3em] text-gold/40 mt-4">Beserta Keluarga Besar</p>
                </div>

            </div>
            
            <!-- 4. BRANDING FOOTER -->
            <div class="absolute bottom-8 left-0 w-full text-center z-20">
                 <div class="w-24 h-px bg-white/10 mx-auto mb-4"></div>
                 <p class="text-white/20 text-[9px] uppercase tracking-[0.3em] hover:text-gold/50 transition-colors cursor-default">
                    Powered by <span class="font-bold">Mengundang</span>
                 </p>
            </div>
        </footer>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         FLOATING BOTTOM NAVIGATION - With Ribbon Flags (Demo 58 Style)
         ═══════════════════════════════════════════════════════════════════════ -->
    <nav v-if="isOpened" class="floating-nav fixed bottom-8 inset-x-0 mx-auto w-fit z-40 animate-fade-in-up" style="animation-delay: 1s;">
        <!-- Container Wrapper (No Overflow Hidden here, to allow Glow Bleed) -->
        <div class="relative flex items-center justify-center p-1">
            
            <!-- 1. Background & Texture Layer (CLIPPED ROUNDED-FULL) -->
            <div class="absolute inset-0 bg-[#0a0a0a] rounded-full overflow-hidden shadow-[0_5px_30px_rgba(0,0,0,0.8)] transform-gpu translate-z-0">
                <!-- Parang Batik Texture -->
                <div class="absolute inset-0 opacity-20 pointer-events-none rounded-full overflow-hidden">
                     <NuxtImg src="/images/themes/parang-batik.jpg" class="w-full h-full object-cover mix-blend-overlay" />
                </div>
            </div>

            <!-- 2. Content Layer (UNCLIPPED GLOW) -->
            <div class="relative flex items-center gap-2 md:gap-3 px-3 py-1 z-10">
                <button 
                    v-for="item in [
                        { id: 'mempelai', icon: 'fa-ring', label: 'Mempelai' },
                        { id: 'acara', icon: 'fa-champagne-glasses', label: 'Acara' },
                        { id: 'home', icon: 'gunungan', label: 'Home' },
                        { id: 'galeri', icon: 'fa-camera-retro', label: 'Galeri' },
                        { id: 'ucapan', icon: 'fa-envelope-open-text', label: 'Ucapan' },
                    ]"
                    :key="item.id"
                    @click="scrollToSection(item.id)"
                    class="nav-item relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-300 group active:scale-90"
                    :aria-label="item.label"
                >
                    <!-- Active Indicator (Glow behind - BLEEDING OUT) -->
                    <div class="absolute inset-0 rounded-full transition-all duration-500"
                         :class="activeSectionId === item.id ? 'bg-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-110' : 'bg-transparent group-hover:bg-white/5 scale-100'">
                    </div>

                    <!-- Icons -->
                    <template v-if="item.id === 'home'">
                         <!-- Special Gunungan Icon for Home -->
                         <NuxtImg 
                            src="/images/themes/gunungan-motif.png" 
                            class="w-8 h-auto md:w-9 transition-all duration-500 filter drop-shadow-md relative z-20"
                            :class="activeSectionId === item.id ? 'brightness-110 saturate-150 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'brightness-75 grayscale sepia opacity-70 group-hover:grayscale-0 group-hover:opacity-100'"
                         />
                    </template>
                    <template v-else>
                         <i :class="['fas', item.icon, 'text-lg md:text-xl transition-all duration-300 relative z-20', activeSectionId === item.id ? 'text-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]' : 'text-white/60 group-hover:text-gold']"></i>
                    </template>
                </button>
            </div>

        </div>
    </nav>
    
    <!-- FLOATING MUSIC -->
    <ClientOnly>
        <FloatingMusic 
            ref="audioPlayer" 
            :url="content?.music?.url || ''" 
            :start-time="content?.music?.startTime || 0"
            :fade="content?.music?.fade || false"
        />
    </ClientOnly>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════
   GUNUNGAN THEME - Javanese Luxury Wedding Invitation
   Cloned from WeddingPress Demo 58
   ═══════════════════════════════════════════════════════════════════════════════ */

.gunungan-theme {
    --gold: #D4AF37;
    --gold-dark: #B8860B;
    --black: #1a1a1a;
    --black-deep: #111111;
    
    background-color: var(--black);
    color: white;
}

/* === COLOR UTILITIES === */
.text-gold { color: var(--gold); }
.bg-gold { background-color: var(--gold); }
.border-gold { border-color: var(--gold); }

/* === TYPOGRAPHY === */
.font-script {
    font-family: 'Great Vibes', 'Alex Brush', 'Dancing Script', cursive;
}

.font-display {
    font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
    font-weight: 400;
    letter-spacing: 0.1em;
}

.font-serif {
    font-family: 'Cormorant Garamond', Georgia, serif;
}

/* === COVER TRANSITION === */
.cover-slide-leave-active {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.cover-slide-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

/* === ANIMATIONS === */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

/* === REVEAL ON SCROLL === */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* === SCROLLBAR === */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* === FLOATING NAV GLOW === */
.floating-nav {
    /* box-shadow moved to inner glass capsule */
}

/* === COMPONENT OVERRIDES === */
:deep(.gunungan-countdown) {
    display: flex;
    gap: 1rem;
}

:deep(.gunungan-countdown > div) {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
}

:deep(.gunungan-countdown .countdown-number) {
    font-size: 2rem;
    font-weight: 300;
    color: white;
    border: 1px solid var(--gold);
    padding: 0.75rem 1rem;
    min-width: 60px;
}

:deep(.gunungan-countdown .countdown-label) {
    font-size: 0.65rem;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
}

:deep(.gunungan-gift) {
    --gift-text: white;
    --gift-accent: var(--gold);
}

:deep(.gunungan-rsvp) {
    --rsvp-input-bg: var(--black);
    --rsvp-input-border: rgba(212, 175, 55, 0.3);
    --rsvp-input-text: white;
    --rsvp-button-bg: var(--gold);
    --rsvp-button-text: var(--black);
}

/* === RIBBON STYLING === */
.ribbon-container .ribbon {
    position: relative;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* === OPEN BUTTON HOVER === */
.open-btn:hover {
    transform: translateY(-2px);
}

/* === GUNUNGAN PULSE === */
.gunungan-icon {
    animation: gunungan-glow 3s ease-in-out infinite;
}

@keyframes gunungan-glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3)); }
    50% { filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.6)); }
}

/* === HERO ANIMATIONS === */
@keyframes subtle-zoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
}
.animate-subtle-zoom {
    animation: subtle-zoom 20s ease-out forwards;
}

@keyframes fade-in-down {
    0% { opacity: 0; transform: translateY(-30px); }
    100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
    animation: fade-in-down 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scale-in {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
    animation: scale-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
}
.animate-fade-in {
    animation: fade-in 1.5s ease-out forwards;
}

.animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin-slow-custom {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-spin-slow-custom {
    animation: spin-slow-custom 120s linear infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
.animate-float {
    animation: float 6s ease-in-out infinite;
}

@keyframes shine {
    from { transform: skewX(-12deg) translateX(-100%); }
    to { transform: skewX(-12deg) translateX(400%); }
}
.animate-shine {
    animation: shine 1.5s ease-in-out infinite;
}

@keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
.animate-bounce-slow {
    animation: bounce-slow 3s infinite ease-in-out;
}

/* === COUNTDOWN HORIZONTAL FIX === */
/* Root component wrapper overrides */
.gunungan-countdown.countdown-section {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    transform: scale(0.85); /* Kecilkan sedikit biar pas */
    transform-origin: top center;
    margin-bottom: 2rem; /* Jarak aman dari tombol audio */
}

/* Force horizontal layout on the inner flex container */
.gunungan-countdown :deep(.flex.justify-center) {
    flex-direction: row !important; 
    gap: 0.5rem !important; /* Rapatkan gap */
}

/* Override space-x utility behavior if needed */
.gunungan-countdown :deep(.space-x-3 > :not([hidden]) ~ :not([hidden])) {
    --tw-space-x-reverse: 0;
    margin-right: calc(0.5rem * var(--tw-space-x-reverse)) !important;
    margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse))) !important;
}

/* Specific styling for countdown items to be smaller */
.gunungan-countdown :deep(.flex-col) {
    min-width: 60px !important; /* Perkecil min-width box */
    padding: 0.5rem !important; /* Perkecil padding dalam box */
}
.gunungan-countdown :deep(.text-2xl) {
    font-size: 1.25rem !important; /* Perkecil font angka */
}
</style>
