<script setup lang="ts">
import { animate, stagger } from 'motion'
import { useAuthClient } from '../utils/auth-client'

const isMenuOpen = ref(false)

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

onMounted(async () => {
    // 1. Session check
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    if (data?.user) {
        return navigateTo('/dashboard')
    }

    // 2. Motion One Animation
    animate('.anim-up', 
        { y: [50, 0], opacity: [0, 1] },
        { duration: 1, delay: stagger(0.2), easing: "ease-out" } as any
    )
})

useSeoMeta({
  title: 'Mengundang: Platform Undangan Digital Premium #1',
  description: 'Buat website undangan pernikahan digital premium dengan desain eksklusif, fitur RSVP cinematic, dan real-time editor bersama Mengundang.',
  keywords: 'undangan pernikahan digital, website undangan nikah, undangan digital mewah, jasa undangan online, undangan digital jakarta, wedding invitation indonesia',
  ogTitle: 'Mengundang: Platform Undangan Digital Premium',
  ogDescription: 'Ciptakan momen tak terlupakan dengan website undangan pernikahan digital berkelas dari Mengundang.',
  ogImage: 'https://mengundang.site/cover.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mengundang: Wedding Invitation Premium',
  twitterDescription: 'Platform undangan pernikahan digital premium Indonesia dengan fitur terlengkap.',
  twitterImage: 'https://mengundang.site/cover.png'
})
</script>

