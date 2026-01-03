<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const isAuthorized = ref(false)
const currentUser = ref<any>(null)
const orders = ref<any[]>([])
const users = ref<any[]>([])
const activeTab = ref<'orders' | 'users'>('orders')
const isLoading = ref(false)
const searchQuery = ref('')
const msg = ref('')

import { useAuthClient } from '../../utils/auth-client'

useSeoMeta({
  title: 'Manajemen User - Admin Undangan',
  robots: 'noindex, nofollow'
})

onMounted(async () => {
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    currentUser.value = data?.user
    isAuthorized.value = !!data?.user
    fetchData()
})

const fetchData = async () => {
    isLoading.value = true
    try {
        // Fetch pending orders
        orders.value = await $fetch('/api/admin/orders')
        users.value = await $fetch('/api/users') as any[]
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

const handleOrder = async (id: string, action: 'approve' | 'reject') => {
    const actionText = action === 'approve' ? 'menyetujui' : 'menolak'
    if (!confirm(`Yakin ingin ${actionText} order ini?`)) return
    
    try {
        await $fetch(`/api/admin/orders/${id}/${action}`, { method: 'POST' })
        fetchData() // Refresh list
        alert(`Order berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}`)
    } catch (e: any) {
        alert(e.statusMessage || 'Gagal memproses order')
    }
}

const savePlan = async (user: any) => {
    isLoading.value = true
    // Determine maxInvitations based on plan
    let maxInvitations = 1
    if (user.plan === 'regular') maxInvitations = 3
    else if (user.plan === 'vip') maxInvitations = 10
    else if (user.plan === 'vvip') maxInvitations = 9999

    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: {
                action: 'edit',
                email: user.email,
                plan: user.plan,
                maxInvitations
            }
        })
        user.success = true
        setTimeout(() => user.success = false, 2000)
        fetchData()
    } catch(e: any) {
        alert(e.statusMessage || 'Gagal menyimpan')
    } finally { isLoading.value = false }
}

const deleteUser = async (email: string) => {
    if(!confirm('Hapus user ini?')) return
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: { action: 'delete', email }
        })
        fetchData()
    } catch (e) { alert('Gagal hapus') }
}

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const q = searchQuery.value.toLowerCase()
    return users.value.filter(u => 
        (u.name?.toLowerCase().includes(q)) || 
        (u.email?.toLowerCase().includes(q))
    )
})
</script>

