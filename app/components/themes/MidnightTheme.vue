<script setup lang="ts">
import FloatingMusic from '~/components/FloatingMusic.vue'
import CoverSection from '~/components/CoverSection.vue'
import GiftSection from '~/components/GiftSection.vue'
import RSVPSection from '~/components/RSVPSection.vue'
import CountdownSection from '~/components/CountdownSection.vue'
import FloatingNav from '~/components/FloatingNav.vue'

const props = defineProps<{
    content: any
}>()

const route = useRoute()

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

const heroBackground = computed(() => {
    return props.content?.gallery?.[0] || props.content?.hero?.backgroundImage || props.content?.cover?.backgroundImage || ''
})

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

const texts = computed(() => {
    const t = props.content?.texts || {}
    return {
        weddingOf: t.weddingOf || 'The Wedding of',
        saveTheDate: t.saveTheDate || 'Save The Date',
        weddingDay: t.weddingDay || 'We Are Getting Married',
        brideLabel: t.brideLabel || 'The Bride',
        groomLabel: t.groomLabel || 'The Groom',
        daughterOf: t.daughterOf || 'Putri dari Bapak',
        sonOf: t.sonOf || 'Putra dari Bapak',
        andMrs: t.andMrs || 'dan Ibu',
        whenWhere: t.whenWhere || 'When & Where',
        ourEvents: t.ourEvents || 'Our Events',
        theCeremony: t.theCeremony || 'The Ceremony',
        theReception: t.theReception || 'The Reception',
        viewMap: t.viewMap || 'View on Maps',
        ourGallery: t.ourGallery || 'Our Gallery',
        weddingGift: t.weddingGift || 'Wedding Gift',
        giftText: t.giftText || 'Doa restu Anda adalah hadiah terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih:',
        rsvpTitle: t.rsvpTitle || "We Can't Wait to See You",
        rsvpSubtitle: t.rsvpSubtitle || 'Please let us know if you\'ll be able to make it',
        quoteDefault: t.quoteDefault || 'And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.',
        quoteSourceDefault: t.quoteSourceDefault || 'QS. Ar-Rum: 21',
        thankYou: t.thankYou || 'Thank You',
    }
})
</script>

