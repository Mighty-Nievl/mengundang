<script setup lang="ts">
const emit = defineEmits(['navigate'])

const navItems = [
    { label: 'Home', icon: 'fas fa-home', sectionId: 'header' },
    { label: 'Mempelai', icon: 'fas fa-user-group', sectionId: 'mempelai' },
    { label: 'Acara', icon: 'fas fa-calendar-alt', sectionId: 'events' },
    { label: 'Galeri', icon: 'fas fa-images', sectionId: 'gallery' },
    { label: 'Ucapkan', icon: 'fas fa-comment-dots', sectionId: 'rsvp' },
]

const props = defineProps<{
  currentSectionId?: string
}>()

const activeSectionId = ref('header')
const isManual = ref(false)

// Sync with prop change (scroll spy), but only if not manually navigating
watch(() => props.currentSectionId, (newVal) => {
    if (newVal !== undefined && !isManual.value) {
        // Find if current section matches any nav item, or find the closest preceding one
        const match = [...navItems].reverse().find(item => {
            // Check if current section is this nav item or comes after it
            return item.sectionId === newVal
        });
        if (match) {
            activeSectionId.value = match.sectionId;
        }
    }
})

const handleNavClick = (sectionId: string) => {
    isManual.value = true
    activeSectionId.value = sectionId
    emit('navigate', sectionId)
    
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
                    left: `${(navItems.findIndex(n => n.sectionId === activeSectionId) * 52) + 6}px`,
                    width: '48px'
                }"
            ></div>

            <button 
                v-for="item in navItems" 
                :key="item.sectionId"
                @click="handleNavClick(item.sectionId)"
                class="relative w-12 h-12 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 group z-10"
                :class="activeSectionId === item.sectionId ? 'text-gold-400 scale-110' : 'text-white/60 hover:text-white'"
            >
                <i :class="[item.icon, activeSectionId === item.sectionId ? '-translate-y-0.5' : '']" class="text-sm transition-transform duration-300"></i>
                
                <!-- Tooltip (Desktop Only) -->
                <span class="hidden md:block text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 absolute -top-10 bg-black/80 text-white px-2 py-1 rounded transition-all duration-300 pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 transform translate-y-2 group-hover:translate-y-0">
                    {{ item.label }}
                    <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10"></div>
                </span>
            </button>
        </div>
    </div>
</template>
