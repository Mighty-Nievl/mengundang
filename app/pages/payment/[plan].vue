<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const planId = route.params.plan as string

const plans: any = {
    'regular': { 
        name: 'Regular', 
        price: 49000,
        features: [
            '5 Undangan Digital',
            'Limit 50 Tamu per Undangan',
            'Aktif selama 3 Bulan',
            'Tanpa Watermark',
            'Tema Standar'
        ]
    },
    'vip': { 
        name: 'VIP', 
        price: 99000,
        features: [
            '20 Undangan Digital',
            'Unlimited Tamu (No Limit)',
            'Aktif selama 6 Bulan',
            'Sistem RSVP & Ucapan',
            'Tema Premium',
            'Tanpa Watermark'
        ]
    },
    'vvip': { 
        name: 'VVIP', 
        price: 149000,
        features: [
            'Undangan Tanpa Batas',
            'Unlimited Tamu (No Limit)',
            'Masa Aktif Selamanya',
            'Custom Domain Support',
            'Prioritas Support & Update',
            'Semua Fitur VIP'
        ]
    }
}

const plan = plans[planId]
const isLoading = ref(false)
const orderDetails = ref<any>(null)
const currentStep = ref(1)

useSeoMeta({
  title: `Pembayaran Paket ${plan?.name || 'Premium'} - Undangan`,
  robots: 'noindex, nofollow'
})

// 1. Initial Order Creation
const startPayment = async () => {
    isLoading.value = true
    try {
        const res = await $fetch<any>('/api/orders', {
            method: 'POST',
            body: {
                plan: planId,
                amount: plan.price
            }
        })
        orderDetails.value = res
        // Auto-start polling
        startPolling()
    } catch (e: any) {
        alert(e.statusMessage || 'Gagal menyiapkan pesanan')
    } finally {
        isLoading.value = false
    }
}

// 2. Polling Logic for Auto-Detection
let pollInterval: any = null
const startPolling = () => {
    if (pollInterval) clearInterval(pollInterval)
    pollInterval = setInterval(async () => {
        if (!orderDetails.value?.orderId) return
        
        try {
            const data = await $fetch<any>(`/api/orders/${orderDetails.value.orderId}`)
            if (data.status === 'approved' || data.status === 'paid') {
                clearInterval(pollInterval)
                alert('Pembayaran terdeteksi! Akun Anda telah diaktifkan.')
                router.push('/dashboard')
            }
        } catch (e) {
            console.error('Polling error:', e)
        }
    }, 10000)
}

const goToFlip = () => {
    if (orderDetails.value?.paymentUrl) {
        window.open(orderDetails.value.paymentUrl, '_blank')
        currentStep.value = 2 // Move to waiting step
    }
}

// 3. Canvas Animation
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: any = null

