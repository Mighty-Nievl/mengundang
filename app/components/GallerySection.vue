<script setup lang="ts">
const props = defineProps<{
  images?: string[]
}>()

const defaultImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800', // Tall
  'https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1522673607200-1645062cd958?auto=format&fit=crop&q=80&w=800', // Tall
  'https://images.unsplash.com/photo-1529636721158-bdf3c2c825e1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507915977619-6ccfe8003ae3?auto=format&fit=crop&q=80&w=800',
  // Extras for testing 12 items
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800', // Duplicate Tall
  'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
]

const allImages = computed(() => {
    return (props.images && props.images.length > 0) ? props.images : defaultImages
})

// --- IMAGE LOADING LOGIC ---
const loadedImages = ref<Set<number>>(new Set())

const onImageLoad = (index: number) => {
    loadedImages.value.add(index)
}

// Reset loaded state is not strictly necessary as hydration usually handles it, 
// but unique IDs per image would be better in a real app.


// --- PAGINATION LOGIC ---
const PAGE_SIZE = 12
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(allImages.value.length / PAGE_SIZE))

const displayImages = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return allImages.value.slice(start, end)
})

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
        scrollToGalleryTop()
    }
}

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
        scrollToGalleryTop()
    }
}

const goToPage = (page: number) => {
    currentPage.value = page
    scrollToGalleryTop()
}

