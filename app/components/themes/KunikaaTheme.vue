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

// Normalize profile data (backward compatible with old structure)
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

// Normalize event data (support both 'reception' and 'resepsi' keys)
const receptionEvent = computed(() => props.content?.events?.reception || props.content?.events?.resepsi)

// Get hero background - use gallery first image or background image
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

// Scroll to specific section by ID
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

// Centralized Texts - Kunikaa Original Style
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
  <div class="kunikaa-theme h-screen w-full relative bg-cream text-dark overflow-hidden" data-theme="kunikaa">
    
    <!-- WATERCOLOR FLORAL CORNER - TOP LEFT -->
    <div class="floral-corner floral-tl">
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Large watercolor roses cluster -->
        <defs>
          <radialGradient id="rose1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#E8D4E8"/>
            <stop offset="50%" stop-color="#C9A4C9"/>
            <stop offset="100%" stop-color="#9B7B9B"/>
          </radialGradient>
          <radialGradient id="rose2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F0E0F0"/>
            <stop offset="60%" stop-color="#D4B4D4"/>
            <stop offset="100%" stop-color="#A890A8"/>
          </radialGradient>
          <radialGradient id="leaf1" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#C8D4B8"/>
            <stop offset="100%" stop-color="#8BAF70"/>
          </radialGradient>
        </defs>
        
        <!-- Large leaves -->
        <ellipse cx="40" cy="200" rx="25" ry="60" fill="url(#leaf1)" opacity="0.7" transform="rotate(-50 40 200)"/>
        <ellipse cx="80" cy="240" rx="20" ry="50" fill="url(#leaf1)" opacity="0.6" transform="rotate(-30 80 240)"/>
        <ellipse cx="200" cy="40" rx="25" ry="60" fill="url(#leaf1)" opacity="0.7" transform="rotate(40 200 40)"/>
        <ellipse cx="240" cy="80" rx="20" ry="50" fill="url(#leaf1)" opacity="0.6" transform="rotate(60 240 80)"/>
        
        <!-- Main rose cluster -->
        <circle cx="100" cy="100" r="55" fill="url(#rose1)" opacity="0.9"/>
        <circle cx="100" cy="100" r="42" fill="url(#rose2)" opacity="0.85"/>
        <circle cx="100" cy="100" r="30" fill="#E8D4E8" opacity="0.8"/>
        <circle cx="100" cy="100" r="18" fill="#F4E8F4" opacity="0.9"/>
        
        <!-- Secondary roses -->
        <circle cx="50" cy="60" r="35" fill="url(#rose2)" opacity="0.8"/>
        <circle cx="50" cy="60" r="25" fill="#E0CCE0"/>
        <circle cx="50" cy="60" r="15" fill="#F0E4F0"/>
        
        <circle cx="160" cy="50" r="30" fill="url(#rose1)" opacity="0.75"/>
        <circle cx="160" cy="50" r="20" fill="#D8C4D8"/>
        <circle cx="160" cy="50" r="12" fill="#EEE0EE"/>
        
        <circle cx="60" cy="160" r="28" fill="url(#rose2)" opacity="0.7"/>
        <circle cx="60" cy="160" r="18" fill="#E4D4E4"/>
        
        <!-- Small accent buds -->
        <circle cx="20" cy="100" r="12" fill="#9B8AB8" opacity="0.6"/>
        <circle cx="100" cy="20" r="12" fill="#9B8AB8" opacity="0.6"/>
        <circle cx="140" cy="120" r="10" fill="#C9A4C9" opacity="0.5"/>
        <circle cx="120" cy="180" r="8" fill="#B494B4" opacity="0.5"/>
      </svg>
    </div>
    
    <!-- WATERCOLOR FLORAL CORNER - TOP RIGHT -->
    <div class="floral-corner floral-tr">
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rose3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#E8D4E8"/>
            <stop offset="50%" stop-color="#C9A4C9"/>
            <stop offset="100%" stop-color="#9B7B9B"/>
          </radialGradient>
          <radialGradient id="leaf2" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#C8D4B8"/>
            <stop offset="100%" stop-color="#8BAF70"/>
          </radialGradient>
        </defs>
        
        <!-- Leaves -->
        <ellipse cx="260" cy="200" rx="25" ry="60" fill="url(#leaf2)" opacity="0.7" transform="rotate(50 260 200)"/>
        <ellipse cx="220" cy="240" rx="20" ry="50" fill="url(#leaf2)" opacity="0.6" transform="rotate(30 220 240)"/>
        <ellipse cx="100" cy="40" rx="25" ry="60" fill="url(#leaf2)" opacity="0.7" transform="rotate(-40 100 40)"/>
        
        <!-- Roses -->
        <circle cx="200" cy="100" r="55" fill="url(#rose3)" opacity="0.9"/>
        <circle cx="200" cy="100" r="42" fill="#DCC8DC" opacity="0.85"/>
        <circle cx="200" cy="100" r="30" fill="#E8D8E8" opacity="0.8"/>
        <circle cx="200" cy="100" r="18" fill="#F4ECF4"/>
        
        <circle cx="250" cy="60" r="32" fill="url(#rose3)" opacity="0.8"/>
        <circle cx="250" cy="60" r="22" fill="#E0D0E0"/>
        
        <circle cx="140" cy="50" r="28" fill="url(#rose3)" opacity="0.75"/>
        <circle cx="140" cy="50" r="18" fill="#E4D8E4"/>
        
        <circle cx="240" cy="160" r="25" fill="url(#rose3)" opacity="0.7"/>
        <circle cx="240" cy="160" r="16" fill="#ECDCEC"/>
        
        <!-- Buds -->
        <circle cx="280" cy="100" r="12" fill="#9B8AB8" opacity="0.6"/>
        <circle cx="200" cy="20" r="10" fill="#B494B4" opacity="0.5"/>
      </svg>
    </div>
    
    <!-- WATERCOLOR FLORAL CORNER - BOTTOM LEFT -->
    <div class="floral-corner floral-bl">
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rose4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#E8D4E8"/>
            <stop offset="50%" stop-color="#C9A4C9"/>
            <stop offset="100%" stop-color="#9B7B9B"/>
          </radialGradient>
          <radialGradient id="leaf3" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#C8D4B8"/>
            <stop offset="100%" stop-color="#8BAF70"/>
          </radialGradient>
        </defs>
        
        <ellipse cx="40" cy="100" rx="25" ry="60" fill="url(#leaf3)" opacity="0.7" transform="rotate(-50 40 100)"/>
        <ellipse cx="80" cy="60" rx="20" ry="50" fill="url(#leaf3)" opacity="0.6" transform="rotate(-30 80 60)"/>
        <ellipse cx="200" cy="260" rx="25" ry="60" fill="url(#leaf3)" opacity="0.7" transform="rotate(40 200 260)"/>
        
        <circle cx="100" cy="200" r="55" fill="url(#rose4)" opacity="0.9"/>
        <circle cx="100" cy="200" r="42" fill="#DCC8DC" opacity="0.85"/>
        <circle cx="100" cy="200" r="30" fill="#E8D8E8" opacity="0.8"/>
        <circle cx="100" cy="200" r="18" fill="#F4ECF4"/>
        
        <circle cx="50" cy="240" r="32" fill="url(#rose4)" opacity="0.8"/>
        <circle cx="50" cy="240" r="22" fill="#E0D0E0"/>
        
        <circle cx="160" cy="250" r="28" fill="url(#rose4)" opacity="0.75"/>
        <circle cx="160" cy="250" r="18" fill="#E4D8E4"/>
        
        <circle cx="60" cy="140" r="25" fill="url(#rose4)" opacity="0.7"/>
        
        <circle cx="20" cy="200" r="12" fill="#9B8AB8" opacity="0.6"/>
        <circle cx="100" cy="280" r="10" fill="#B494B4" opacity="0.5"/>
      </svg>
    </div>
    
    <!-- WATERCOLOR FLORAL CORNER - BOTTOM RIGHT -->
    <div class="floral-corner floral-br">
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rose5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#E8D4E8"/>
            <stop offset="50%" stop-color="#C9A4C9"/>
            <stop offset="100%" stop-color="#9B7B9B"/>
          </radialGradient>
          <radialGradient id="leaf4" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#C8D4B8"/>
            <stop offset="100%" stop-color="#8BAF70"/>
          </radialGradient>
        </defs>
        
        <ellipse cx="260" cy="100" rx="25" ry="60" fill="url(#leaf4)" opacity="0.7" transform="rotate(50 260 100)"/>
        <ellipse cx="220" cy="60" rx="20" ry="50" fill="url(#leaf4)" opacity="0.6" transform="rotate(30 220 60)"/>
        <ellipse cx="100" cy="260" rx="25" ry="60" fill="url(#leaf4)" opacity="0.7" transform="rotate(-40 100 260)"/>
        
        <circle cx="200" cy="200" r="55" fill="url(#rose5)" opacity="0.9"/>
        <circle cx="200" cy="200" r="42" fill="#DCC8DC" opacity="0.85"/>
        <circle cx="200" cy="200" r="30" fill="#E8D8E8" opacity="0.8"/>
        <circle cx="200" cy="200" r="18" fill="#F4ECF4"/>
        
        <circle cx="250" cy="240" r="32" fill="url(#rose5)" opacity="0.8"/>
        <circle cx="250" cy="240" r="22" fill="#E0D0E0"/>
        
        <circle cx="140" cy="250" r="28" fill="url(#rose5)" opacity="0.75"/>
        <circle cx="140" cy="250" r="18" fill="#E4D8E4"/>
        
        <circle cx="240" cy="140" r="25" fill="url(#rose5)" opacity="0.7"/>
        
        <circle cx="280" cy="200" r="12" fill="#9B8AB8" opacity="0.6"/>
        <circle cx="200" cy="280" r="10" fill="#B494B4" opacity="0.5"/>
      </svg>
    </div>

    <!-- EDITOR MODE INDICATOR -->
    <div v-if="!isDataComplete && isOwnerOrPartner" class="fixed top-4 right-4 z-[60]">
        <NuxtLink to="/dashboard" class="bg-lavender text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium hover:opacity-90 transition-opacity">
            <i class="fas fa-exclamation-circle mr-2"></i>Data Belum Lengkap
        </NuxtLink>
    </div>

    <!-- MAIN SCROLLABLE CONTENT -->
    <div 
        @scroll="handleScroll"
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto scroll-smooth relative no-scrollbar z-10"
    >
        
        <!-- 1. HERO SECTION - Full Width with Background -->
        <section 
            id="header"
            class="hero-section min-h-screen w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll relative"
        >
            <!-- Background Image with Overlay -->
            <div class="absolute inset-0 z-0">
                <img v-if="heroBackground" :src="heroBackground" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80"></div>
            </div>
            
            <!-- Content -->
            <div class="relative z-10 text-center px-6 py-20">
                <!-- Wedding Of Label -->
                <p class="text-lavender uppercase tracking-[0.35em] text-xs md:text-sm mb-6 font-medium animate-fadeInUp">{{ texts.weddingOf }}</p>
                
                <!-- Couple Names - Big & Elegant -->
                <h1 class="font-script text-6xl md:text-8xl lg:text-9xl text-dark text-center leading-tight mb-6 animate-fadeInUp animation-delay-200">
                    {{ firstNickname }} <span class="text-lavender">&</span> {{ secondNickname }}
                </h1>
                
                <!-- Floral Divider -->
                <div class="flex items-center justify-center gap-4 mb-6 animate-fadeInUp animation-delay-400">
                    <div class="w-20 h-px bg-gradient-to-r from-transparent via-lavender/50 to-transparent"></div>
                    <svg class="w-8 h-8 text-lavender" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <div class="w-20 h-px bg-gradient-to-r from-transparent via-lavender/50 to-transparent"></div>
                </div>
                
                <!-- Date - Prominent -->
                <p class="text-dark/80 text-base md:text-lg tracking-[0.2em] uppercase font-light animate-fadeInUp animation-delay-600">{{ content?.hero?.date }}</p>
            </div>
            
            <!-- Scroll Indicator -->
            <button @click="scrollToSection('quote')" class="absolute bottom-8 animate-bounce text-lavender z-10">
                <div class="flex flex-col items-center gap-2">
                    <span class="text-xs uppercase tracking-widest text-dark/50">Scroll</span>
                    <i class="fas fa-chevron-down text-xl"></i>
                </div>
            </button>
        </section>

        <!-- 2. QUOTE SECTION -->
        <section id="quote" class="w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll px-8 py-24 bg-white">
            <div class="max-w-3xl text-center">
                <!-- Decorative Quote Mark -->
                <div class="text-lavender/30 text-6xl font-serif mb-4">"</div>
                <p class="font-serif text-xl md:text-2xl leading-relaxed text-dark/80 italic mb-6">
                    {{ content?.quote?.content || texts.quoteDefault }}
                </p>
                <div class="flex items-center justify-center gap-3">
                    <div class="w-12 h-px bg-lavender/40"></div>
                    <p class="text-lavender text-sm font-medium tracking-wider">{{ content?.quote?.source || texts.quoteSourceDefault }}</p>
                    <div class="w-12 h-px bg-lavender/40"></div>
                </div>
            </div>
        </section>

        <!-- 3. COUNTDOWN SECTION - Premium Box Design -->
        <section id="countdown" class="w-full flex flex-col items-center justify-center snap-start snap-always reveal-on-scroll py-20 px-6 bg-cream relative overflow-hidden">
            <!-- Decorative background -->
            <div class="absolute inset-0 opacity-5">
                <div class="absolute top-10 left-10 w-40 h-40 rounded-full bg-lavender"></div>
                <div class="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-lavender"></div>
            </div>
            
            <div class="relative z-10 text-center">
                <!-- Small decorative element -->
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="w-8 h-px bg-lavender/40"></div>
                    <div class="w-2 h-2 rounded-full bg-lavender/60"></div>
                    <div class="w-8 h-px bg-lavender/40"></div>
                </div>
                
                <p class="text-lavender uppercase tracking-[0.3em] text-xs mb-3 font-medium">{{ texts.saveTheDate }}</p>
                <h2 class="font-script text-4xl md:text-5xl text-dark mb-10">{{ texts.weddingDay }}</h2>
                
                <!-- Premium Countdown Box -->
                <div class="bg-white rounded-2xl shadow-2xl shadow-lavender/10 p-10 md:p-12 w-full max-w-lg mx-auto border border-lavender/10">
                    <CountdownSection 
                        :target-date="content?.events?.akad?.isoDate || '2025-01-01T00:00:00Z'" 
                        class="kunikaa-countdown"
                    />
                </div>
            </div>
        </section>

        <!-- 4. COUPLE PROFILE SECTION -->
        <section id="mempelai" class="w-full flex flex-col snap-start snap-always reveal-on-scroll py-20 px-6 bg-white">
            <!-- Section Header -->
            <div class="text-center mb-16">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="w-8 h-px bg-lavender/40"></div>
                    <div class="w-2 h-2 rounded-full bg-lavender/60"></div>
                    <div class="w-8 h-px bg-lavender/40"></div>
                </div>
                <p class="text-lavender uppercase tracking-[0.3em] text-xs mb-3 font-medium">Bride & Groom</p>
                <h2 class="font-script text-4xl md:text-5xl text-dark">{{ firstNickname }} & {{ secondNickname }}</h2>
            </div>
            
            <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
                <!-- First Profile -->
                <div class="text-center group">
                    <!-- Large Photo with Elegant Frame -->
                    <div class="relative w-52 h-52 md:w-64 md:h-64 mx-auto mb-8">
                        <div class="absolute inset-0 border-2 border-lavender/20 rounded-full transform group-hover:scale-105 transition-transform duration-500"></div>
                        <div class="absolute inset-3 border border-lavender/10 rounded-full"></div>
                        <div class="absolute inset-6 rounded-full overflow-hidden bg-gradient-to-br from-lavender/5 to-lavender/20 shadow-xl">
                            <img v-if="firstProfile?.image" :src="firstProfile.image" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <i class="fas fa-user text-4xl text-lavender/30"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Label -->
                    <p class="text-lavender uppercase tracking-[0.2em] text-xs mb-2 font-medium">{{ firstProfile?.isBride ? texts.brideLabel : texts.groomLabel }}</p>
                    
                    <!-- Name -->
                    <h3 class="font-script text-4xl md:text-5xl text-dark mb-3">{{ firstProfile?.nickname }}</h3>
                    <p class="text-dark/60 text-sm mb-4 font-light">{{ firstProfile?.fullName }}</p>
                    
                    <!-- Parents -->
                    <div class="text-dark/50 text-sm leading-relaxed">
                        <p>{{ firstProfile?.isBride ? texts.daughterOf : texts.sonOf }} {{ firstProfile?.fatherName }}</p>
                        <p>{{ texts.andMrs }} {{ firstProfile?.motherName }}</p>
                    </div>
                </div>

                <!-- Second Profile -->
                <div class="text-center group">
                    <div class="relative w-52 h-52 md:w-64 md:h-64 mx-auto mb-8">
                        <div class="absolute inset-0 border-2 border-lavender/20 rounded-full transform group-hover:scale-105 transition-transform duration-500"></div>
                        <div class="absolute inset-3 border border-lavender/10 rounded-full"></div>
                        <div class="absolute inset-6 rounded-full overflow-hidden bg-gradient-to-br from-lavender/5 to-lavender/20 shadow-xl">
                            <img v-if="secondProfile?.image" :src="secondProfile.image" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <i class="fas fa-user text-4xl text-lavender/30"></i>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-lavender uppercase tracking-[0.2em] text-xs mb-2 font-medium">{{ secondProfile?.isBride ? texts.brideLabel : texts.groomLabel }}</p>
                    <h3 class="font-script text-4xl md:text-5xl text-dark mb-3">{{ secondProfile?.nickname }}</h3>
                    <p class="text-dark/60 text-sm mb-4 font-light">{{ secondProfile?.fullName }}</p>
                    
                    <div class="text-dark/50 text-sm leading-relaxed">
                        <p>{{ secondProfile?.isBride ? texts.daughterOf : texts.sonOf }} {{ secondProfile?.fatherName }}</p>
                        <p>{{ texts.andMrs }} {{ secondProfile?.motherName }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 5. EVENTS SECTION - With Banner -->
        <section id="events" class="w-full flex flex-col snap-start snap-always reveal-on-scroll bg-cream">
            <!-- Event Banner -->
            <div class="relative h-64 md:h-80 w-full overflow-hidden">
                <img v-if="content?.gallery?.[1] || heroBackground" :src="content?.gallery?.[1] || heroBackground" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-dark/70"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p class="text-white/70 uppercase tracking-[0.3em] text-xs mb-3 font-medium">Planning</p>
                    <h2 class="font-script text-5xl md:text-6xl text-white">{{ texts.whenWhere }}</h2>
                    
                    <!-- Floral Decoration under banner text -->
                    <div class="mt-4">
                        <svg class="w-32 h-12" viewBox="0 0 120 40" fill="none">
                            <ellipse cx="20" cy="20" rx="8" ry="15" fill="#9CAF88" opacity="0.6" transform="rotate(-45 20 20)"/>
                            <circle cx="40" cy="20" r="10" fill="#C9A4C9" opacity="0.8"/>
                            <circle cx="40" cy="20" r="6" fill="#E0D0E0"/>
                            <circle cx="60" cy="20" r="14" fill="#B494B4" opacity="0.9"/>
                            <circle cx="60" cy="20" r="9" fill="#D4C4D4"/>
                            <circle cx="60" cy="20" r="5" fill="#EEE0EE"/>
                            <circle cx="80" cy="20" r="10" fill="#C9A4C9" opacity="0.8"/>
                            <circle cx="80" cy="20" r="6" fill="#E0D0E0"/>
                            <ellipse cx="100" cy="20" rx="8" ry="15" fill="#9CAF88" opacity="0.6" transform="rotate(45 100 20)"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Event Cards -->
            <div class="py-16 px-6">
                <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                    <!-- Akad Nikah / Ceremony -->
                    <div v-if="content?.events?.akad?.date" class="bg-white rounded-2xl p-8 md:p-10 shadow-xl shadow-lavender/5 text-center border border-lavender/10 hover:shadow-2xl hover:shadow-lavender/10 transition-shadow duration-500">
                        <div class="w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-ring text-lavender text-xl"></i>
                        </div>
                        <h3 class="font-script text-3xl text-dark mb-4">{{ texts.theCeremony }}</h3>
                        <p class="text-lavender font-medium mb-2">{{ content?.events?.akad?.date }}</p>
                        <p class="text-dark font-semibold text-lg mb-4">{{ content?.events?.akad?.time }} WIB</p>
                        <p class="text-dark/60 text-sm mb-6 leading-relaxed">{{ content?.events?.akad?.location }}</p>
                        <a v-if="content?.events?.akad?.mapsUrl" :href="content?.events?.akad?.mapsUrl" target="_blank" 
                           class="inline-flex items-center gap-2 bg-lavender text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-lavender/90 transition-colors">
                            <i class="fas fa-map-marker-alt"></i> {{ texts.viewMap }}
                        </a>
                    </div>

                    <!-- Resepsi / Reception -->
                    <div v-if="receptionEvent?.date" class="bg-white rounded-2xl p-8 md:p-10 shadow-xl shadow-lavender/5 text-center border border-lavender/10 hover:shadow-2xl hover:shadow-lavender/10 transition-shadow duration-500">
                        <div class="w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-glass-cheers text-lavender text-xl"></i>
                        </div>
                        <h3 class="font-script text-3xl text-dark mb-4">{{ texts.theReception }}</h3>
                        <p class="text-lavender font-medium mb-2">{{ receptionEvent?.date }}</p>
                        <p class="text-dark font-semibold text-lg mb-4">{{ receptionEvent?.time }} WIB</p>
                        <p class="text-dark/60 text-sm mb-6 leading-relaxed">{{ receptionEvent?.location }}</p>
                        <a v-if="receptionEvent?.mapsUrl" :href="receptionEvent?.mapsUrl" target="_blank" 
                           class="inline-flex items-center gap-2 bg-lavender text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-lavender/90 transition-colors">
                            <i class="fas fa-map-marker-alt"></i> {{ texts.viewMap }}
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- 6. GALLERY SECTION - With Banner -->
        <section id="gallery" v-if="content?.gallery?.length" class="w-full flex flex-col snap-start snap-always reveal-on-scroll bg-white">
            <!-- Gallery Banner -->
            <div class="relative h-48 md:h-64 w-full overflow-hidden">
                <img v-if="content?.gallery?.[2] || heroBackground" :src="content?.gallery?.[2] || heroBackground" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/80"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <h2 class="font-script text-5xl md:text-6xl text-dark">{{ texts.ourGallery }}</h2>
                    <!-- Floral Decoration -->
                    <div class="mt-3">
                        <svg class="w-28 h-10" viewBox="0 0 100 36" fill="none">
                            <ellipse cx="15" cy="18" rx="6" ry="12" fill="#9CAF88" opacity="0.6" transform="rotate(-45 15 18)"/>
                            <circle cx="35" cy="18" r="8" fill="#C9A4C9" opacity="0.8"/>
                            <circle cx="35" cy="18" r="5" fill="#E0D0E0"/>
                            <circle cx="50" cy="18" r="10" fill="#B494B4" opacity="0.9"/>
                            <circle cx="50" cy="18" r="6" fill="#D4C4D4"/>
                            <circle cx="65" cy="18" r="8" fill="#C9A4C9" opacity="0.8"/>
                            <circle cx="65" cy="18" r="5" fill="#E0D0E0"/>
                            <ellipse cx="85" cy="18" rx="6" ry="12" fill="#9CAF88" opacity="0.6" transform="rotate(45 85 18)"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Photo Grid -->
            <div class="py-12 px-6">
                <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-for="(img, idx) in content?.gallery?.slice(0, 6)" :key="idx" 
                         class="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 group">
                        <img :src="img" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerpolicy="no-referrer" />
                    </div>
                </div>
            </div>
        </section>

        <!-- 7. GIFT SECTION -->
        <section id="gift" class="w-full flex flex-col items-center snap-start snap-always reveal-on-scroll py-20 px-6 bg-cream">
            <div class="text-center mb-10">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="w-8 h-px bg-lavender/40"></div>
                    <div class="w-2 h-2 rounded-full bg-lavender/60"></div>
                    <div class="w-8 h-px bg-lavender/40"></div>
                </div>
                <h2 class="font-script text-4xl md:text-5xl text-dark mb-4">{{ texts.weddingGift }}</h2>
                <p class="text-dark/60 text-sm max-w-md mx-auto">{{ texts.giftText }}</p>
            </div>
            
            <div class="w-full max-w-md">
                <GiftSection :gift="content?.gift || {}" class="kunikaa-gift" />
            </div>
        </section>

        <!-- 8. RSVP SECTION - With Banner -->
        <section id="rsvp" class="w-full flex flex-col items-center snap-start snap-always reveal-on-scroll bg-white">
            <!-- RSVP Banner -->
            <div class="relative h-48 md:h-56 w-full overflow-hidden">
                <img v-if="content?.gallery?.[3] || heroBackground" :src="content?.gallery?.[3] || heroBackground" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark/30 to-dark/60"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p class="text-white/70 uppercase tracking-[0.3em] text-xs mb-3 font-medium">You're Invited</p>
                    <h2 class="font-script text-4xl md:text-5xl text-white">{{ texts.rsvpTitle }}</h2>
                    <p class="text-white/70 text-sm mt-3">{{ texts.rsvpSubtitle }}</p>
                </div>
            </div>
            
            <!-- RSVP Form -->
            <div class="py-12 px-6 w-full">
                <div class="w-full max-w-xl mx-auto bg-white rounded-2xl p-8 md:p-10 shadow-2xl shadow-lavender/10 border border-lavender/10 -mt-16 relative z-10">
                    <RSVPSection 
                        :rsvp="content?.rsvp || {}" 
                        :couple-name="`${content?.hero?.groomNickname} & ${content?.hero?.brideNickname}`"
                        :is-authorized="(content as any)?._auth?.isAuthorized || false"
                        class="kunikaa-rsvp"
                    />
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <section class="w-full py-20 bg-gradient-to-b from-cream to-lavender/20 px-6">
            <div class="text-center">
                <!-- Floral Decoration -->
                <svg class="w-32 h-12 mx-auto mb-6" viewBox="0 0 120 40" fill="none">
                    <ellipse cx="20" cy="20" rx="8" ry="15" fill="#9CAF88" opacity="0.6" transform="rotate(-45 20 20)"/>
                    <circle cx="40" cy="20" r="10" fill="#C9A4C9" opacity="0.8"/>
                    <circle cx="40" cy="20" r="6" fill="#E0D0E0"/>
                    <circle cx="60" cy="20" r="14" fill="#B494B4" opacity="0.9"/>
                    <circle cx="60" cy="20" r="9" fill="#D4C4D4"/>
                    <circle cx="60" cy="20" r="5" fill="#EEE0EE"/>
                    <circle cx="80" cy="20" r="10" fill="#C9A4C9" opacity="0.8"/>
                    <circle cx="80" cy="20" r="6" fill="#E0D0E0"/>
                    <ellipse cx="100" cy="20" rx="8" ry="15" fill="#9CAF88" opacity="0.6" transform="rotate(45 100 20)"/>
                </svg>
                
                <h3 class="font-script text-5xl text-dark mb-4">{{ texts.thankYou }}</h3>
                <p class="text-lavender font-medium text-xl mb-2">{{ firstNickname }} & {{ secondNickname }}</p>
                <p class="text-dark/50 text-sm italic mb-8">We are blessed to have you in our lives</p>
                
                <div class="flex items-center justify-center gap-3 mb-6">
                    <div class="w-12 h-px bg-lavender/30"></div>
                    <i class="fas fa-heart text-lavender"></i>
                    <div class="w-12 h-px bg-lavender/30"></div>
                </div>
                
                <p class="text-dark/40 text-xs">Powered by <span class="font-medium">Mengundang</span></p>
            </div>
        </section>

    </div>
    
    <!-- COVER SECTION -->
    <CoverSection 
        @open="handleOpen" 
        :groom-name="firstNickname || ''" 
        :bride-name="secondNickname || ''" 
        :date="content?.hero?.date || ''"
        :background-image="content?.cover?.backgroundImage || content?.hero?.backgroundImage || ''"
        :guest-name="(route.query.to as string)"
        class="kunikaa-cover"
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
/* ============================================
   KUNIKAA THEME - Premium Wedding Design
   Colors: Lavender, Cream, White, Dark
   ============================================ */

/* Color Variables */
.kunikaa-theme {
    --lavender: #9B8AB8;
    --cream: #FAF8F5;
    --dark: #3D3D3D;
    --white: #FFFFFF;
}

.bg-cream { background-color: var(--cream); }
.bg-lavender { background-color: var(--lavender); }
.text-lavender { color: var(--lavender); }
.text-dark { color: var(--dark); }
.border-lavender { border-color: var(--lavender); }

/* Font Classes */
.font-script {
    font-family: 'Alex Brush', cursive;
}
.font-serif {
    font-family: 'Cormorant Garamond', 'Lora', serif;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeInUp {
    animation: fadeInUp 1s ease-out forwards;
}

.animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
.animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
.animation-delay-600 { animation-delay: 0.6s; opacity: 0; }

/* Floral Corner Decorations - Large Watercolor Style */
.floral-corner {
    position: fixed;
    width: 250px;
    height: 250px;
    pointer-events: none;
    z-index: 40;
}

@media (min-width: 768px) {
    .floral-corner {
        width: 350px;
        height: 350px;
    }
}

.floral-tl {
    top: -40px;
    left: -40px;
    animation: floatTL 8s ease-in-out infinite;
}

.floral-tr {
    top: -40px;
    right: -40px;
    animation: floatTR 9s ease-in-out infinite;
}

.floral-bl {
    bottom: -40px;
    left: -40px;
    animation: floatBL 10s ease-in-out infinite;
}

.floral-br {
    bottom: -40px;
    right: -40px;
    animation: floatBR 8.5s ease-in-out infinite;
}

@keyframes floatTL {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(8px, 8px) rotate(2deg); }
}

@keyframes floatTR {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-8px, 8px) rotate(-2deg); }
}

