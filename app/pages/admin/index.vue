<script setup lang="ts">
// Admin Panel - Command Center
definePageMeta({
    layout: 'default',
    middleware: ['admin']
})

const isAuthorized = ref(false)
const currentUser = ref<any>(null)
const stats = ref<any>(null)
const isLoadingStats = ref(true)
const telegramLoading = ref(false)

import { useAuthClient } from '../../utils/auth-client'

useSeoMeta({
  title: 'Admin Panel - Undangan Premium',
  robots: 'noindex, nofollow'
})

onMounted(async () => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    currentUser.value = data?.user
    isAuthorized.value = !!data?.user
    fetchStats()
    fetchSettings()
})

const fetchStats = async () => {
    try {
        stats.value = await $fetch('/api/admin/stats')
    } catch (e) {
        console.error('Failed to fetch stats', e)
    } finally {
        isLoadingStats.value = false
    }
}

const testTelegram = async () => {
    telegramLoading.value = true
    try {
        await $fetch('/api/admin/telegram/test', { method: 'POST' })
        alert('✅ Pesan test terkirim ke Telegram!')
    } catch (e: any) {
        alert('❌ Gagal: ' + (e.statusMessage || e.message))
    } finally {
        telegramLoading.value = false
    }
}

const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
const upgradeEnabled = ref(true) // Default true
const toggleLoading = ref(false)

const fetchSettings = async () => {
    try {
        const settings = await $fetch<Record<string, string>>('/api/admin/settings')
        // If key doesn't exist yet, default to 'true'
        upgradeEnabled.value = settings.upgrade_enabled !== 'false'
    } catch (e) {
        console.error('Failed to fetch settings', e)
    }
}

const toggleUpgrade = async () => {
    toggleLoading.value = true
    try {
        const newValue = !upgradeEnabled.value
        await $fetch('/api/admin/settings', {
            method: 'POST',
            body: { key: 'upgrade_enabled', value: String(newValue) }
        })
        upgradeEnabled.value = newValue
        alert(`✅ Fitur Upgrade berhasil ${newValue ? 'DIAKTIFKAN' : 'DIMATIKAN'}`)
    } catch (e: any) {
        alert('❌ Gagal: ' + (e.statusMessage || e.message))
    } finally {
        toggleLoading.value = false
    }
}
</script>

