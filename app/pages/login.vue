<script setup lang="ts">
import { useAuthClient } from '../utils/auth-client'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

useSeoMeta({
  title: 'Masuk - Mengundang Premium',
  description: 'Akses dashboard undangan pernikahan digital anda.',
})

const login = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const authClient = useAuthClient()
    const { data, error } = await authClient.signIn.email({
        email: email.value,
        password: password.value
    })

    if (error) throw error

    if (data) {
        if ((data.user as any).role === 'admin') {
            await navigateTo('/admin')
        } else {
            await navigateTo('/dashboard')
        }
    }
  } catch (e: any) {
    errorMsg.value = e.message || e.statusMessage || 'Login Gagal'
  } finally { isLoading.value = false }
}

const googleSignIn = () => {
    const authClient = useAuthClient()
    authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
}

onMounted(async () => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    if (data?.user) {
        if ((data.user as any).role === 'admin') {
            await navigateTo('/admin')
        } else {
            await navigateTo('/dashboard')
        }
    }
})
</script>

<template>
  <div class="min-h-screen flex bg-stone-50 font-sans text-stone-900">
    
    <!-- Left Side: Image (Desktop Only) -->
    <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-stone-100 items-center justify-center">
        <div class="absolute inset-0 bg-gold-400/10 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop" 
            class="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-1000 transform hover:scale-105"
            alt="Wedding Background"
        >
        <div class="relative z-20 max-w-md text-center p-12">
            <h2 class="font-serif text-5xl font-bold text-stone-900 mb-6 leading-tight">Selamat Datang<br>Kembali.</h2>
            <p class="text-stone-600 text-lg">Lanjutkan merancang momen paling spesial dalam hidup Anda.</p>
        </div>
    </div>

    <!-- Right Side: Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
      <div class="w-full max-w-md space-y-8 py-10">
        
        <!-- Header -->
        <div class="text-center lg:text-left">
            <NuxtLink to="/" class="inline-block text-2xl font-serif font-bold text-stone-900 mb-8">Mengundang<span class="text-gold-500">.</span></NuxtLink>
            <h1 class="text-3xl font-bold text-stone-900 mb-2">Masuk Akun</h1>
            <p class="text-stone-500">Silakan masuk untuk mengelola undangan Anda.</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="login" class="space-y-6">
          <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-stone-400">Email Address</label>
              <input v-model="email" type="email" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all" placeholder="user@contoh.com" required>
          </div>
          
          <div class="space-y-2">
              <div class="flex justify-between items-center">
                  <label class="text-xs font-bold uppercase tracking-wider text-stone-400">Password</label>
                  <a href="#" class="text-[10px] font-bold text-gold-600 hover:text-gold-500 uppercase tracking-wider">Lupa Password?</a>
              </div>
              <div class="relative">
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all pr-12" placeholder="••••••••" required>
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors">
                      <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
              </div>
          </div>
          
          <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
              <i class="fas fa-exclamation-circle mr-2"></i> {{ errorMsg }}
          </div>
          
          <button type="submit" :disabled="isLoading" class="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
              {{ isLoading ? 'Masuk...' : 'Masuk ke Dashboard' }}
          </button>
        </form>

        <!-- Social & Register -->
        <div class="space-y-6">
             <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-stone-100"></span>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-white px-2 text-stone-400">Atau masuk dengan</span>
                </div>
            </div>

            <button type="button" @click="googleSignIn" class="w-full bg-white border border-stone-200 text-stone-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-stone-50 transition-all shadow-sm">
                <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" />
                Google Account
            </button>
            
            <p class="text-center text-stone-500 text-sm">
                Belum punya akun? <NuxtLink to="/register" class="text-gold-600 font-bold hover:text-gold-500 hover:underline">Daftar disini</NuxtLink>
            </p>
        </div>

      </div>
    </div>
  </div>
</template>
