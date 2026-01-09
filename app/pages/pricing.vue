<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const referralCode = useCookie('referral_code')
const hasReferral = computed(() => !!referralCode.value)

const plans = computed(() => [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Ada Watermark', 'Limit 25 Tamu', 'Limit 1 Undangan', 'Masa Aktif 1 Bulan'],
        color: 'bg-white border-stone-200',
        btnColor: 'bg-stone-200 text-stone-600',
        btnText: 'Paket Saat Ini'
    },
    {
        id: 'regular',
        name: 'Regular',
        price: 49000,
        features: ['Tanpa Watermark', 'Limit 50 Tamu', 'Hingga 5 Undangan', 'Masa Aktif 3 Bulan'],
        color: 'bg-stone-50 border-stone-200',
        btnColor: 'bg-stone-800 text-white',
        btnText: 'Pilih Paket'
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 99000,
        features: ['Unlimited Tamu', 'Sistem RSVP & Ucapan', 'Hingga 20 Undangan', 'Tema Premium', 'Masa Aktif 6 Bulan'],
        color: 'bg-gold-50 border-gold-200 ring-2 ring-gold-200',
        btnColor: 'bg-gold-500 text-stone-900',
        isPopular: true,
        btnText: 'Pilih Paket'
    },
    {
        id: 'vvip',
        name: 'VVIP',
        price: 149000,
        features: ['Semua Fitur VIP', 'Custom Domain', 'Undangan Tanpa Batas', 'Masa Aktif Selamanya', 'Prioritas Support'],
        color: 'bg-stone-900 border-stone-800 text-white',
        btnColor: 'bg-white text-stone-900',
        btnText: 'Pilih Paket'
    }
])

const selectPlan = (planId: string) => {
    if (planId === 'free') return
    router.push(`/payment/${planId}`)
}

const formatPrice = (p: number) => new Intl.NumberFormat('id-ID').format(p)

const getDiscount = (planId: string) => {
    if (planId === 'regular') return 5000
    if (planId === 'vip') return 10000
    if (planId === 'vvip') return 15000
    return 0
}

useSeoMeta({
  title: 'Harga Paket Undangan - Undangan Premium',
  description: 'Pilih paket undangan digital sesuai kebutuhan. Mulai dari gratis hingga VVIP dengan fitur lengkap.',
  ogTitle: 'Harga Paket Undangan Digital Premium',
  ogDescription: 'Undangan pernikahan digital dengan harga terjangkau. Free, Regular, VIP, atau VVIP.'
})

const upgradeEnabled = ref(true)

onMounted(async () => {
    try {
        const settings = await $fetch<Record<string, string>>('/api/public/settings')
        upgradeEnabled.value = settings.upgrade_enabled !== 'false'
    } catch (e) {
        console.error('Failed to fetch settings', e)
    }
})
</script>

<template>
    <div class="min-h-screen bg-stone-50 py-12 px-6">
        <div class="max-w-7xl mx-auto text-center space-y-4 mb-12">
            <h1 class="text-3xl lg:text-4xl font-serif font-bold text-stone-800">Pilih Paket Undangan Anda</h1>
            <p class="text-stone-500">Upgrade akun Anda untuk menikmati fitur premium dan undangan tanpa batas.</p>
            
            <!-- Referral Banner -->
             <Transition name="fade">
                <div v-if="hasReferral" class="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl shadow-sm">
                    <div class="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center animate-bounce">
                        <i class="fas fa-gift"></i>
                    </div>
                    <div class="text-left">
                        <div class="text-sm font-bold text-emerald-800">Referral Aktif! 🎁</div>
                        <div class="text-[10px] text-emerald-600 font-medium">Anda mendapatkan potongan harga khusus untuk semua paket Premium.</div>
                    </div>
                </div>
             </Transition>
        </div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="plan in plans" :key="plan.id" :class="[plan.color, 'p-6 rounded-2xl border flex flex-col relative transition-transform hover:-translate-y-2']">
                <div v-if="plan.isPopular" class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">Paling Laris</div>
                
                <h3 class="text-lg font-bold uppercase tracking-widest mb-2">{{ plan.name }}</h3>
                
                <div class="mb-6">
                    <div v-if="hasReferral && plan.price > 0" class="flex flex-col">
                        <span class="text-xs text-stone-400 line-through">Rp {{ formatPrice(plan.price) }}</span>
                        <div class="text-2xl font-serif font-bold text-emerald-600">Rp {{ formatPrice(plan.price - getDiscount(plan.id)) }}</div>
                    </div>
                    <div v-else class="text-2xl font-serif font-bold text-stone-900">Rp {{ formatPrice(plan.price) }}</div>
                </div>
                
                <ul class="space-y-3 mb-8 flex-1 text-left">
                    <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-[13px] opacity-90">
                        <i class="fas fa-check-circle text-gold-500 mt-1"></i> {{ feature }}
                    </li>
                </ul>

                <button 
                    @click="selectPlan(plan.id)" 
                    :disabled="plan.id !== 'free' && !upgradeEnabled"
                    :class="[
                        plan.id !== 'free' && !upgradeEnabled 
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                            : plan.btnColor, 
                        'w-full py-3 rounded-xl font-bold transition-all shadow hover:opacity-90 text-sm'
                    ]"
                >
                    {{ plan.id !== 'free' && !upgradeEnabled ? 'Maintenance' : plan.btnText }}
                </button>
            </div>
        </div>
        
        <div class="mt-12 text-center">
            <NuxtLink to="/dashboard" class="text-stone-500 hover:text-stone-800 text-sm font-bold">Kembali ke Dashboard</NuxtLink>
        </div>
    </div>
</template>
