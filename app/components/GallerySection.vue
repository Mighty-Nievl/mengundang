<script setup lang="ts">
const props = defineProps<{
  images?: string[]
}>()

const defaultImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&q=80&w=800',
]

const displayImages = computed(() => {
    return (props.images && props.images.length > 0) ? props.images : defaultImages
})
</script>

<template>
  <div class="gallery-section space-y-6 pt-16">
    <div class="text-center mb-8">
      <h2 class="font-serif text-3xl text-stone-800 mb-2">Momen Bahagia</h2>
      <p class="text-stone-500 text-sm">Potret kebersamaan kami</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div v-for="(img, idx) in displayImages" :key="idx" class="relative group rounded-xl overflow-hidden aspect-square">
        <img :src="img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery Image" loading="lazy" referrerpolicy="no-referrer" />
        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
      </div>
    </div>
  </div>
</template>