<template>
    <div class="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-gold-500 selection:text-white overflow-x-hidden grain">
        
        <!-- Background Elements (Light Mode Adjusted) -->
        <div class="fixed inset-0 pointer-events-none z-0">
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <!-- Navigation -->
        <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-stone-200/50">
            <div class="flex flex-row justify-between items-center p-4 md:p-6 max-w-7xl mx-auto">
                <!-- Logo -->
                <div class="flex items-center gap-3 group cursor-pointer">
                    <div class="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white font-bold font-serif text-2xl shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform">
                        M
                    </div>
                    <span class="text-2xl font-serif font-bold text-stone-900 tracking-tight">Mengundang<span class="text-gold-500">.</span></span>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-10">
                    <a href="#features" class="text-sm font-semibold text-stone-700 hover:text-gold-600 transition-colors uppercase tracking-widest">Fitur</a>
                    <NuxtLink to="/login" class="text-sm font-bold text-stone-900 hover:text-gold-600 transition-colors">Masuk</NuxtLink>
                    <NuxtLink to="/register" class="group relative bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-xl hover:shadow-gold-500/10 border border-gold-500/10 hover:border-gold-500/30 hover:-translate-y-0.5">
                        <span class="relative z-10">Buat Undangan</span>
                    </NuxtLink>
                </div>

                <!-- Hamburger -->
                <button @click="toggleMenu" class="md:hidden text-stone-900 p-2">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>

            <!-- Mobile Menu -->
            <div v-show="isMenuOpen" class="md:hidden border-t border-stone-200 bg-white absolute w-full left-0 shadow-2xl">
                <div class="flex flex-col p-6 space-y-4 text-center">
                    <NuxtLink to="/register" class="text-white bg-stone-900 font-bold py-3 rounded-xl hover:bg-stone-800">Daftar Sekarang</NuxtLink>
                    <NuxtLink to="/login" class="text-stone-500 hover:text-stone-900 py-2">Masuk Akun</NuxtLink>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <header class="relative z-10 pt-20 pb-32 px-4 text-center">
            <div class="max-w-4xl mx-auto space-y-8">
                <!-- Badge -->
                <div class="anim-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm mb-6">
                    <span class="animate-pulse w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-xs font-bold tracking-widest uppercase text-stone-600">Platform No. 1 Indonesia</span>
                </div>

                <!-- Headline -->
                <h1 class="anim-up text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.9] text-stone-900 tracking-tight">
                    Abadikan Momen <br>
                    <span class="text-stone-100 text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 italic pr-2 drop-shadow-sm">Tak Terlupakan.</span>
                </h1>

                <!-- Subheadline -->
                <p class="anim-up text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
                    Sambut tamu undangan Anda dengan kemewahan digital. Desain eksklusif, animasi sinematik, dan sentuhan personal untuk hari paling spesial Anda.
                </p>

                <!-- CTA -->
                <div class="anim-up pt-8 flex flex-col md:flex-row justify-center gap-4 items-center">
                     <a href="/wulanrezal" target="_blank" class="group relative w-full md:w-auto bg-stone-900 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 overflow-hidden">
                        <span class="relative z-10 flex items-center justify-center gap-2">
                            Lihat Contoh Undangan <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </span>
                        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </a>
                    <a href="https://wa.me/6282265030113" target="_blank" class="w-full md:w-auto px-8 py-5 rounded-full font-bold text-lg text-stone-600 border border-stone-200 hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 bg-white">
                        <i class="fab fa-whatsapp text-green-600"></i> Konsultasi Gratis
                    </a>
                </div>

                <!-- Trust Metrics -->
                <div class="anim-up pt-12 flex justify-center gap-8 md:gap-16 opacity-80 transition-all duration-500">
                     <div class="text-center">
                         <div class="text-2xl font-bold text-stone-900">Premium</div>
                         <div class="text-[10px] uppercase tracking-wider text-stone-500">Kualitas Desain</div>
                     </div>
                     <div class="text-center">
                         <div class="text-2xl font-bold text-stone-900">Eksklusif</div>
                         <div class="text-[10px] uppercase tracking-wider text-stone-500">Fitur Utama</div>
                     </div>
                     <div class="text-center">
                         <div class="text-2xl font-bold text-stone-900">Sempurna</div>
                         <div class="text-[10px] uppercase tracking-wider text-stone-500">Setiap Detail</div>
                     </div>
                </div>
            </div>
        </header>

        <!-- Product Showcase (The Real Showcase) -->
        <div class="relative z-10 -mt-10 mb-32 px-4">
             <div class="anim-up max-w-6xl mx-auto">
                 <div class="relative bg-white/40 backdrop-blur-sm rounded-[3rem] p-8 md:p-20 border border-white bg-white/40 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] overflow-hidden group">
                      <!-- Background Glows -->
                      <div class="absolute top-0 -left-20 w-80 h-80 bg-gold-200/20 rounded-full blur-[100px] pointer-events-none"></div>
                      <div class="absolute bottom-0 -right-20 w-80 h-80 bg-stone-300/20 rounded-full blur-[100px] pointer-events-none"></div>

                      <div class="flex flex-col md:flex-row items-center gap-16 relative z-10">
                          <!-- Left: Emotional Copy -->
                          <div class="flex-1 text-center md:text-left space-y-8">
                               <div class="inline-block px-4 py-1.5 bg-gold-500/10 text-gold-700 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold">The Art of Details</div>
                               <h3 class="font-serif text-5xl md:text-7xl text-stone-900 leading-tight">Kesempurnaan di <br> Setiap Detail.</h3>
                               <p class="text-stone-600 text-lg md:text-xl font-light leading-relaxed">Rasakan kemewahan yang berbicara melalui sentuhan. Setiap animasi, tipografi, dan interaksi dirancang khusus untuk menciptakan kesan yang tak terlupakan.</p>
                               
                               <div class="hidden md:flex flex-wrap gap-4 pt-4">
                                   <div class="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm text-stone-700 text-sm flex items-center gap-3">
                                       <i class="fas fa-music text-gold-500"></i> Romantic Audio
                                   </div>
                                   <div class="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm text-stone-700 text-sm flex items-center gap-3">
                                       <i class="fas fa-heart text-gold-500"></i> Cinematic RSVP
                                   </div>
                               </div>
                          </div>

                          <!-- Right: High-Fidelity iPhone Mockup -->
                          <div class="relative flex-1 flex justify-center items-center">
                               <!-- iPhone Frame -->
                               <div class="relative w-[280px] h-[580px] bg-stone-900 rounded-[3.5rem] border-[10px] border-stone-800 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden transform group-hover:-translate-y-4 group-hover:rotate-2 transition-all duration-1000">
                                   <!-- Notch -->
                                   <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-stone-800 rounded-b-2xl z-30"></div>
                                   
                                   <!-- Simulated Invitation Content -->
                                   <div class="absolute inset-0 bg-[#FDFCFB] z-20 flex flex-col">
                                        <div class="relative h-[65%] flex items-center justify-center p-8 overflow-hidden">
                                             <div class="absolute inset-0 bg-stone-50">
                                                  <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-40" alt="Preview Desain Undangan Pernikahan Digital Mewah">
                                             </div>
                                             <div class="relative text-center space-y-6">
                                                  <div class="font-serif text-gold-600 text-sm italic">The Wedding of</div>
                                                  <div class="font-serif text-4xl text-stone-900 leading-[1.1]">Romeo <br>& Juliet</div>
                                                  <div class="w-12 h-px bg-gold-300 mx-auto"></div>
                                                  <div class="text-[10px] tracking-[0.2em] text-stone-500 uppercase">14 February 2026</div>
                                             </div>
                                        </div>
                                        <div class="flex-1 bg-white p-8 space-y-8">
                                             <div class="h-1.5 w-16 bg-stone-100 rounded-full"></div>
                                             <div class="space-y-4">
                                                  <div class="h-3 w-full bg-stone-50 rounded-full"></div>
                                                  <div class="h-3 w-5/6 bg-stone-50 rounded-full"></div>
                                             </div>
                                             <div class="h-12 w-full bg-stone-900 rounded-2xl shadow-lg shadow-stone-900/20"></div>
                                        </div>
                                   </div>
                               </div>

                               <!-- Floating Glass Elements -->
                               <div class="absolute -top-6 -right-12 hidden lg:block animate-bounce" style="animation-duration: 4s">
                                    <div class="bg-white/60 backdrop-blur-2xl p-5 rounded-2xl border border-white shadow-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                            <span class="text-xs font-bold text-stone-800">124 Tamu Hadir</span>
                                        </div>
                                    </div>
                               </div>

                               <div class="absolute bottom-24 -left-16 hidden lg:block animate-pulse" style="animation-duration: 3s">
                                    <div class="bg-white/60 backdrop-blur-2xl p-5 rounded-2xl border border-white shadow-xl">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600">
                                                <i class="fas fa-play text-xs"></i>
                                            </div>
                                            <div class="text-left">
                                                <div class="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Now Playing</div>
                                                <div class="text-xs font-bold text-stone-900">Perfect - Ed Sheeran</div>
                                            </div>
                                        </div>
                                    </div>
                               </div>
                          </div>
                      </div>
                 </div>
             </div>
        </div>

        <!-- Features Grid -->
        <section id="features" class="relative z-10 py-20 px-4 bg-white border-t border-stone-100">
             <div class="max-w-6xl mx-auto">
                 <div class="text-center mb-16">
                     <h2 class="text-3xl md:text-5xl font-serif text-stone-900 mb-4">Fitur Tanpa Kompromi</h2>
                     <p class="text-stone-500">Dibangun untuk perfeksionis seperti Anda.</p>
                 </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <!-- Feature 1 -->
                      <div class="group p-10 rounded-[2.5rem] bg-white border border-stone-100 hover:border-gold-200 transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(212,175,55,0.08)]">
                          <div class="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl text-gold-500 mb-8 group-hover:scale-110 group-hover:bg-gold-50 transition-all duration-500">
                              <i class="fas fa-feather-pointed"></i>
                          </div>
                          <h3 class="text-2xl font-serif text-stone-900 mb-4 tracking-tight">Akses Tanpa Hambatan</h3>
                          <p class="text-stone-500 leading-relaxed font-light">Dibangun di atas infrastruktur eksklusif yang menjamin undangan Anda tampil sempurna dalam sekejap, tanpa jeda.</p>
                      </div>
                      <!-- Feature 2 -->
                      <div class="group p-10 rounded-[2.5rem] bg-white border border-stone-100 hover:border-gold-200 transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(212,175,55,0.08)]">
                          <div class="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl text-gold-500 mb-8 group-hover:scale-110 group-hover:bg-gold-50 transition-all duration-500">
                              <i class="fas fa-wand-magic-sparkles"></i>
                          </div>
                          <h3 class="text-2xl font-serif text-stone-900 mb-4 tracking-tight">Kreativitas Tak Terbatas</h3>
                          <p class="text-stone-500 leading-relaxed font-light">Ekspresikan kisah Anda melalui editor yang intuitif. Ubah rupa, kata, dan melodi sekehendak hati dengan pembaruan instan.</p>
                      </div>
                      <!-- Feature 3 -->
                      <div class="group p-10 rounded-[2.5rem] bg-white border border-stone-100 hover:border-gold-200 transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(212,175,55,0.08)]">
                          <div class="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl text-gold-500 mb-8 group-hover:scale-110 group-hover:bg-gold-50 transition-all duration-500">
                              <i class="fas fa-crown"></i>
                          </div>
                          <h3 class="text-2xl font-serif text-stone-900 mb-4 tracking-tight">Eksklusivitas Terjaga</h3>
                          <p class="text-stone-500 leading-relaxed font-light">Privasi Anda adalah prioritas. Kelola tamu spesial dan amankan momen intim Anda dengan proteksi akses yang elegan.</p>
                      </div>
                  </div>
             </div>
        </section>

        <!-- Footer -->
        <footer class="bg-stone-50 border-t border-stone-200 py-12 px-4 text-center">
            <div class="max-w-4xl mx-auto">
                <h4 class="font-serif text-2xl text-stone-900 mb-6">Mengundang<span class="text-gold-500">.</span></h4>
                <div class="flex justify-center gap-6 mb-8 text-stone-400">
                    <a href="#" class="hover:text-gold-600 transition-colors">Instagram</a>
                    <a href="#" class="hover:text-gold-600 transition-colors">Twitter</a>
                    <a href="#" class="hover:text-gold-600 transition-colors">TikTok</a>
                </div>
                <p class="text-stone-400 text-sm">&copy; 2025 Mengundang. All Rights Reserved.</p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Gradient Text Utility */
.text-gradient-gold {
    background: linear-gradient(to right, #FCD34D, #B45309);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Subtle Grain Texture Overlay */
.grain::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: url('https://grainy-gradients.vercel.app/noise.svg');
    opacity: 0.03;
    z-index: 100;
}
</style>
