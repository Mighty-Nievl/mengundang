<script setup lang="ts">
const route = useRoute()
const refCode = useCookie('referral_code', { maxAge: 60 * 60 * 24 * 30 }) // 30 days

if (route.query.ref) {
  refCode.value = route.query.ref as string
}
</script>

<template>
  <div>
    <NuxtPage />
    <PremiumModal />
    <GlobalLoader />
  </div>
</template>

<style>
:root {
    /* --- STONE PALETTE (Neutral) --- */
    --color-stone-50:  #fafaf9;
    --color-stone-100: #f5f5f4;
    --color-stone-200: #e7e5e4;
    --color-stone-300: #d6d3d1;
    --color-stone-400: #a8a29e;
    --color-stone-500: #78716c;
    --color-stone-600: #57534e;
    --color-stone-700: #44403c;
    --color-stone-800: #292524;
    --color-stone-900: #1c1917;
    --color-stone-950: #0c0a09;

    /* --- GOLD PALETTE (Accent) --- */
    --color-gold-50:  #fdfcf5;
    --color-gold-100: #fbf5e6;
    --color-gold-200: #f4e6c2;
    --color-gold-300: #ebd496;
    --color-gold-400: #e0c068;
    --color-gold-500: #d4af37;
    --color-gold-600: #aa8c2c;
    --color-gold-700: #856a1b;
    --color-gold-800: #634d12;
    --color-gold-900: #42320b;
}


</style>