const scrollToGalleryTop = () => {
    const el = document.getElementById('gallery')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// --- EDITORIAL GRID PATTERN (Storytelling Layout) ---
// A handcrafted rhythm for 12 items that flows naturally
const getEditorialClass = (index: number) => {
    // Mobile is simpler: alternates full-width Hero with pairs of small squares
    // Desktop is complex: Mix of 2x2, 2x1, 1x2, 1x1
    
    // Pattern Index (0-11)
    const i = index % 12
    
    switch (i) {
        // ROW 1
        case 0: return 'col-span-2 row-span-1 md:col-span-2 md:row-span-2' // Big Hero (Top Left) - Mobile: Landscape, Desktop: Big Square
        case 1: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        case 2: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        case 3: return 'col-span-1 row-span-2 md:col-span-1 md:row-span-2' // Tall Portrait (Desktop Right) -> Mobile: Tall Portrait too? Let's check context.
        // Actually, for Mobile flow, index 3 being tall is fine if it pairs well.
        
        // ROW 2 (Desktop Context)
        case 4: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        
        // ROW 3
        case 5: return 'col-span-2 row-span-1 md:col-span-2 md:row-span-1' // Wide Landscape
        case 6: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        case 7: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        
        // ROW 4
        case 8: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' // Small
        case 9: return 'col-span-1 row-span-1 md:col-span-1 md:row-span-2' // Tall (Desktop) / Small (Mobile)
        case 10: return 'col-span-2 row-span-2 md:col-span-2 md:row-span-2' // Second Big Hero
        
        // ROW 5
        case 11: return 'col-span-2 row-span-1 md:col-span-1 md:row-span-1' // Wide (Mobile) / Small (Desktop)
        
        default: return 'col-span-1'
    }
}


// --- LIGHTBOX LOGIC ---
const selectedImage = ref<string | null>(null)
const currentIndex = ref<number>(-1)
const isLightboxOpen = ref(false)

const openLightbox = (img: string, localIndex: number) => {
    selectedImage.value = img
    currentIndex.value = ((currentPage.value - 1) * PAGE_SIZE) + localIndex
    isLightboxOpen.value = true
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
}

const closeLightbox = () => {
    isLightboxOpen.value = false
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
    setTimeout(() => {
        selectedImage.value = null
        currentIndex.value = -1
    }, 300)
}

const nextImage = (e?: Event) => {
    e?.stopPropagation()
    if (currentIndex.value < allImages.value.length - 1) {
        currentIndex.value++
        selectedImage.value = allImages.value[currentIndex.value]!
    } else {
        currentIndex.value = 0
        selectedImage.value = allImages.value[0]!
    }
}

const prevImage = (e?: Event) => {
    e?.stopPropagation()
    if (currentIndex.value > 0) {
        currentIndex.value--
        selectedImage.value = allImages.value[currentIndex.value]!
    } else {
        currentIndex.value = allImages.value.length - 1
        selectedImage.value = allImages.value[allImages.value.length - 1]!
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
}
</script>

<template>
  <div class="gallery-section w-full space-y-12 py-32 pb-48 relative overflow-hidden bg-stone-50" id="gallery">
    <!-- Modern Romantic Background -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] max-w-full bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-60 pointer-events-none animate-pulse-slow"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] max-w-full bg-gold-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none"></div>
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-20 pointer-events-none"></div>

    <div class="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <!-- HEADER: Modern Romantic -->
        <div class="text-center mb-16 space-y-4">
             <div class="flex items-center justify-center gap-4 opacity-60 mb-2">
                <div class="h-[1px] w-12 bg-gold-300"></div>
                <span class="text-gold-500 text-xs tracking-[0.2em] font-sans uppercase">Our Memories</span>
                <div class="h-[1px] w-12 bg-gold-300"></div>
            </div>
            <h2 class="font-serif text-4xl md:text-6xl text-stone-800 tracking-tight">Captured Moments</h2>
            <p class="text-stone-500 font-serif italic text-base md:text-lg opacity-80">"Forever frozen in time"</p>
        </div>

        <!-- EDITORIAL RHYTHM GRID -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[240px] grid-flow-dense">
            <div 
                v-for="(img, idx) in displayImages" 
                :key="`${currentPage}-${idx}`" 
                class="relative group cursor-pointer reveal-on-scroll overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                :class="getEditorialClass(idx)"
                @click="openLightbox(img, idx)"
            >
                 <!-- Image Container with Skeleton -->
                 <div class="relative w-full h-full bg-stone-200">
                     <!-- Skeleton Loader -->
                     <div 
                        v-if="!loadedImages.has(((currentPage - 1) * PAGE_SIZE) + idx)" 
                        class="absolute inset-0 bg-stone-200 animate-pulse z-10"
                     ></div>

                     <img 
                        :src="img" 
                        class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                        :class="{ 'opacity-0': !loadedImages.has(((currentPage - 1) * PAGE_SIZE) + idx), 'opacity-100': loadedImages.has(((currentPage - 1) * PAGE_SIZE) + idx) }"
                        loading="lazy" 
                        referrerpolicy="no-referrer"
                        @load="onImageLoad(((currentPage - 1) * PAGE_SIZE) + idx)"
                     />
                 </div>
                 
                 <!-- Romantic Overlay: Warm Gold Glow -->
                 <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 
                 <!-- Simple Icon -->
                 <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-stone-800">
                        <i class="fas fa-expand-alt text-xs"></i>
                    </div>
                 </div>
            </div>
        </div>

        <!-- PAGINATION CONTROLS: Soft & Rounded -->
        <div v-if="totalPages > 1" class="flex flex-col items-center mt-20 gap-8">
            <div class="flex items-center gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-full border border-stone-100 shadow-sm">
                <!-- Prev -->
                <button 
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:bg-white hover:text-stone-800 hover:shadow-md disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all duration-300"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center px-2 gap-1">
                    <button 
                        v-for="p in totalPages" 
                        :key="p"
                        @click="goToPage(p)"
                        class="w-8 h-8 flex items-center justify-center rounded-full text-xs font-serif transition-all duration-300"
                        :class="currentPage === p ? 'bg-stone-800 text-white shadow-md scale-110' : 'text-stone-500 hover:bg-stone-100'"
                    >
                        {{ p }}
                    </button>
                </div>

                <!-- Next -->
                <button 
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:bg-white hover:text-stone-800 hover:shadow-md disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all duration-300"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- LIGHTBOX OVERLAY -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div 
                v-if="isLightboxOpen" 
                class="fixed inset-0 z-[9999] bg-stone-950/98 backdrop-blur-xl flex flex-col items-center justify-center"
                @click.self="closeLightbox"
            >
                <!-- Toolbar -->
                <div class="absolute top-0 w-full flex justify-between items-center p-6 z-50">
                    <span class="text-white/60 font-serif italic text-sm tracking-widest">{{ currentIndex + 1 }} / {{ allImages.length }}</span>
                    <button 
                        @click="closeLightbox" 
                        class="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <!-- Navigation Buttons -->
                <button 
                    @click="prevImage"
                    class="absolute left-4 md:left-8 text-white/30 hover:text-white hover:bg-white/10 p-4 rounded-full transition-all z-50 focus:outline-none"
                >
                   <i class="fas fa-chevron-left text-3xl"></i>
                </button>

                <button 
                    @click="nextImage"
                    class="absolute right-4 md:right-8 text-white/30 hover:text-white hover:bg-white/10 p-4 rounded-full transition-all z-50 focus:outline-none"
                >
                   <i class="fas fa-chevron-right text-3xl"></i>
                </button>

                <!-- Image Container -->
                <div class="relative w-full h-full flex items-center justify-center p-4 md:p-12" @click.self="closeLightbox">
                     <Transition
                        enter-active-class="transition duration-500 ease-out"
                        enter-from-class="opacity-0 scale-95 blur-sm"
                        enter-to-class="opacity-100 scale-100 blur-0"
                        mode="out-in"
                     >
                        <img 
                            :key="selectedImage"
                            :src="selectedImage || ''" 
                            class="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                            referrerpolicy="no-referrer"
                        />
                     </Transition>
                </div>
                
                <!-- Hint -->
                <div class="absolute bottom-6 text-white/30 text-[10px] uppercase tracking-widest font-sans hidden md:block">
                    Use Arrow Keys to Navigate • Esc to Close
                </div>
            </div>
        </Transition>
    </div>
  </div>
</template>
