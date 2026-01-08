<template>
  <div class="love-story-section py-24 relative bg-white overflow-hidden" id="story">
    <div class="container mx-auto px-6 relative z-10 max-w-4xl">
      <!-- Section Title -->
      <div class="text-center mb-16 reveal-on-scroll">
        <h2 class="font-serif text-3xl md:text-5xl text-stone-800 mb-4">Our Love Story</h2>
        <div class="w-24 h-1 bg-gold-400 mx-auto rounded-full"></div>
        <p class="text-stone-500 mt-4 italic">Perjalanan cinta kami menuju ikatan suci.</p>
      </div>

      <!-- Timeline Container -->
      <div class="relative">
        <!-- Vertical Line -->
        <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gold-200 transform md:-translate-x-1/2"></div>

        <!-- Story Items -->
        <div v-for="(item, index) in stories" :key="index" class="relative mb-12 md:mb-24 last:mb-0 reveal-on-scroll">
            <div class="md:flex items-center justify-between w-full" :class="{'md:flex-row-reverse': index % 2 !== 0}">
                
                <!-- Content Side -->
                <div class="md:w-5/12 ml-12 md:ml-0 mb-6 md:mb-0" :class="{'md:text-right': index % 2 === 0, 'md:text-left': index % 2 !== 0}">
                    <div class="bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                         <!-- Year Badge (Mobile) -->
                        <span class="md:hidden absolute -left-12 top-4 bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            {{ item.year }}
                        </span>

                        <h3 class="font-serif text-xl md:text-2xl text-stone-800 mb-2">{{ item.title }}</h3>
                        <p class="text-stone-600 text-sm leading-relaxed">{{ item.content }}</p>
                    </div>
                </div>

                <!-- Center Node (Timeline Dot) -->
                <div class="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gold-100 border-4 border-white shadow-sm z-10">
                    <div class="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>
                </div>

                <!-- Date/Image Side (Desktop) -->
                 <div class="md:w-5/12 ml-12 md:ml-0 flex md:block" :class="{'md:justify-start': index % 2 === 0, 'md:justify-end': index % 2 !== 0}">
                     <!-- Desktop Year Display -->
                    <div class="hidden md:block text-gold-500 font-bold text-6xl opacity-20 font-serif leading-none mb-4" :class="{'text-left': index % 2 === 0, 'text-right': index % 2 !== 0}">
                        {{ item.year }}
                    </div>
                    
                    <!-- Optional Image -->
                    <div v-if="item.image" class="hidden md:block rounded-xl overflow-hidden shadow-md aspect-video border border-stone-100">
                         <img :src="item.image" :alt="item.title" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" loading="lazy" />
                    </div>
                 </div>

            </div>
        </div>

      </div>
       <!-- End Ornament -->
       <div class="text-center mt-12 reveal-on-scroll">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-50 text-gold-400 border border-gold-200">
                <i class="fas fa-heart"></i>
            </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stories?: Array<{
    year: string
    title: string
    content: string
    image?: string
  }>
}>()
</script>

<style scoped>
/* Optional specific overrides if needed */
</style>