@keyframes floatBL {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(8px, -8px) rotate(-2deg); }
}

@keyframes floatBR {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-8px, -8px) rotate(2deg); }
}

/* Scrollbar Hidden */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none; 
}

/* Reveal Animations */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease-out, transform 1s ease-out;
}
.reveal-on-scroll.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* Override Shared Components */
:deep(.kunikaa-countdown) {
    background: transparent !important;
}
:deep(.kunikaa-countdown .flex) {
    gap: 1.5rem !important;
}
:deep(.kunikaa-countdown .text-2xl),
:deep(.kunikaa-countdown .text-3xl) {
    color: var(--dark) !important;
    font-weight: 300 !important;
    font-size: 2.5rem !important;
}
:deep(.kunikaa-countdown .text-xs),
:deep(.kunikaa-countdown .text-\[10px\]) {
    color: var(--lavender) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.15em !important;
    font-size: 0.7rem !important;
}
:deep(.kunikaa-countdown .min-w-\[70px\]),
:deep(.kunikaa-countdown .min-w-\[80px\]) {
    min-width: 80px !important;
    padding: 1rem !important;
    background: var(--cream) !important;
    border: 1px solid rgba(155, 138, 184, 0.2) !important;
    border-radius: 12px !important;
}

/* Countdown Expired - Kunikaa Elegant Style */
:deep(.kunikaa-countdown .bg-stone-50) {
    background: linear-gradient(135deg, #F8F4FA 0%, #EDE4F3 100%) !important;
    border: 1px solid rgba(155, 138, 184, 0.3) !important;
    border-radius: 16px !important;
}
:deep(.kunikaa-countdown .bg-stone-200) {
    background: var(--lavender) !important;
}
:deep(.kunikaa-countdown .text-stone-500) {
    color: white !important;
}
:deep(.kunikaa-countdown .text-stone-800) {
    color: var(--lavender) !important;
    font-family: 'Alex Brush', cursive !important;
    font-size: 1.75rem !important;
}
:deep(.kunikaa-countdown p.text-xs.text-stone-500) {
    color: var(--dark) !important;
    font-style: italic !important;
}

/* Gift Section - Kunikaa Lavender Style */
:deep(.kunikaa-gift) {
    background: transparent !important;
}
:deep(.kunikaa-gift .bg-white),
:deep(.kunikaa-gift .bg-stone-900),
:deep(.kunikaa-gift [class*="bg-stone"]) {
    background: linear-gradient(135deg, #F8F4FA 0%, #EDE4F3 100%) !important;
    border: 1px solid rgba(155, 138, 184, 0.3) !important;
    border-radius: 16px !important;
    color: var(--dark) !important;
}
:deep(.kunikaa-gift .text-white) {
    color: var(--dark) !important;
}
:deep(.kunikaa-gift .text-stone-400),
:deep(.kunikaa-gift [class*="text-stone"]) {
    color: var(--lavender) !important;
}
:deep(.kunikaa-gift button) {
    background: var(--lavender) !important;
    color: white !important;
    border-radius: 8px !important;
}
:deep(.kunikaa-gift button:hover) {
    opacity: 0.9 !important;
}

/* RSVP Section - Kunikaa Style */
:deep(.kunikaa-rsvp) {
    padding: 0 !important;
}
:deep(.kunikaa-rsvp .text-center.mb-10) {
    display: none !important;
}
:deep(.kunikaa-rsvp input),
:deep(.kunikaa-rsvp textarea),
:deep(.kunikaa-rsvp select) {
    border-radius: 12px !important;
    border: 1px solid rgba(155, 138, 184, 0.3) !important;
    background: var(--cream) !important;
}
:deep(.kunikaa-rsvp input:focus),
:deep(.kunikaa-rsvp textarea:focus),
:deep(.kunikaa-rsvp select:focus) {
    border-color: var(--lavender) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(155, 138, 184, 0.1) !important;
}
:deep(.kunikaa-rsvp .grid.grid-cols-1 button) {
    border-radius: 12px !important;
    padding: 1rem !important;
}
:deep(.kunikaa-rsvp button[type="submit"]) {
    background: var(--lavender) !important;
    border-radius: 50px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.15em !important;
    font-size: 0.8rem !important;
    color: white !important;
}
:deep(.kunikaa-rsvp button[type="submit"]:hover) {
    opacity: 0.9 !important;
    transform: translateY(-2px) !important;
}

/* Cover Section */
:deep(.kunikaa-cover) {
    font-family: 'Alex Brush', cursive !important;
}

/* FloatingNav - Kunikaa Lavender Style */
:deep(.floating-nav),
.kunikaa-theme :deep(nav[class*="fixed bottom"]),
.kunikaa-theme :deep(.fixed.bottom-6) {
    background: linear-gradient(135deg, #F8F4FA 0%, #EDE4F3 100%) !important;
    border: 1px solid rgba(155, 138, 184, 0.3) !important;
    box-shadow: 0 10px 40px rgba(155, 138, 184, 0.2) !important;
}
:deep(.floating-nav button),
.kunikaa-theme :deep(nav button) {
    color: var(--lavender) !important;
}
:deep(.floating-nav button.active),
:deep(.floating-nav button:hover),
.kunikaa-theme :deep(nav button.active),
.kunikaa-theme :deep(nav button:hover) {
    background: var(--lavender) !important;
    color: white !important;
}
</style>
