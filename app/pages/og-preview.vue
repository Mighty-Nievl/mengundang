<script setup lang="ts">
// OG Image Generator Page
// This page is designed to be screenshotted at 1200x630
definePageMeta({
    layout: 'empty'
})
</script>

<template>
    <div class="min-h-screen bg-stone-900 flex items-center justify-center p-10 font-sans selection:bg-gold-500 selection:text-white">
        <!-- The OG Canvas (1200x630) -->
        <div class="relative w-[1200px] h-[630px] bg-stone-950 overflow-hidden shadow-2xl flex border border-stone-800">
            
            <!-- Background Elements -->
            <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
            <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
            
            <!-- Grid Texture -->
            <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#78716c 1px, transparent 1px); background-size: 40px 40px;"></div>

            <!-- Left Content: Typography -->
            <div class="relative z-10 w-1/2 h-full flex flex-col justify-center px-20">
                <!-- Brand -->
                <div class="flex items-center gap-4 mb-12">
                     <div class="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white font-bold font-serif text-3xl shadow-lg shadow-gold-500/20">
                        U
                    </div>
                    <span class="text-3xl font-serif font-bold text-white tracking-tight">Undangan<span class="text-gold-500">.</span></span>
                </div>

                <!-- Headline -->
                 <span class="text-gold-500 font-bold tracking-[0.2em] uppercase text-sm mb-4">Premium Wedding Platform</span>
                <h1 class="text-6xl font-serif font-bold text-white leading-tight mb-6">
                    Buat Undangan <br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300">Mewah & Elegan</span> <br>
                    Dalam 5 Menit.
                </h1>
                
                <p class="text-stone-400 text-xl leading-relaxed max-w-md">
                    Platform undangan digital no.1 dengan desain eksklusif, fitur RSVP, dan musik romantis.
                </p>

                <!-- Fake CTA (Psychological Trigger) -->
                <div class="mt-10 flex items-center gap-3">
                    <div class="bg-white text-stone-950 px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
                        <span>Lihat Preview</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="text-stone-500 text-sm font-medium ml-4">
                        *Gratis Coba Sekarang
                    </div>
                </div>
            </div>

            <!-- Right Content: Visual Mockup -->
            <div class="relative z-10 w-1/2 h-full flex items-center justify-center">
                <!-- Floating Glass Card -->
                <div class="absolute top-20 right-20 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl transform rotate-6 animate-pulse">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <i class="fas fa-check"></i>
                        </div>
                        <div>
                            <div class="text-white font-bold text-sm">RSVP Berhasil</div>
                            <div class="text-white/60 text-xs">Asep & 2 Orang lainnya</div>
                        </div>
                     </div>
                </div>

                 <!-- iPhone Mockup -->
                <div class="relative w-[320px] h-[650px] bg-stone-900 rounded-[50px] border-[8px] border-stone-700 shadow-2xl transform rotate-[-5deg] overflow-hidden translate-y-10">
                    <!-- Screen -->
                    <div class="w-full h-full bg-stone-100 overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-80" alt="Preview">
                         <div class="absolute inset-0 bg-stone-900/30 flex flex-col items-center justify-center text-center p-6">
                            <div class="font-serif text-white/90 italic mb-2">The Wedding of</div>
                            <h2 class="font-serif text-4xl text-white font-bold mb-4">Romeo & Juliet</h2>
                            <div class="text-white/80 text-sm font-sans tracking-widest uppercase border-y border-white/30 py-2 w-full">24 . 12 . 2024</div>
                         </div>
                    </div>
                    <!-- Notch -->
                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-b-2xl"></div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Gold Gradient Utility */
.text-gold-500 { color: #d4af37; }
.bg-gold-500 { background-color: #d4af37; }
.bg-gold-400 { background-color: #e5c55b; }
.bg-gold-600 { background-color: #aa8c2c; }
.from-gold-300 { --tw-gradient-from: #f3d874 var(--tw-gradient-from-position); }
.via-gold-500 { --tw-gradient-via: #d4af37 var(--tw-gradient-via-position); }
.to-gold-300 { --tw-gradient-to: #f3d874 var(--tw-gradient-to-position); }
.to-gold-600 { --tw-gradient-to: #aa8c2c var(--tw-gradient-to-position); }
</style>
