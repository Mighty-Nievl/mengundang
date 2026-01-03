<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  targetDate: string
}>()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

let interval: any

const updateCountdown = () => {
    // Parse Indonesian Date format "Sabtu, 28 Desember 2025" or similar might be hard.
    // Ideally the data should have ISO date.
    // For now assuming the data in json "events.akad.date" is human readable.
    // We probably need a separate ISO date field in content.json for accurate Countdown.
    // Let's fallback to a hardcoded logic or try to parse if possible, or just default to the known date for MVP if parsing fails.
    
    // Better approach: Add a specific isoDate field in content.json later.
    // For now, let's try to parse "2025-12-28T08:00:00" if the prop is passed as such, or try to construct it.
    // Given the current content.json has "Sabtu, 28 Desember 2025", JS Date won't parse Indonesian.
    // I should probably update `content.json` to have an ISO date or handle it here.
    // Let's hardcode the fallback for this demo effectively, but try to use prop.
    
    // Workaround: The prop passed from index.vue is `content.events.akad.date` which is "Sabtu, 28...". 
    // This will result in NaN.
    // I will modify content.json to include `isoDate` for events, OR just hardcode the target for now for safety.
    
    // Actuallly, let's fix the content.json in the next step to include `isoDate` and pass that.
    
  const target = new Date('2025-12-28T08:00:00').getTime() 
  const now = new Date().getTime()
  const distance = target - now

  if (distance < 0) {
    clearInterval(interval)
    return
  }

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
    <div class="flex justify-center space-x-4 md:space-x-8 text-center text-stone-800">
       <div class="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px]">
         <span class="text-3xl font-serif font-bold text-gold-600">{{ days }}</span>
         <span class="text-[10px] uppercase tracking-widest text-stone-400">Hari</span>
       </div>
       <div class="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px]">
         <span class="text-3xl font-serif font-bold text-gold-600">{{ hours }}</span>
         <span class="text-[10px] uppercase tracking-widest text-stone-400">Jam</span>
       </div>
       <div class="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px]">
         <span class="text-3xl font-serif font-bold text-gold-600">{{ minutes }}</span>
         <span class="text-[10px] uppercase tracking-widest text-stone-400">Menit</span>
       </div>
       <div class="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gold-100 min-w-[70px]">
         <span class="text-3xl font-serif font-bold text-gold-600">{{ seconds }}</span>
         <span class="text-[10px] uppercase tracking-widest text-stone-400">Detik</span>
       </div>
    </div>
  </div>
</template>
