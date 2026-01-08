<template>
  <div class="space-y-8 animate-pulse">
    <!-- Header Skeleton -->
    <div class="bg-white p-6 rounded-3xl border border-stone-100 h-24 w-full"></div>

    <!-- Card Skeleton -->
    <div class="space-y-6">
        <div v-for="i in 2" :key="i" class="bg-white rounded-3xl p-8 border border-stone-100 h-64 w-full"></div>
    </div>
  </div>
</template>