const startCanvasAnimation = () => {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let angle = 0
    let pulses = [0, 0.5]

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const cx = canvas.width / 2
        const cy = canvas.height / 2

        pulses.forEach((p, i) => {
            pulses[i] += 0.003
            if (pulses[i] > 1) pulses[i] = 0
            ctx.beginPath()
            ctx.arc(cx, cy, 30 + pulses[i] * 35, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - pulses[i]) * 0.5})`
            ctx.lineWidth = 1.5
            ctx.stroke()
        })

        angle += 0.02
        const rx = cx + Math.cos(angle) * 30
        const ry = cy + Math.sin(angle) * 30
        ctx.beginPath()
        ctx.arc(rx, ry, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#D4AF37'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#D4AF37'
        ctx.fill()

        animationId = requestAnimationFrame(animate)
    }
    animate()
}

watch(currentStep, (newStep) => {
    if (newStep === 2) {
        nextTick(() => startCanvasAnimation())
    }
})

onMounted(() => {
    startPayment()
})

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
    if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
    <div class="min-h-screen bg-[#FDFCFB] py-12 px-6 font-sans">
        <div v-if="plan" class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Selesaikan Pembayaran</h1>
                <p class="text-stone-500 max-w-2xl mx-auto italic">
                    Aktivasi instan dan otomatis melalui Payment Gateway Flip.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm sticky top-8">
                        <div class="mb-6">
                            <span class="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Ringkasan Pesanan</span>
                            <h2 class="text-2xl font-serif font-bold text-stone-800 mt-2">Paket {{ plan.name }}</h2>
                        </div>
                        
                        <div class="space-y-1 mb-8 pb-8 border-b border-stone-100">
                            <div v-if="orderDetails" class="text-3xl font-serif font-bold text-stone-900">
                                Rp {{ orderDetails.totalAmount.toLocaleString('id-ID') }}
                            </div>
                            <div v-else class="h-10 w-32 bg-stone-100 animate-pulse rounded-lg"></div>
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li v-for="feat in plan.features" :key="feat" class="flex items-center gap-3 text-sm text-stone-600">
                                <i class="fas fa-check text-[#D4AF37] text-xs"></i>
                                {{ feat }}
                            </li>
                        </ul>

                        <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <p class="text-[11px] text-emerald-700 leading-relaxed font-bold flex items-start gap-2">
                                <i class="fas fa-bolt mt-0.5"></i>
                                <span>Verifikasi otomatis aktif. Akun Anda akan aktif langsung setelah pembayaran dikonfirmasi Flip.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <!-- Step 1: Redirect to Flip -->
                    <div v-if="currentStep === 1" class="bg-white rounded-4xl p-10 border border-stone-200 shadow-xl overflow-hidden relative">
                        <div class="absolute top-0 right-0 p-8 opacity-5">
                            <i class="fas fa-shield-halved text-9xl"></i>
                        </div>
                        
                        <div class="relative z-10 text-center flex flex-col items-center">
                            <div class="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6">
                                <i class="fas fa-credit-card text-[#D4AF37] text-3xl"></i>
                            </div>
                            
                            <h3 class="text-2xl font-serif font-bold text-stone-800 mb-4">Satu Langkah Lagi!</h3>
                            <p class="text-stone-500 mb-10 max-w-md">Klik tombol di bawah untuk melanjutkan pembayaran melalui berbagai metode (QRIS, Bank Transfer, E-Wallet) via Flip.</p>

                            <button 
                                v-if="orderDetails?.paymentUrl"
                                @click="goToFlip" 
                                class="w-full max-w-sm bg-stone-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-stone-800 transition-all transform hover:-translate-y-1 active:translate-y-0"
                            >
                                Bayar Sekarang
                            </button>
                            <div v-else class="w-full max-w-sm h-14 bg-stone-100 animate-pulse rounded-2xl"></div>

                            <div class="mt-12 flex items-center justify-center gap-8 opacity-40">
                                <i class="fab fa-cc-visa text-2xl"></i>
                                <i class="fab fa-cc-mastercard text-2xl"></i>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" class="h-4 grayscale" alt="QRIS" />
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Waiting -->
                    <div v-else class="bg-white rounded-4xl p-10 border border-stone-200 shadow-xl text-center">
                        <div class="mb-8">
                            <canvas ref="canvasRef" width="160" height="160" class="mx-auto"></canvas>
                        </div>
                        
                        <h3 class="text-2xl font-serif font-bold text-stone-800 mb-4">Menunggu Pembayaran</h3>
                        <p class="text-stone-500 mb-8 italic">Sistem sedang memantau pembayaran Anda secara real-time. Jangan tutup halaman ini sampai konfirmasi muncul.</p>

                        <div class="flex flex-col gap-4 max-w-xs mx-auto">
                            <button @click="goToFlip" class="text-stone-900 bg-stone-50 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition-all border border-stone-200">
                                Buka Kembali Halaman Flip
                            </button>
                            <NuxtLink to="/dashboard" class="text-stone-400 hover:text-stone-800 text-xs font-bold underline underline-offset-4 decoration-stone-200">
                                Cek Nanti ke Dashboard
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any custom animations or font imports if needed */
</style>