<template>
    <div v-if="isAuthorized" class="min-h-screen bg-stone-50 text-stone-800 p-6 font-sans">
        <div class="max-w-6xl mx-auto">
            <header class="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div>
                    <h1 class="text-3xl font-bold text-stone-900">Manajemen Pengguna & Order</h1>
                    <p class="text-stone-500 mt-1">Verifikasi pembayaran dan kelola paket pengguna.</p>
                </div>
                <div class="flex gap-4 mt-4 md:mt-0">
                    <NuxtLink to="/admin" class="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors">
                        &larr; Kembali
                    </NuxtLink>
                    <button @click="fetchData" class="bg-stone-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-900 transition-all">
                        <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': isLoading }"></i> Refresh
                    </button>
                </div>
            </header>

            <!-- Tabs -->
            <div class="flex gap-4 mb-8 border-b border-stone-200 pb-1 overflow-x-auto">
                <button @click="activeTab = 'orders'" :class="[activeTab === 'orders' ? 'border-b-4 border-gold-500 text-stone-900 bg-stone-50' : 'text-stone-400 hover:text-stone-600', 'px-6 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap']">
                    <i class="fas fa-shopping-cart"></i> Order Pending
                    <span v-if="orders.length > 0" class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{{ orders.length }}</span>
                </button>
                <button @click="activeTab = 'users'" :class="[activeTab === 'users' ? 'border-b-4 border-gold-500 text-stone-900 bg-stone-50' : 'text-stone-400 hover:text-stone-600', 'px-6 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap']">
                    <i class="fas fa-users"></i> Semua Pengguna
                </button>
            </div>

            <!-- Orders Table -->
            <div v-if="activeTab === 'orders'" class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-fade">
                <div v-if="orders.length === 0" class="p-12 text-center text-stone-400">
                    <i class="fas fa-check-circle text-4xl mb-4 text-green-200"></i>
                    <p>Tidak ada order yang menunggu verifikasi.</p>
                </div>
                
                <table v-else class="w-full">
                    <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th class="p-6 text-left">User</th>
                            <th class="p-6 text-left">Paket & Harga</th>
                            <th class="p-6 text-left">Bukti Bayar</th>
                            <th class="p-6 text-left">Tanggal</th>
                            <th class="p-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                        <tr v-for="order in orders" :key="order.id" class="hover:bg-stone-50 transition-colors">
                            <td class="p-6">
                                <div class="font-bold text-stone-900">{{ order.userName }}</div>
                                <div class="text-xs text-stone-500">{{ order.userEmail }}</div>
                            </td>
                            <td class="p-6">
                                <span class="bg-stone-900 text-white px-2 py-1 rounded text-xs font-bold uppercase">{{ order.plan }}</span>
                                <div class="mt-1 font-serif font-bold text-stone-600">Rp {{ order.amount.toLocaleString('id-ID') }}</div>
                            </td>
                            <td class="p-6">
                                <a :href="order.proofUrl" target="_blank" class="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                                    <i class="fas fa-image"></i> Lihat Bukti
                                </a>
                            </td>
                            <td class="p-6 text-sm text-stone-500">
                                {{ new Date(order.createdAt).toLocaleDateString('id-ID') }}
                            </td>
                            <td class="p-6 text-right space-x-2">
                                <button @click="handleOrder(order.id, 'reject')" class="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-xs transition-colors">
                                    Tolak
                                </button>
                                <button @click="handleOrder(order.id, 'approve')" class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-500/20">
                                    Setujui
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Users Table -->
            <div v-if="activeTab === 'users'" class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-fade">
                 <div class="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 class="font-bold text-lg">Daftar Pengguna</h2>
                    <div class="relative w-full md:w-64">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari user..." 
                            class="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-gold-500 bg-stone-50"
                        />
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th class="p-4">Nama & Email</th>
                                <th class="p-4">Plan (Manual Edit)</th>
                                <th class="p-4">Usage</th>
                                <th class="p-4">Role</th>
                                <th class="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                         <tbody class="divide-y divide-stone-100">
                            <tr v-for="user in filteredUsers" :key="user.email" class="hover:bg-stone-50">
                                <td class="p-4">
                                    <div class="font-bold text-stone-900">{{ user.name }}</div>
                                    <div class="text-xs text-stone-500">{{ user.email }}</div>
                                </td>
                                <td class="p-4">
                                    <div class="relative flex items-center w-fit">
                                        <select v-model="user.plan" @change="savePlan(user)" 
                                            :disabled="currentUser?.role !== 'admin'"
                                            class="text-xs font-bold px-2 py-1 rounded bg-stone-50 border border-stone-200 outline-none focus:border-gold-500 transition-all uppercase pr-8 disabled:opacity-70 disabled:cursor-not-allowed"
                                            :class="{'text-green-700': user.plan==='free', 'text-gold-700': user.plan!=='free'}">
                                            <option value="free">FREE</option>
                                            <option value="regular">REGULAR</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP</option>
                                        </select>
                                        <Transition name="fade-up">
                                            <div v-if="user.success" class="absolute -right-6 text-green-500 text-sm">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                        </Transition>
                                    </div>
                                </td>
                                <td class="p-4 text-stone-500">{{ user.usage || 0 }} / {{ user.maxInvitations || 1 }}</td>
                                <td class="p-4 uppercase text-xs font-bold text-stone-400">{{ user.role }}</td>
                                <td class="p-4 text-right">
                                    <button v-if="user.role !== 'admin' && currentUser?.role === 'admin'" @click="deleteUser(user.email)" class="text-red-400 hover:text-red-600">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                         </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.animate-fade { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.5s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
