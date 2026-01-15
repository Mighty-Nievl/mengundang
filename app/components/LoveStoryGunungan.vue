<template>
  <div class="love-story-section w-full min-h-screen relative bg-[#111] overflow-hidden flex flex-col justify-center py-32 px-4" id="story">
    
    <!-- Background Texture with Parallax -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0 bg-[url('/images/themes/parang-batik.jpg')] bg-fixed bg-cover bg-center grayscale mix-blend-overlay"
             :style="{ transform: `translateY(${parallaxOffset}px)` }"></div>
        <div class="absolute inset-0 bg-radial-vignette"></div>
    </div>

    <!-- ... (Floating Ornaments remain same) ... -->

    <div class="max-w-7xl mx-auto w-full relative z-10">
        <!-- ... (Title remains same) ... -->
        <div class="text-center mb-32 reveal-on-scroll">
             <!-- ... content ... -->
             <h2 class="font-display text-5xl md:text-7xl text-gold mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] tracking-wide">Kisah Tresna</h2>
            <div class="text-gold/60 font-serif text-2xl mb-8 tracking-widest">ꦏꦶꦱꦃꦠꦿꦺꦱ꧀ꦤ</div>
            
            <div class="flex items-center justify-center gap-6 opacity-80">
                    <div class="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                    <!-- Gunungan Icon Tiny -->
                     <svg class="w-6 h-auto text-gold fill-current" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0L24 36H0L12 0Z" fill="currentColor"/> 
                    </svg>
                    <div class="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
            </div>
            <p class="text-white/50 mt-8 font-serif italic text-lg max-w-2xl mx-auto leading-relaxed tracking-wider">
                "Witing tresno jalaran soko kulino."
            </p>
        </div>

        <!-- Timeline Container -->
        <div class="relative max-w-5xl mx-auto">
            
            <!-- Dynamic Scroll Line Container -->
             <!-- ... (Scroll Line remains same) ... -->
            <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 transform md:-translate-x-1/2 overflow-hidden h-full">
                <div class="scroll-line-fill absolute top-0 left-0 w-full bg-gradient-to-b from-gold via-[#ffd700] to-gold shadow-[0_0_15px_rgba(212,175,55,0.8)] transition-all duration-75 ease-linear h-0"></div>
            </div>

            <!-- Story Items -->
            <div v-for="(item, index) in stories" :key="index" class="story-item relative mb-32 last:mb-0 group reveal-on-scroll" :data-index="index">
                <div class="md:flex items-center justify-between w-full" :class="{'md:flex-row-reverse': index % 2 !== 0}">
                    
                    <!-- Content Side -->
                    <div class="md:w-[42%] ml-20 md:ml-0 mb-12 md:mb-0" :class="{'md:text-right': index % 2 === 0, 'md:text-left': index % 2 !== 0}">
                        <div class="relative group cursor-pointer perspective-card" 
                             @mousemove="handleMouseMove($event, index)"
                             @mouseleave="handleMouseLeave(index)">
                             

                            <div ref="cardRefs" class="card-glass bg-[#1a1a1a]/80 backdrop-blur-md p-8 md:p-10 rounded-none shadow-2xl transition-transform duration-100 ease-out relative overflow-hidden transform-gpu">
                                
                                <!-- Glare Effect for 3D Tilt -->
                                <div class="glare-effect"></div>

                                <!-- Real Truntum Pattern (Organic Floral) -->
                                <div class="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none mix-blend-screen">
                                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="truntum" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                                <!-- Center Flower -->
                                                <circle cx="30" cy="30" r="4" fill="#D4AF37"/>
                                                <!-- Petals (Curved) -->
                                                <path d="M30 20 Q35 15 40 20 Q35 25 30 24 M30 40 Q25 45 20 40 Q25 35 30 36 M40 30 Q45 35 40 40 Q35 35 36 30 M20 30 Q15 25 20 20 Q25 25 24 30" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
                                                <!-- Outer Dots -->
                                                <circle cx="10" cy="10" r="1.5" fill="#D4AF37" opacity="0.6"/>
                                                <circle cx="50" cy="10" r="1.5" fill="#D4AF37" opacity="0.6"/>
                                                <circle cx="10" cy="50" r="1.5" fill="#D4AF37" opacity="0.6"/>
                                                <circle cx="50" cy="50" r="1.5" fill="#D4AF37" opacity="0.6"/>
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#truntum)"/>
                                    </svg>
                                </div>

                                <!-- Ukiran Corner Decorations -->
                                <svg class="absolute top-2 left-2 w-8 h-8 text-gold/60 group-hover:text-gold transition-colors duration-500" viewBox="0 0 50 50" fill="none"><path d="M0 0V50H2V2H50V0H0Z" fill="currentColor"/><path d="M5 5V25H7V7H25V5H5Z" fill="currentColor"/></svg>
                                <svg class="absolute top-2 right-2 w-8 h-8 text-gold/60 group-hover:text-gold transition-colors duration-500 transform rotate-90" viewBox="0 0 50 50" fill="none"><path d="M0 0V50H2V2H50V0H0Z" fill="currentColor"/><path d="M5 5V25H7V7H25V5H5Z" fill="currentColor"/></svg>
                                <svg class="absolute bottom-2 left-2 w-8 h-8 text-gold/60 group-hover:text-gold transition-colors duration-500 transform -rotate-90" viewBox="0 0 50 50" fill="none"><path d="M0 0V50H2V2H50V0H0Z" fill="currentColor"/><path d="M5 5V25H7V7H25V5H5Z" fill="currentColor"/></svg>
                                <svg class="absolute bottom-2 right-2 w-8 h-8 text-gold/60 group-hover:text-gold transition-colors duration-500 transform rotate-180" viewBox="0 0 50 50" fill="none"><path d="M0 0V50H2V2H50V0H0Z" fill="currentColor"/><path d="M5 5V25H7V7H25V5H5Z" fill="currentColor"/></svg>

                                <!-- Mobile Year Typography (Refined V6: Replaces Badge) -->
                                <div class="md:hidden text-gold/80 font-serif italic text-lg tracking-widest mb-1 mt-4">
                                    {{ item.year }}
                                </div>

                                <h3 class="font-display text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-gold via-[#fff5d0] to-gold mb-4 group-hover:tracking-wide transition-all duration-500 md:mt-0">{{ item.title }}</h3>
                                <p class="text-white/70 text-base leading-relaxed font-serif tracking-wide">{{ item.content }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Center Node (Wayang Gunungan Icon) -->
                    <!-- ... (Center Node remains same) ... -->
                    <div class="absolute left-6 md:left-1/2 -translate-x-[50%] z-20 flex items-center justify-center transition-all duration-500">
                        <div class="node-wrapper relative w-12 h-16 md:w-16 md:h-20 flex items-center justify-center group-hover:scale-125 transition-transform duration-500">
                             <div class="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                             <svg class="w-full h-full text-[#111] fill-[#111] stroke-gold stroke-[1.5] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 5C50 5 10 40 10 90C10 120 30 135 50 135C70 135 90 120 90 90C90 40 50 5 50 5Z" class="group-hover:fill-gold group-hover:text-gold transition-all duration-500"/>
                                <circle cx="50" cy="90" r="10" fill="gold" class="group-hover:fill-[#111] transition-colors duration-500"/>
                             </svg>
                        </div>
                    </div>

                    <!-- Date/Image Side (Desktop) -->
                    <div class="md:w-[42%] ml-20 md:ml-0 hidden md:flex flex-col justify-center" :class="{'items-start': index % 2 === 0, 'items-end': index % 2 !== 0}">
                        
                        <!-- SMART MEDIA: Show Image if available, otherwise show Cinematic Text Year -->
                        <div v-if="item.image" class="relative group/image p-3 border border-gold/30 rounded-sm shadow-2xl bg-[#050505] transform transition-transform duration-700 hover:scale-105">
                             <!-- Inner Border Container -->
                             <div class="relative overflow-hidden border border-gold/10">
                                 
                                 <!-- Cinematic Gradient Overlay (Top) for Text Contrast -->
                                 <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none"></div>
                                 
                                 <!-- Golden Shine Overlay -->
                                 <div class="absolute inset-0 bg-gold/10 mix-blend-overlay z-10 pointer-events-none"></div>
                                 
                                 <img :src="item.image" class="w-full max-w-sm h-auto object-cover grayscale-[0.3] group-hover/image:grayscale-0 transition-all duration-700" alt="Story Image" loading="lazy" />
                                 
                                 <!-- Corner accents for image -->
                                 <div class="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/60 z-20"></div>
                                 <div class="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold/60 z-20"></div>
                                 
                                 <!-- Floating Year Badge for Image (Typography Style) -->
                                 <div class="absolute top-4 left-4 font-display text-4xl text-white/90 drop-shadow-md z-30 tracking-wide">{{ item.year }}</div>
                             </div>
                        </div>

                        <!-- Fallback: Cinematic Year Display -->
                        <div v-else class="font-display font-bold text-[8rem] leading-[0.7] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/5 to-transparent transition-all duration-700 group-hover:text-white/10 group-hover:scale-110 transform origin-center select-none" 
                             style="-webkit-text-stroke: 1px rgba(212, 175, 55, 0.1);">
                            {{ item.year }}
                        </div>
                    </div>

                </div>
            </div>

            <!-- End Ornament (Infinity with Batik Wings) -->
            <div class="text-center mt-32 reveal-on-scroll relative z-20">
                <div class="inline-flex items-center justify-center gap-4">
                     <div class="h-[1px] w-20 bg-gradient-to-r from-transparent to-gold opacity-50"></div>
                     <div class="relative w-20 h-20 flex items-center justify-center">
                        <div class="absolute inset-0 border border-gold/20 rotate-45 animate-[spin_10s_linear_infinite]"></div>
                        <div class="absolute inset-2 border border-gold/20 rotate-45 animate-[spin_15s_linear_infinite_reverse]"></div>
                        <i class="fas fa-infinity text-3xl text-gold drop-shadow-[0_0_10px_gold]"></i>
                     </div>
                     <div class="h-[1px] w-20 bg-gradient-to-l from-transparent to-gold opacity-50"></div>
                </div>
                <div class="mt-6 text-sm text-gold/60 tracking-[0.5em] uppercase font-serif">Tresno Selawase</div>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  stories?: Array<{
    year: string
    title: string
    content: string
    image?: string
  }>
}>()

// === SCROLL DRIVEN ANIMATION LOGIC ===
const handleScrollAnimation = () => {
    const section = document.getElementById('story')
    if (!section) return

    const lineFill = section.querySelector('.scroll-line-fill') as HTMLElement
    if (!lineFill) return

    const rect = section.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const sectionHeight = rect.height
    
    // Calculate how much of the section has been scrolled through
    // Start filling when section top hits middle of screen, end when section bottom hits middle
    const startOffset = windowHeight / 2
    const relativeY = -rect.top + startOffset
    
    let progress = relativeY / sectionHeight
    
    // Clamp between 0 and 1
    progress = Math.max(0, Math.min(progress, 1))
    
    // Update SVG Line Height
    lineFill.style.height = `${progress * 100}%`
    
    // Trigger "Active" state for nodes passed by the line
    const items = section.querySelectorAll('.story-item')
    items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        // If item center is above the viewport center, it's active
        if (itemRect.top < (windowHeight / 1.5)) {
            item.classList.add('is-passed')
        } else {
            item.classList.remove('is-passed')
        }
    })
}