<template>
    <div v-if="isAuthorized" class="min-h-screen bg-stone-50 text-stone-800 p-6 md:p-8 font-sans">
        <div class="max-w-7xl mx-auto space-y-8">
            
            <!-- Header -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                <div>
                    <div class="text-xs font-bold text-gold-600 uppercase tracking-widest mb-1">{{ formatDate() }}</div>
                    <h1 class="text-3xl font-serif font-bold text-stone-900">
                        Hello, {{ currentUser?.name?.split(' ')[0] }}! 👋
                    </h1>
                    <p class="text-stone-500">Welcome back to your Command Center.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="fetchStats" class="p-3 rounded-full hover:bg-stone-100 text-stone-400 transition-colors" title="Refresh Stats">
                        <i class="fas fa-sync-alt" :class="{ 'animate-spin': isLoadingStats }"></i>
                    </button>
                    <NuxtLink to="/dashboard" class="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20">
                        Exit to App <i class="fas fa-external-link-alt ml-2"></i>
                    </NuxtLink>
                </div>
            </header>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Revenue -->
                <div class="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="absolute right-[-20px] top-[-20px] text-green-50 text-9xl font-bold font-serif opacity-50 select-none group-hover:scale-110 transition-transform">Rp</div>
                    <div>
                        <div class="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</div>
                        <div class="text-3xl font-bold text-stone-900">
                            {{ stats ? formatCurrency(stats.totalRevenue) : '...' }}
                        </div>
                    </div>
                </div>

                <!-- Users -->
                <div class="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32">
                    <div>
                        <div class="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</div>
                        <div class="text-3xl font-bold text-stone-900">{{ stats?.totalUsers || 0 }}</div>
                    </div>
                    <div class="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-blue-500 h-full rounded-full" style="width: 70%"></div>
                    </div>
                </div>

                <!-- Active Orders -->
                <div class="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32">
                    <div>
                        <div class="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Orders</div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl font-bold text-stone-900">{{ stats?.pendingOrders || 0 }}</span>
                            <span v-if="stats?.pendingOrders > 0" class="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-bold animate-pulse">Action</span>
                        </div>
                    </div>
                </div>

                <!-- Pending Payouts -->
                <div class="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between h-32">
                    <div>
                        <div class="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Payout Requests</div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl font-bold text-stone-900">{{ stats?.pendingPayouts?.count || 0 }}</span>
                            <span v-if="stats?.pendingPayouts?.amount > 0" class="text-xs font-mono text-stone-400">
                                ({{ formatCurrency(stats?.pendingPayouts?.amount) }})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Grid (Main Menu) -->
            <h2 class="text-xl font-bold text-stone-900 ml-2">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- 1. Verify Orders -->
                <NuxtLink to="/admin/orders" class="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden">
                    <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-1">Verify Orders</h3>
                    <p class="text-sm text-stone-500">Check payment proofs & activate plans.</p>
                    <div v-if="stats?.pendingOrders > 0" class="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-lg animate-bounce">
                        {{ stats.pendingOrders }}
                    </div>
                </NuxtLink>

                <!-- NEW: Upgrade Feature Toggle -->
                <button @click="toggleUpgrade" :disabled="toggleLoading" class="group text-left bg-white p-6 rounded-2xl border transition-all relative overflow-hidden" :class="upgradeEnabled ? 'border-green-200 hover:border-green-400' : 'border-red-200 hover:border-red-400 bg-red-50'">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors" :class="upgradeEnabled ? 'bg-green-50 text-green-600' : 'bg-red-100 text-red-600'">
                        <i class="fas" :class="upgradeEnabled ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-1">
                        Upgrade Feature: {{ upgradeEnabled ? 'ON' : 'OFF' }}
                    </h3>
                    <p class="text-sm text-stone-500">
                        {{ upgradeEnabled ? 'Users can buy Premium Plans.' : 'Maintenance Mode. Upgrades disabled.' }}
                    </p>
                    <div v-if="toggleLoading" class="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <i class="fas fa-spinner fa-spin text-stone-600 text-2xl"></i>
                    </div>
                </button>

                <!-- 2. Process Payouts -->
                <NuxtLink to="/admin/payouts" class="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all relative">
                    <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-1">Process Payouts</h3>
                    <p class="text-sm text-stone-500">Transfer referral bonuses & clear queue.</p>
                    <div v-if="stats?.pendingPayouts?.count > 0" class="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-lg animate-bounce">
                        {{ stats.pendingPayouts.count }}
                    </div>
                </NuxtLink>

                <!-- 3. User Management -->
                <NuxtLink to="/admin/users" class="group bg-white p-6 rounded-2xl border border-stone-200 hover:border-gold-400 hover:shadow-md transition-all">
                    <div class="w-12 h-12 bg-gold-50 text-gold-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-1">Manage Users</h3>
                    <p class="text-sm text-stone-500">See all registered users and their status.</p>
                </NuxtLink>

                <!-- 4. Telegram Bot Test -->
                <button @click="testTelegram" :disabled="telegramLoading" class="group text-left bg-white p-6 rounded-2xl border border-stone-200 hover:border-sky-400 hover:shadow-md transition-all relative">
                    <div class="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                        <i class="fab fa-telegram-plane"></i>
                    </div>
                    <h3 class="font-bold text-lg text-stone-900 mb-1">Test Bot Signal</h3>
                    <p class="text-sm text-stone-500">Send a test message to your Telegram.</p>
                    <div v-if="telegramLoading" class="absolute top-4 right-4">
                        <i class="fas fa-spinner fa-spin text-sky-600"></i>
                    </div>
                </button>

                <!-- 5. View Live Site -->
                <a href="/" target="_blank" class="group bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-900/20 transition-all">
                    <div class="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-stone-700 transition-colors">
                        <i class="fas fa-globe"></i>
                    </div>
                    <h3 class="font-bold text-lg mb-1">View Live Site</h3>
                    <p class="text-sm text-stone-400">Check how the landing page looks.</p>
                </a>

            </div>
            
            <div class="text-center text-xs text-stone-300 mt-12">
                Premium Invitation Admin v1.0 • <span v-if="stats">{{ stats.totalUsers }} Users Strong</span>
            </div>

        </div>
    </div>
</template>
