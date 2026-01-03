<script setup lang="ts">
const props = defineProps<{
  events: any
}>()
</script>

<template>
  <div class="event-details-section space-y-12 pt-16 pb-20">
    <div class="text-center">
      <h2 class="font-serif text-3xl text-stone-800 mb-6">Waktu &amp; Tempat</h2>
      <p class="text-stone-600 mb-8 max-w-sm mx-auto leading-relaxed">
        Dengan memohon rahmat dan ridho Allah SWT via, kami bermaksud menyelenggarakan pernikahan kami pada:
      </p>
    </div>

    <!-- Akad Nikah -->
    <div class="relative bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 overflow-hidden border border-stone-100">
      <div class="absolute top-0 right-0 p-4 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 class="font-serif text-2xl text-gold-600 mb-2">Akad Nikah</h3>
      <div class="flex items-center justify-center space-x-2 text-stone-500 mb-6">
        <span class="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold tracking-widest">{{ events.akad.time }}</span>
      </div>
      
      <p class="text-stone-700 font-medium mb-1">{{ events.akad.date }}</p>
      <p class="text-stone-500 text-sm mb-6">{{ events.akad.location }}</p>
      
      <a :href="events.akad.mapUrl" target="_blank" class="inline-flex items-center justify-center px-6 py-2 bg-stone-800 text-white text-xs font-bold rounded-full hover:bg-gold-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Google Maps
      </a>
    </div>

    <!-- Resepsi -->
    <div class="relative bg-stone-900 text-white rounded-3xl p-8 shadow-lg shadow-stone-800/20 overflow-hidden">
       <div class="absolute top-0 left-0 p-4 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.707 2.707 0 01-3 0 2.707 2.707 0 00-3 0 2.707 2.707 0 01-3 0 2.707 2.707 0 00-3 0 2.707 2.707 0 01-3 0 2.707 2.707 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      </div>

      <h3 class="font-serif text-2xl text-gold-400 mb-2">Resepsi</h3>
      <div class="flex items-center justify-center space-x-2 text-stone-400 mb-6">
        <span class="px-3 py-1 bg-stone-800 rounded-full text-xs font-bold tracking-widest">{{ events.resepsi.time }}</span>
      </div>
      
      <p class="text-stone-300 font-medium mb-1">{{ events.resepsi.date }}</p>
      <p class="text-stone-400 text-sm mb-6">{{ events.resepsi.location }}</p>
      
      <a :href="events.resepsi.mapUrl" target="_blank" class="inline-flex items-center justify-center px-6 py-2 bg-white text-stone-900 text-xs font-bold rounded-full hover:bg-gold-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Google Maps
      </a>
    </div>

  </div>
</template>
