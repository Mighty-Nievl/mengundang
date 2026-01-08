<template>
  <div class="quote-section py-24 relative overflow-hidden bg-stone-50" id="quote">
     <!-- Decorative Background -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full opacity-5 pointer-events-none">
         <div class="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
    </div>
    
    <div class="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <!-- Optional Ornament -->
        <div class="mb-8 opacity-40">
            <img src="https://cdn-icons-png.flaticon.com/512/46/46369.png" class="w-12 h-12 mx-auto grayscale opacity-50" alt="ornament" />
        </div>

        <div class="space-y-8 reveal-on-scroll">
            <!-- Arabic Text (Optional) -->
            <div v-if="quote?.arabic" class="font-serif text-3xl md:text-4xl text-gold-600 leading-loose" style="font-family: 'Amiri', serif;">
                {{ quote.arabic }}
            </div>

            <!-- Translation/Content -->
            <div v-if="quote?.content" class="text-stone-600 font-serif italic text-lg md:text-xl leading-relaxed">
                "{{ quote.content }}"
            </div>

            <!-- Source -->
            <div v-if="quote?.source" class="inline-block mt-4 px-6 py-2 border-t border-gold-200">
                <span class="text-stone-900 font-bold uppercase tracking-[0.2em] text-xs">
                    {{ quote.source }}
                </span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quote?: {
    arabic?: string
    content?: string
    source?: string
  }
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
</style>
