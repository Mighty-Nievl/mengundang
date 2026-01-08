<script setup lang="ts">
const emit = defineEmits(['navigate'])

const navItems = [
    { label: 'Home', icon: 'fas fa-home', index: 0 },
    { label: 'Mempelai', icon: 'fas fa-user-group', index: 2 },
    { label: 'Acara', icon: 'fas fa-calendar-alt', index: 4 },
    { label: 'Galeri', icon: 'fas fa-images', index: 5 },
    { label: 'Ucapkan', icon: 'fas fa-comment-dots', index: 7 },
]

const props = defineProps<{
  current?: number
}>()



const activeIndex = ref(0)
const isManual = ref(false)

// Sync with prop change (scroll spy), but only if not manually navigating
watch(() => props.current, (newVal) => {
    if (newVal !== undefined && !isManual.value) {
        const match = [...navItems].reverse().find(item => item.index <= newVal);
        if (match) {
            activeIndex.value = match.index;
        }
    }
})

const handleNavClick = (index: number) => {
    isManual.value = true
    activeIndex.value = index
    emit('navigate', index)
    
    // Unlock after scroll animation (approx 1.2s + buffer)
    setTimeout(() => {
        isManual.value = false
    }, 1500)
}
</script>

<template>
    <div class="fixed bottom-6 pb-[env(safe-area-inset-bottom)] inset-x-0 w-full z-[100] px-6 flex justify-center pointer-events-none">
        <div class="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl flex items-center gap-1 pointer-events-auto ring-1 ring-white/5 relative">
            
            <!-- Sliding Active Indicator -->
            <div 
                class="absolute h-[calc(100%-12px)] top-1.5 bg-white/10 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                :style="{
                    left: `${(navItems.findIndex(n => n.index === activeIndex) * 52) + 6}px`,
                    width: '48px'
                }"
            ></div>

            <button 
                v-for="item in navItems" 
                :key="item.index"
                @click="handleNavClick(item.index)"
                class="relative w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 group z-10"
                :class="activeIndex === item.index ? 'text-gold-400 scale-110' : 'text-white/60 hover:text-white'"
            >
                <i :class="[item.icon, activeIndex === item.index ? '-translate-y-0.5' : '']" class="text-sm transition-transform duration-300"></i>
                
                <!-- Tooltip (Desktop Only) -->
                <span class="hidden md:block text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/80 text-white px-2 py-1 rounded transition-all duration-300 pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 transform translate-y-2 group-hover:translate-y-0">
                    {{ item.label }}
                    <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10"></div>
                </span>
            </button>
        </div>
    </div>
</template>
