<script setup lang="ts">
const props = defineProps<{
  profile: {
    fullName?: string
    image?: string
    parents?: string
    instagram?: string
  },
  title: string
}>()
</script>

<template>
  <div class="w-full flex justify-center items-center relative z-10">
    
    <!-- Aesthetic Blurred Background (Fixed Backdrop for this section) -->
    <!-- We use a fixed like strategy within this relative context if needed, but actually since we are inside a full screen section, we can just fill it. 
         However, the safest way to ensure cover without overflow issues inside a snap container is absolute positioning relative to the section.
         Since this component is the only child of the section, we can assume full width/height.
    -->
    <div v-if="profile.image" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen overflow-hidden -z-20 pointer-events-none" style="mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);">
        <img :src="profile.image" class="w-full h-full object-cover blur-[2px] opacity-60 animate-ken-burns" referrerpolicy="no-referrer" style="filter: blur(2px);" />
        <div class="absolute inset-0 bg-stone-900/10 mix-blend-multiply"></div> 
        <!-- Reduced gradient opacity from 80 to 50 so image is clearer -->
        <div class="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-stone-50 opacity-50"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md py-12 text-center space-y-2">
      <h3 class="font-sans text-xs tracking-[0.3em] text-gold-600 font-bold uppercase mb-8 opacity-80">{{ title }}</h3>
      
      <div class="relative group cursor-default">
          <!-- Premium Profile Card -->
          <div class="p-8 bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-stone-300/50 border border-white/50 mx-4 transform transition-all duration-500 hover:-translate-y-1">
            
            <!-- Aesthetic Image Container -->
            <div class="relative mb-6 inline-block">
                <!-- Premium Gold Rings -->
                <!-- 1. Outer Metallic Ring -->
                <div class="absolute -inset-3 rounded-full bg-gradient-to-tr from-yellow-100 via-yellow-300 to-yellow-600 opacity-60 animate-pulse"></div>
                <!-- 2. Rotating Border -->
                <div class="absolute -inset-[2px] rounded-full border-2 border-dashed border-gold-300/60 transition-transform duration-[10s] ease-linear group-hover:rotate-180"></div>
                
                <!-- Main Image Frame -->
                <div class="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white shadow-inner relative z-10 ring-4 ring-yellow-400/30">
                   <img :src="profile.image" :alt="profile.fullName" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" referrerpolicy="no-referrer" />
                </div>
                
                <!-- Premium Floating Icon -->
                <div class="absolute bottom-4 right-4 z-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full p-2.5 shadow-lg text-white animate-bounce border-2 border-white">
                    <i class="fas fa-heart text-xs"></i>
                </div>
            </div>

            <h3 class="font-serif text-3xl sm:text-4xl text-stone-800 mb-2 leading-tight drop-shadow-sm">{{ profile.fullName }}</h3>
            <p class="font-sans text-sm text-stone-500 mb-6 px-4 font-medium">{{ profile.parents }}</p>
            
            <div v-if="profile.instagram">
              <a :href="'https://instagram.com/' + (profile.instagram?.replace('@', '') || '')" target="_blank" class="inline-flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-stone-800 to-stone-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-gold-500 hover:to-yellow-600 hover:shadow-gold-500/30 transition-all duration-300 transform hover:scale-105">
                <i class="fab fa-instagram text-lg"></i> 
                <span>{{ profile.instagram }}</span>
              </a>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes ken-burns {
    0% { transform: scale(1.0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1.0); }
}

.animate-ken-burns {
    animation: ken-burns 30s ease-in-out infinite alternate;
}
</style>
