<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  targetDate: string
}>()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isExpired = ref(false)

let interval: any

const updateCountdown = () => {
    // Try to parse the targetDate. If valid ISO, use it.
    let targetTime = new Date(props.targetDate).getTime()
    
    // Fallback if invalid date (e.g. invalid string)
    if (isNaN(targetTime)) {
        // Try parsing assuming it might be a valid string or fail gracefully
        targetTime = new Date().getTime() // Default to now (stops countdown)
    }

    const now = new Date().getTime()
    const distance = targetTime - now

    if (distance < 0) {
        isExpired.value = true
        clearInterval(interval)
        return
    }

    isExpired.value = false
    days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000)
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="countdown-section py-8">
    
    <transition name="fade" mode="out-in">
        <div v-if="isExpired" class="text-center space-y-2 bg-stone-50 p-6 rounded-xl border border-stone-200 shadow-sm max-w-sm mx-auto">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-stone-200 rounded-full text-stone-500 mb-2">
                <i class="fas fa-check"></i>
            </div>
            <h3 class="font-serif text-xl text-stone-800 font-bold">Acara Telah Selesai</h3>
            <p class="text-xs text-stone-500 font-sans tracking-wide">Terima kasih atas doa dan restu Anda.</p>
        </div>

        <div v-else class="flex justify-center space-x-3 md:space-x-8 text-center text-stone-800">
           <div class="flex flex-col p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px] md:min-w-[80px]">
             <span class="text-2xl md:text-3xl font-serif font-bold text-gold-600">{{ days }}</span>
             <span class="text-[10px] uppercase tracking-widest text-stone-400">Hari</span>
           </div>
           <div class="flex flex-col p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px] md:min-w-[80px]">
             <span class="text-2xl md:text-3xl font-serif font-bold text-gold-600">{{ hours }}</span>
             <span class="text-[10px] uppercase tracking-widest text-stone-400">Jam</span>
           </div>
           <div class="flex flex-col p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px] md:min-w-[80px]">
             <span class="text-2xl md:text-3xl font-serif font-bold text-gold-600">{{ minutes }}</span>
             <span class="text-[10px] uppercase tracking-widest text-stone-400">Menit</span>
           </div>
           <div class="flex flex-col p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px] md:min-w-[80px]">
             <span class="text-2xl md:text-3xl font-serif font-bold text-gold-600">{{ seconds }}</span>
             <span class="text-[10px] uppercase tracking-widest text-stone-400">Detik</span>
           </div>
        </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
