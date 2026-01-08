<script setup lang="ts">
const props = defineProps<{
  events: any
}>()
</script>

<template>
  <div class="event-details-section w-full py-32 relative overflow-hidden bg-stone-50" id="events">
    <!-- Premium Ambient Background -->
    <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply animate-pulse-slow"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 mix-blend-multiply"></div>
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 pointer-events-none"></div>

    <div class="container mx-auto px-6 relative z-10">
      
      <!-- HEADER -->
      <div class="text-center mb-24 space-y-6">
        <div class="flex items-center justify-center gap-6 opacity-80 mb-4">
            <div class="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
            <i class="fas fa-heart text-gold-500 text-sm animate-beat"></i>
            <div class="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
        </div>
        <h2 class="font-serif text-5xl md:text-6xl text-stone-900 mb-2 tracking-tight">Rangkaian Acara</h2>
        <p class="text-stone-500 max-w-xl mx-auto leading-loose font-light text-base md:text-lg italic font-serif">
          "Pernikahan adalah ibadah terpanjang dan terindah..."
        </p>
      </div>

      <!-- TIMELINE CONTAINER -->
      <div class="relative max-w-5xl mx-auto">
        <!-- Vertical Line (Desktop: Center) -->
        <div class="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold-300 to-transparent md:-translate-x-1/2"></div>

        <!-- EVENT 1: AKAD -->
        <div class="relative mb-32 group perspective-1000">
           <!-- Diamond Node -->
           <div class="absolute left-8 md:left-1/2 -translate-x-1/2 mt-10 z-20 flex items-center justify-center">
              <div class="w-4 h-4 bg-gold-500 rotate-45 border-4 border-stone-50 shadow-[0_0_15px_rgba(212,175,55,0.6)] group-hover:scale-150 transition-transform duration-500 ease-out"></div>
           </div>

           <div class="flex flex-col md:flex-row items-stretch justify-between gap-12 md:gap-24">
              <!-- Time & Title (Desktop Left) -->
              <div class="w-full md:w-1/2 pl-20 md:pl-0 md:text-right md:pr-12 md:order-1 flex flex-col justify-center">
                 <div class="text-gold-500 font-serif italic text-6xl md:text-7xl mb-2 drop-shadow-sm">{{ events.akad.time }}</div>
                 <h3 class="font-serif text-3xl md:text-4xl text-stone-900 mb-2">Akad Nikah</h3>
                 <p class="text-gold-600 font-bold tracking-[0.2em] text-xs uppercase border-t border-gold-200 inline-block md:ml-auto pt-3 mt-1">Momen Sakral</p>
              </div>

              <!-- Location Card (Desktop Right) -->
              <div class="w-full md:w-1/2 pl-20 md:pl-12 md:order-2">
                  <div class="relative group/card">
                      <!-- Card Backdrop Blur & Glass -->
                      <div class="absolute inset-0 bg-gold-200 blur-2xl opacity-0 group-hover/card:opacity-20 transition-opacity duration-700"></div>
                      
                      <div class="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-none border border-gold-100/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(217,119,6,0.15)] transition-all duration-500 relative overflow-hidden transform hover:-translate-y-2">
                          <!-- Corner Ornament -->
                          <div class="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold-200 rounded-tr-3xl m-4 opacity-50"></div>
                          <div class="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold-200 rounded-bl-3xl m-4 opacity-50"></div>

                          <div class="relative z-10">
                              <div class="flex items-center gap-4 mb-6">
                                  <div class="p-3 bg-stone-50 rounded-full border border-gold-100 text-gold-600">
                                      <i class="fas fa-mosque text-xl"></i>
                                  </div>
                                  <div>
                                      <p class="font-serif text-2xl text-stone-800">{{ events.akad.date }}</p>
                                  </div>
                              </div>
                              
                              <p class="text-stone-600 text-base leading-relaxed mb-6 font-light border-l-2 border-gold-300 pl-4 py-1">
                                  {{ events.akad.location }}
                              </p>

                              <a :href="events.akad.mapUrl" target="_blank" class="inline-flex items-center gap-3 px-6 py-3 bg-stone-900 text-white text-xs font-bold tracking-widest uppercase hover:bg-gold-600 transition-colors duration-300 shadow-lg shadow-stone-900/10">
                                  Petunjuk Arah
                                  <i class="fas fa-arrow-right"></i>
                              </a>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        </div>

        <!-- EVENT 2: RESEPSI -->
        <div class="relative mb-8 group perspective-1000">
           <!-- Diamond Node -->
           <div class="absolute left-8 md:left-1/2 -translate-x-1/2 mt-10 z-20 flex items-center justify-center">
              <div class="w-4 h-4 bg-white rotate-45 border-4 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.6)] group-hover:scale-150 transition-transform duration-500 ease-out"></div>
           </div>

           <div class="flex flex-col md:flex-row items-stretch justify-between gap-12 md:gap-24">
              <!-- Time & Title (Desktop Right) -->
              <div class="w-full md:w-1/2 pl-20 md:pl-12 md:order-2 flex flex-col justify-center">
                 <div class="text-stone-300 font-serif italic text-6xl md:text-7xl mb-2 drop-shadow-sm group-hover:text-stone-800 transition-colors duration-500">{{ events.resepsi.time }}</div>
                 <h3 class="font-serif text-3xl md:text-4xl text-stone-900 mb-2">Resepsi</h3>
                 <p class="text-gold-600 font-bold tracking-[0.2em] text-xs uppercase border-t border-gold-200 inline-block mr-auto pt-3 mt-1">Perayaan Cinta</p>
              </div>

              <!-- Location Card (Desktop Left) -->
              <div class="w-full md:w-1/2 pl-20 md:pl-0 md:pr-12 md:order-1">
                  <div class="relative group/card">
                      <!-- Card Backdrop Blur & Glass -->
                      <div class="absolute inset-0 bg-gold-200 blur-2xl opacity-0 group-hover/card:opacity-20 transition-opacity duration-700"></div>

                      <div class="bg-stone-900/95 backdrop-blur-md p-8 md:p-10 rounded-none border border-stone-800 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] transition-all duration-500 relative overflow-hidden transform hover:-translate-y-2 md:text-right">
                          <!-- Corner Ornament -->
                          <div class="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-stone-700 rounded-tl-3xl m-4 opacity-30"></div>
                          <div class="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-stone-700 rounded-br-3xl m-4 opacity-30"></div>

                          <div class="relative z-10 text-white">
                              <div class="flex items-center gap-4 mb-6 md:flex-row-reverse">
                                  <div class="p-3 bg-stone-800 rounded-full border border-stone-700 text-gold-400">
                                      <i class="fas fa-glass-cheers text-xl"></i>
                                  </div>
                                  <div>
                                      <p class="font-serif text-2xl text-gold-100">{{ events.resepsi.date }}</p>
                                  </div>
                              </div>
                              
                              <div class="mb-6 flex flex-col md:items-end">
                                  <p class="text-stone-400 text-base leading-relaxed font-light border-l-2 md:border-l-0 md:border-r-2 border-gold-500/30 pl-4 md:pl-0 md:pr-4 py-1">
                                      {{ events.resepsi.location }}
                                  </p>
                              </div>

                              <a :href="events.resepsi.mapUrl" target="_blank" class="inline-flex items-center gap-3 px-6 py-3 bg-gold-600 text-stone-900 text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300 shadow-lg shadow-gold-900/20 md:flex-row-reverse">
                                  Petunjuk Arah
                                  <i class="fas fa-location-arrow"></i>
                              </a>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        </div>

      </div>

      <!-- FOOTER NOTE -->
      <div class="text-center mt-32 relative">
          <div class="absolute left-1/2 -top-12 -translate-x-1/2 text-gold-200 text-4xl opacity-20"><i class="fas fa-quote-left"></i></div>
          <p class="text-sm text-stone-500 font-serif italic max-w-2xl mx-auto leading-loose">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya..."</p>
          <div class="mt-6 flex items-center justify-center gap-2">
             <div class="h-[1px] w-8 bg-gold-300"></div>
             <p class="text-[10px] text-stone-400 uppercase tracking-[0.3em]">(QS. Ar-Rum: 21)</p>
             <div class="h-[1px] w-8 bg-gold-300"></div>
          </div>
      </div>

    </div>
  </div>
</template>
