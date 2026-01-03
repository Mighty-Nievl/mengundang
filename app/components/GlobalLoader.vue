<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isMainLoading = ref(true)
const nuxtApp = useNuxtApp()

onMounted(() => {
    // Initial splash for branding (min 1.5s for better feel)
    setTimeout(() => {
        isMainLoading.value = false
    }, 1500)
    
    // Page transition integration
    nuxtApp.hook('page:start', () => {
        isMainLoading.value = true
    })
    nuxtApp.hook('page:finish', () => {
        setTimeout(() => {
            isMainLoading.value = false
        }, 500)
    })
})
</script>

<template>
    <Transition name="premium-fade">
        <div v-if="isMainLoading" class="fixed inset-0 z-[99999] bg-[#FDFCFB] flex flex-col items-center justify-center overflow-hidden">
            <!-- Subtle Light Background Decorative Glow -->
            <div class="absolute w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[100px] animate-pulse-slow"></div>
            
            <div class="relative flex flex-col items-center">
                <!-- Golden Ambient Glow -->
                <div class="absolute inset-0 -m-20 bg-[#D4AF37]/5 rounded-full blur-[80px] animate-pulse"></div>
                
                <!-- Center Logo -->
                <div class="relative w-36 h-36 flex items-center justify-center">
                    <img src="/logo_loader.png?v=3" class="w-24 h-24 object-contain relative z-10 animate-float" alt="Loading" />
                    <!-- Sub-logo Glow -->
                    <div class="absolute w-12 h-12 bg-[#D4AF37]/30 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <!-- Text Branding -->
                <div class="mt-10 text-center relative z-20">
                    <h2 class="text-stone-900 font-serif text-[10px] md:text-sm tracking-[0.6em] uppercase font-bold opacity-0 animate-reveal whitespace-nowrap">
                        Undangan Digital Premium
                    </h2>
                    
                    <!-- Progress Line -->
                    <div class="mt-4 w-32 h-[1px] bg-stone-100 mx-auto relative overflow-hidden rounded-full">
                        <div class="absolute inset-0 h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full animate-elegant-progress"></div>
                    </div>
                </div>
            </div>

            <!-- Footer Small -->
            <div class="absolute bottom-12 text-stone-400 text-[8px] tracking-[0.3em] uppercase font-bold opacity-60">
                Crafted for your special moment
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Page Exit Transition */
.premium-fade-leave-active {
    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.premium-fade-leave-to {
    opacity: 0;
    filter: blur(8px);
    transform: translateY(-20px);
}

/* Animations */
@keyframes float {
    0%, 100% { transform: translateY(0) scale(1.0); }
    50% { transform: translateY(-10px) scale(1.05); }
}
.animate-float {
    animation: float 4s ease-in-out infinite;
}

@keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-spin-slow {
    animation: spin-slow 12s linear infinite;
}

@keyframes reveal {
    0% { transform: translateY(15px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.animate-reveal {
    animation: reveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    animation-delay: 0.3s;
}

@keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
}
.animate-pulse-slow {
    animation: pulse-slow 6s ease-in-out infinite;
}

@keyframes elegant-progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
.animate-elegant-progress {
    animation: elegant-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
