<script setup lang="ts">
useSeoMeta({
  title: 'Akses Ditolak - Undangan Premium',
  description: 'Halaman ini tidak dapat diakses.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans overflow-hidden relative">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-gold-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute bottom-0 right-0 w-64 h-64 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    
    <div class="max-w-md w-full text-center relative z-10">
      <div class="mb-8 inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-xl border border-stone-100 animate-fade-in">
        <i class="fas fa-user-shield text-4xl text-stone-400"></i>
      </div>
      
      <h1 class="text-4xl font-playfair font-bold text-stone-800 mb-4 animate-slide-up">Ups, Kamu Tersesat!</h1>
      <p class="text-stone-500 mb-10 leading-relaxed animate-slide-up animation-delay-200">
        Sepertinya kamu mencoba mengakses halaman yang bukan milikmu. Jangan khawatir, yuk balik ke jalan yang benar!
      </p>
      
      <div class="space-y-4 animate-slide-up animation-delay-500">
        <NuxtLink 
          to="/dashboard" 
          class="block w-full py-4 px-6 bg-stone-900 text-white rounded-xl font-bold shadow-lg hover:bg-gold-600 transition-all active:scale-95"
        >
          Kembali ke Dashboard
        </NuxtLink>
        
        <NuxtLink 
          to="/" 
          class="block w-full py-4 px-6 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all"
        >
          Halaman Utama
        </NuxtLink>
      </div>
      
      <p class="mt-12 text-stone-400 text-xs font-medium uppercase tracking-widest">
        &copy; 2025 Undangan Digital Premium
      </p>
    </div>
  </div>
</template>

<style scoped>
.font-playfair {
  font-family: 'Playfair Display', serif;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite alternate;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s ease-out forwards;
}

.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-500 { animation-delay: 0.5s; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}
</style>
