<script setup lang="ts">
import { animate } from 'motion'

const props = defineProps<{
  groomName: string
  brideName: string
  date: string
  backgroundImage?: string
  guestName?: string
}>()

const emit = defineEmits(['open'])
const coverSection = ref<HTMLElement | null>(null)
const heroText = ref<HTMLElement | null>(null)

const openInvitation = () => {
  if (coverSection.value) {
    animate(coverSection.value as Element, { transform: 'translateY(-100%)' } as any, { duration: 1.5, easing: "ease-in-out" } as any).finished.then(() => {
      emit('open')
    })
  }
}

onMounted(() => {
  if (heroText.value) {
    animate(heroText.value as Element, { transform: ['translateY(50px)', 'translateY(0px)'], opacity: [0, 1] } as any, { duration: 1.5, delay: 0.5, easing: "ease-out" } as any)
  }
})
</script>

<template>
  <div 
    ref="coverSection"
    class="cover-section fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 transition-all duration-1000 bg-cover bg-center overflow-hidden"
  >
    <!-- Background Image Fix for Referrer Policy -->
    <div v-if="backgroundImage" class="absolute inset-0 z-0">
        <img :src="backgroundImage" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
    </div>
    <!-- Optional Overlay -->
    <div v-if="backgroundImage" class="absolute inset-0 bg-black/40 z-0"></div>
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-200/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

    <div class="z-10 text-center p-8 md:p-12 max-w-2xl border border-white/40 bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl mx-4 relative" :class="{'shadow-none bg-black/30 border-white/20': backgroundImage}">
      <div ref="heroText" class="hero-text space-y-6"> 
        <div>
          <h2 class="text-[10px] md:text-xs uppercase tracking-[0.4em] font-sans mb-4" :class="backgroundImage ? 'text-stone-300' : 'text-stone-500'">The Wedding Of</h2>
          <h1 class="text-4xl md:text-6xl font-serif mb-2 leading-tight" :class="backgroundImage ? 'text-white' : 'text-stone-800'">
            {{ groomName }} & <span class="italic" :class="backgroundImage ? 'text-gold-200' : 'text-gold-600'">{{ brideName }}</span>
          </h1>
          <p class="font-sans text-xs md:text-sm tracking-widest uppercase opacity-70" :class="backgroundImage ? 'text-stone-200' : 'text-stone-600'">{{ date }}</p>
        </div>

        <!-- Guest Name Display -->
        <div v-if="guestName" class="py-6 border-y border-white/20">
          <p class="text-[10px] uppercase tracking-widest mb-2 opacity-60" :class="backgroundImage ? 'text-white' : 'text-stone-500'">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <h3 class="text-xl md:text-2xl font-serif font-bold italic" :class="backgroundImage ? 'text-gold-100' : 'text-stone-900'">{{ guestName }}</h3>
        </div>

        <div class="pt-4">
          <button @click="openInvitation" class="group relative px-10 py-4 bg-stone-900 text-white rounded-full overflow-hidden transition-all hover:shadow-xl hover:shadow-gold-500/20 cursor-pointer active:scale-95">
            <span class="relative z-10 font-sans tracking-[0.2em] uppercase text-xs font-bold group-hover:text-gold-200 transition-colors">Buka Undangan</span>
            <div class="absolute inset-0 bg-gold-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
          </button>
        </div>
      </div>
    </div>
    
    <div class="absolute bottom-8 text-center z-10">
      <p class="text-[10px] font-sans tracking-widest uppercase opacity-50" :class="backgroundImage ? 'text-stone-300' : 'text-stone-400'">Powered by Undangan.</p>
    </div>
  </div>
</template>