// === TILT & PARALLAX LOGIC ===
const cardRefs = ref<HTMLElement[]>([])

const handleMouseMove = (e: MouseEvent, index: number) => {
    const card = cardRefs.value[index]
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate tilt rotation (max 10deg)
    const xPct = x / rect.width
    const yPct = y / rect.height
    
    const xTilt = (0.5 - yPct) * 15 // Tilt X (up/down)
    const yTilt = (xPct - 0.5) * 15 // Tilt Y (left/right)

    card.style.transform = `perspective(1000px) rotateX(${xTilt}deg) rotateY(${yTilt}deg) scale3d(1.02, 1.02, 1.02)`
    
    // Move glare
    const glare = card.querySelector('.glare-effect') as HTMLElement
    if (glare) {
        glare.style.opacity = '1'
        glare.style.transform = `translate(${x}px, ${y}px)`
    }
}

const handleMouseLeave = (index: number) => {
    const card = cardRefs.value[index]
    if (!card) return
    
    // Reset position
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    
    const glare = card.querySelector('.glare-effect') as HTMLElement
    if (glare) {
        glare.style.opacity = '0'
    }
}

const parallaxOffset = ref(0)
const handleParallax = () => {
    const scrolled = window.scrollY
    parallaxOffset.value = scrolled * 0.1 // Slow parallax
    
    // Existing scroll line logic
    handleScrollAnimation()
}

onMounted(() => {
    window.addEventListener('scroll', handleParallax, { passive: true })
    handleScrollAnimation()
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleParallax)
})
</script>

<style scoped>
.card-glass {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    will-change: transform;
}

/* 3D Glare */
.glare-effect {
    position: absolute;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
    mix-blend-mode: overlay;
    transform: translate(-50%, -50%); /* Center on cursor handled by JS */
    z-index: 50;
    margin-top: -100px; /* Offset for center */
    margin-left: -100px;
}



.perspective-card {
    perspective: 1000px;
}

.story-item.is-passed .node-wrapper svg path {
    fill: #D4AF37; /* Gold fill */
    color: #D4AF37;
}

.story-item.is-passed .node-wrapper svg circle {
    fill: #111;
}

/* Float Animation */
@keyframes float-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
.animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
}
.animate-float-delayed {
    animation: float-slow 10s ease-in-out infinite;
    animation-delay: 2s;
}
</style>