<template>
  <div class="midnight-theme h-screen w-full relative overflow-hidden" data-theme="midnight">
    
    <!-- ═══════════════════════════════════════════════════════════════════
         MIDNIGHT ELEGANCE THEME
         A premium dark luxury wedding invitation with gold accents
         ═══════════════════════════════════════════════════════════════════ -->

    <!-- MAIN SCROLLABLE CONTENT -->
    <div 
        @scroll="handleScroll"
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto scroll-smooth relative no-scrollbar"
    >
        
        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  1. HERO SECTION - Full Bleed with Cinematic Overlay           ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section 
            id="header"
            class="hero-section min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
        >
            <!-- Background Image with Dark Cinematic Treatment -->
            <div class="absolute inset-0 z-0">
                <img v-if="heroBackground" :src="heroBackground" class="w-full h-full object-cover scale-105" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-b from-midnight/80 via-midnight/60 to-midnight"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-midnight/40 via-transparent to-midnight/40"></div>
            </div>
            
            <!-- Elegant Gold Frame Corners -->
            <div class="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-gold/30 z-20"></div>
            <div class="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-gold/30 z-20"></div>
            <div class="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-gold/30 z-20"></div>
            <div class="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-gold/30 z-20"></div>
            
            <!-- Content -->
            <div class="relative z-10 text-center px-6 py-20 max-w-3xl">
                <!-- Small Label -->
                <p class="text-gold uppercase tracking-[0.5em] text-[10px] md:text-xs mb-8 font-light animate-fadeIn">{{ texts.weddingOf }}</p>
                
                <!-- Main Names - MASSIVE & IMPACTFUL -->
                <h1 class="font-display text-7xl md:text-9xl lg:text-[10rem] text-white leading-none mb-4 animate-fadeIn animation-delay-200">
                    {{ firstNickname }}
                </h1>
                
                <!-- Ampersand with Gold Accent -->
                <div class="flex items-center justify-center gap-6 my-6 animate-fadeIn animation-delay-300">
                    <div class="w-20 md:w-32 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
                    <span class="text-gold font-display text-4xl md:text-5xl">&</span>
                    <div class="w-20 md:w-32 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
                </div>
                
                <h1 class="font-display text-7xl md:text-9xl lg:text-[10rem] text-white leading-none mb-10 animate-fadeIn animation-delay-400">
                    {{ secondNickname }}
                </h1>
                
                <!-- Date - Refined -->
                <div class="animate-fadeIn animation-delay-600">
                    <div class="inline-block border border-gold/30 px-8 py-4 backdrop-blur-sm">
                        <p class="text-champagne text-sm md:text-base tracking-[0.3em] uppercase font-light">{{ content?.hero?.date }}</p>
                    </div>
                </div>
            </div>
            
            <!-- Scroll Indicator -->
            <button @click="scrollToSection('quote')" class="absolute bottom-10 animate-float text-gold/60 hover:text-gold transition-colors z-10">
                <div class="flex flex-col items-center gap-3">
                    <span class="text-[10px] uppercase tracking-[0.3em] text-champagne/50">Scroll</span>
                    <div class="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent"></div>
                </div>
            </button>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  2. QUOTE SECTION - Elegant Islamic/Romantic Quote             ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="quote" class="min-h-[70vh] w-full flex flex-col items-center justify-center px-8 py-24 bg-midnight relative overflow-hidden">
            <!-- Subtle Pattern Overlay -->
            <div class="absolute inset-0 opacity-5 bg-pattern"></div>
            
            <div class="max-w-2xl text-center relative z-10">
                <!-- Decorative Element -->
                <div class="flex items-center justify-center gap-4 mb-10">
                    <div class="w-16 h-px bg-gradient-to-r from-transparent to-gold/40"></div>
                    <div class="w-3 h-3 border border-gold/40 rotate-45"></div>
                    <div class="w-16 h-px bg-gradient-to-r from-gold/40 to-transparent"></div>
                </div>
                
                <p class="font-serif text-lg md:text-xl lg:text-2xl leading-relaxed text-champagne/90 italic mb-10">
                    "{{ content?.quote?.content || texts.quoteDefault }}"
                </p>
                
                <div class="flex items-center justify-center gap-4">
                    <div class="w-8 h-px bg-gold/30"></div>
                    <p class="text-gold text-xs tracking-[0.2em] uppercase">{{ content?.quote?.source || texts.quoteSourceDefault }}</p>
                    <div class="w-8 h-px bg-gold/30"></div>
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  3. COUNTDOWN SECTION - Luxurious Box Design                   ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="countdown" class="min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 bg-charcoal relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl"></div>
            
            <div class="relative z-10 text-center w-full max-w-lg">
                <!-- Label -->
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light">{{ texts.saveTheDate }}</p>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                
                <h2 class="font-display text-4xl md:text-6xl text-white mb-12">{{ texts.weddingDay }}</h2>
                
                <!-- Premium Glass Countdown Box -->
                <div class="bg-midnight/50 backdrop-blur-xl border border-gold/20 rounded-sm p-10 md:p-14 shadow-2xl shadow-black/50">
                    <CountdownSection 
                        :target-date="content?.events?.akad?.isoDate || '2025-01-01T00:00:00Z'" 
                        class="midnight-countdown"
                    />
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  4. COUPLE SECTION - Editorial Style Profiles                  ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="mempelai" class="w-full bg-midnight py-24 relative">
            <!-- Section Header -->
            <div class="text-center mb-20 px-6">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <div class="w-2 h-2 bg-gold/60 rotate-45"></div>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light mb-4">The Couple</p>
                <h2 class="font-display text-5xl md:text-7xl text-white">{{ firstNickname }} & {{ secondNickname }}</h2>
            </div>
            
            <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-0">
                <!-- First Profile -->
                <div class="profile-card relative group overflow-hidden">
                    <!-- Background Image -->
                    <div class="aspect-[3/4] relative overflow-hidden">
                        <img v-if="firstProfile?.image" :src="firstProfile.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerpolicy="no-referrer" />
                        <div v-else class="w-full h-full bg-charcoal flex items-center justify-center">
                            <i class="fas fa-user text-6xl text-gold/20"></i>
                        </div>
                        <!-- Gradient Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent"></div>
                    </div>
                    
                    <!-- Info Overlay -->
                    <div class="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <p class="text-gold uppercase tracking-[0.3em] text-[10px] mb-2">{{ firstProfile?.isBride ? texts.brideLabel : texts.groomLabel }}</p>
                        <h3 class="font-display text-4xl md:text-5xl text-white mb-3">{{ firstProfile?.nickname }}</h3>
                        <p class="text-champagne/70 text-sm mb-4">{{ firstProfile?.fullName }}</p>
                        <div class="text-champagne/50 text-xs leading-relaxed">
                            <p>{{ firstProfile?.isBride ? texts.daughterOf : texts.sonOf }} {{ firstProfile?.fatherName }}</p>
                            <p>{{ texts.andMrs }} {{ firstProfile?.motherName }}</p>
                        </div>
                    </div>
                </div>

                <!-- Second Profile -->
                <div class="profile-card relative group overflow-hidden">
                    <div class="aspect-[3/4] relative overflow-hidden">
                        <img v-if="secondProfile?.image" :src="secondProfile.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerpolicy="no-referrer" />
                        <div v-else class="w-full h-full bg-charcoal flex items-center justify-center">
                            <i class="fas fa-user text-6xl text-gold/20"></i>
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent"></div>
                    </div>
                    
                    <div class="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <p class="text-gold uppercase tracking-[0.3em] text-[10px] mb-2">{{ secondProfile?.isBride ? texts.brideLabel : texts.groomLabel }}</p>
                        <h3 class="font-display text-4xl md:text-5xl text-white mb-3">{{ secondProfile?.nickname }}</h3>
                        <p class="text-champagne/70 text-sm mb-4">{{ secondProfile?.fullName }}</p>
                        <div class="text-champagne/50 text-xs leading-relaxed">
                            <p>{{ secondProfile?.isBride ? texts.daughterOf : texts.sonOf }} {{ secondProfile?.fatherName }}</p>
                            <p>{{ texts.andMrs }} {{ secondProfile?.motherName }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  5. EVENTS SECTION - Elegant Cards                             ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="events" class="w-full bg-charcoal py-24 relative overflow-hidden">
            <!-- Decorative Lines -->
            <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
            <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent"></div>
            
            <!-- Section Header -->
            <div class="text-center mb-16 px-6 relative z-10">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <div class="w-2 h-2 bg-gold/60 rotate-45"></div>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light mb-4">{{ texts.ourEvents }}</p>
                <h2 class="font-display text-5xl md:text-6xl text-white">{{ texts.whenWhere }}</h2>
            </div>
            
            <div class="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-8 relative z-10">
                <!-- Akad / Ceremony -->
                <div v-if="content?.events?.akad?.date" class="event-card bg-midnight/80 backdrop-blur-sm border border-gold/10 p-10 text-center hover:border-gold/30 transition-all duration-500">
                    <div class="w-16 h-16 border border-gold/30 flex items-center justify-center mx-auto mb-8">
                        <i class="fas fa-ring text-gold text-xl"></i>
                    </div>
                    <h3 class="font-display text-3xl text-white mb-6">{{ texts.theCeremony }}</h3>
                    <div class="space-y-2 mb-8">
                        <p class="text-gold font-medium">{{ content?.events?.akad?.date }}</p>
                        <p class="text-white text-lg">{{ content?.events?.akad?.time }} WIB</p>
                        <p class="text-champagne/60 text-sm leading-relaxed">{{ content?.events?.akad?.location }}</p>
                    </div>
                    <a v-if="content?.events?.akad?.mapsUrl" :href="content?.events?.akad?.mapsUrl" target="_blank" 
                       class="inline-flex items-center gap-3 border border-gold/40 text-gold px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all duration-300">
                        <i class="fas fa-location-dot"></i> {{ texts.viewMap }}
                    </a>
                </div>

                <!-- Reception -->
                <div v-if="receptionEvent?.date" class="event-card bg-midnight/80 backdrop-blur-sm border border-gold/10 p-10 text-center hover:border-gold/30 transition-all duration-500">
                    <div class="w-16 h-16 border border-gold/30 flex items-center justify-center mx-auto mb-8">
                        <i class="fas fa-champagne-glasses text-gold text-xl"></i>
                    </div>
                    <h3 class="font-display text-3xl text-white mb-6">{{ texts.theReception }}</h3>
                    <div class="space-y-2 mb-8">
                        <p class="text-gold font-medium">{{ receptionEvent?.date }}</p>
                        <p class="text-white text-lg">{{ receptionEvent?.time }} WIB</p>
                        <p class="text-champagne/60 text-sm leading-relaxed">{{ receptionEvent?.location }}</p>
                    </div>
                    <a v-if="receptionEvent?.mapsUrl" :href="receptionEvent?.mapsUrl" target="_blank" 
                       class="inline-flex items-center gap-3 border border-gold/40 text-gold px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-midnight transition-all duration-300">
                        <i class="fas fa-location-dot"></i> {{ texts.viewMap }}
                    </a>
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  6. GALLERY SECTION - Masonry Grid                             ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="gallery" v-if="content?.gallery?.length" class="w-full bg-midnight py-24">
            <!-- Section Header -->
            <div class="text-center mb-16 px-6">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <div class="w-2 h-2 bg-gold/60 rotate-45"></div>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light mb-4">Moments</p>
                <h2 class="font-display text-5xl md:text-6xl text-white">{{ texts.ourGallery }}</h2>
            </div>
            
            <!-- Gallery Grid -->
            <div class="max-w-6xl mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div v-for="(img, idx) in content?.gallery?.slice(0, 6)" :key="idx" 
                         class="gallery-item aspect-square overflow-hidden group cursor-pointer"
                         :class="{ 'md:row-span-2 md:aspect-auto': idx === 0 || idx === 3 }">
                        <img :src="img" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110" referrerpolicy="no-referrer" />
                    </div>
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  7. GIFT SECTION                                               ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="gift" class="w-full bg-charcoal py-24 px-6">
            <div class="max-w-lg mx-auto text-center">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <div class="w-2 h-2 bg-gold/60 rotate-45"></div>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light mb-4">Love Gift</p>
                <h2 class="font-display text-4xl md:text-5xl text-white mb-6">{{ texts.weddingGift }}</h2>
                <p class="text-champagne/60 text-sm mb-12">{{ texts.giftText }}</p>
                
                <GiftSection :gift="content?.gift || {}" class="midnight-gift" />
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  8. RSVP SECTION                                               ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <section id="rsvp" class="w-full bg-midnight py-24 px-6 relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-3xl"></div>
            
            <div class="max-w-xl mx-auto text-center relative z-10">
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-12 h-px bg-gold/40"></div>
                    <div class="w-2 h-2 bg-gold/60 rotate-45"></div>
                    <div class="w-12 h-px bg-gold/40"></div>
                </div>
                <p class="text-gold uppercase tracking-[0.4em] text-[10px] font-light mb-4">Confirmation</p>
                <h2 class="font-display text-4xl md:text-5xl text-white mb-4">{{ texts.rsvpTitle }}</h2>
                <p class="text-champagne/60 text-sm mb-12">{{ texts.rsvpSubtitle }}</p>
                
                <div class="bg-charcoal/50 backdrop-blur-sm border border-gold/10 p-8 md:p-12">
                    <RSVPSection 
                        :rsvp="content?.rsvp || {}" 
                        :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                        :is-authorized="(content as any)?._auth?.isAuthorized || false"
                        class="midnight-rsvp"
                    />
                </div>
            </div>
        </section>

        <!-- ╔═══════════════════════════════════════════════════════════════╗
             ║  FOOTER                                                        ║
             ╚═══════════════════════════════════════════════════════════════╝ -->
        <footer class="w-full bg-midnight py-20 px-6 border-t border-gold/10">
            <div class="text-center">
                <!-- Decorative -->
                <div class="flex items-center justify-center gap-4 mb-8">
                    <div class="w-16 h-px bg-gradient-to-r from-transparent to-gold/30"></div>
                    <i class="fas fa-heart text-gold text-sm"></i>
                    <div class="w-16 h-px bg-gradient-to-r from-gold/30 to-transparent"></div>
                </div>
                
                <h3 class="font-display text-5xl md:text-6xl text-white mb-4">{{ texts.thankYou }}</h3>
                <p class="text-gold text-lg mb-2">{{ firstNickname }} & {{ secondNickname }}</p>
                <p class="text-champagne/40 text-xs italic mb-10">We are blessed to have you in our lives</p>
                
                <p class="text-champagne/30 text-[10px] uppercase tracking-widest">Powered by <span class="text-gold/50">Mengundang</span></p>
            </div>
        </footer>

    </div>
    
    <!-- COVER SECTION -->
    <CoverSection 
        @open="handleOpen" 
        :groom-name="firstNickname || ''" 
        :bride-name="secondNickname || ''" 
        :date="content?.hero?.date || ''"
        :background-image="content?.cover?.backgroundImage || content?.hero?.backgroundImage || ''"
        :guest-name="(route.query.to as string)"
        class="midnight-cover"
    />

    <!-- FLOATING MUSIC -->
    <ClientOnly>
        <FloatingMusic 
            ref="audioPlayer" 
            :url="content?.music?.url || ''" 
            :start-time="content?.music?.startTime || 0"
            :fade="content?.music?.fade || false"
        />
        
        <FloatingNav v-if="isOpened" :current-section-id="activeSectionId" @navigate="scrollToSection" />
    </ClientOnly>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   MIDNIGHT ELEGANCE THEME
   A premium dark luxury wedding invitation
   ═══════════════════════════════════════════════════════════════════════════ */

/* === COLOR SYSTEM === */
.midnight-theme {
    --midnight: #0a0a0f;
    --charcoal: #111118;
    --gold: #d4af37;
    --champagne: #f5e6d3;
    --white: #ffffff;
    
    background-color: var(--midnight);
    color: var(--champagne);
}

/* Utility Classes */
.bg-midnight { background-color: var(--midnight); }
.bg-charcoal { background-color: var(--charcoal); }
.text-gold { color: var(--gold); }
.text-champagne { color: var(--champagne); }
.text-white { color: var(--white); }
.border-gold { border-color: var(--gold); }

/* === TYPOGRAPHY === */
.font-display {
    font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
    font-weight: 300;
    letter-spacing: 0.05em;
}

.font-serif {
    font-family: 'Cormorant Garamond', Georgia, serif;
}

/* === ANIMATIONS === */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.animate-fadeIn {
    animation: fadeIn 1.2s ease-out forwards;
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
.animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
.animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
.animation-delay-600 { animation-delay: 0.6s; opacity: 0; }

/* === SUBTLE PATTERN === */
.bg-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* === SCROLL BEHAVIOR === */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* === REVEAL ANIMATION === */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* === GALLERY ITEMS === */
.gallery-item {
    position: relative;
}

.gallery-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--midnight) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.5s ease;
}

.gallery-item:hover::after {
    opacity: 0.3;
}

/* === COMPONENT STYLE OVERRIDES === */
:deep(.midnight-countdown) {
    --countdown-text: var(--champagne);
    --countdown-number: var(--white);
    --countdown-label: var(--gold);
}

:deep(.midnight-gift) {
    --gift-bg: var(--charcoal);
    --gift-border: var(--gold);
    --gift-text: var(--champagne);
}

:deep(.midnight-rsvp) {
    --rsvp-bg: transparent;
    --rsvp-input-bg: var(--midnight);
    --rsvp-input-border: rgba(212, 175, 55, 0.3);
    --rsvp-input-text: var(--champagne);
    --rsvp-button-bg: var(--gold);
    --rsvp-button-text: var(--midnight);
}

:deep(.midnight-cover) {
    --cover-overlay: rgba(10, 10, 15, 0.7);
    --cover-text: var(--white);
    --cover-accent: var(--gold);
}
</style>
