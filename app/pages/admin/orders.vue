<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['admin']  // SECURITY: Added missing middleware
})

interface AdminOrder {
    id: string
    userId: string
    userName: string
    userEmail: string
    plan: string
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    proofUrl: string | null
    createdAt: string
}

const isLoading = ref(false)
const orders = ref<AdminOrder[]>([])
const confirmingRejectId = ref<string | null>(null)
const confirmingApproveId = ref<string | null>(null)
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
const actionFeedback = ref<Record<string, { text: string, type: 'success' | 'danger' }>>({})

useSeoMeta({
  title: 'Kelola Order - Admin Undangan',
  robots: 'noindex, nofollow'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

const setFeedback = (id: string, text: string, type: 'success' | 'danger') => {
    actionFeedback.value[id] = { text, type }
    setTimeout(() => { delete actionFeedback.value[id] }, 3000)
}

const fetchOrders = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<AdminOrder[]>('/api/admin/orders')
        orders.value = data
    } catch (e: any) {
        showToast('Gagal mengambil data order: ' + (e.message || 'Unknown error'), 'error')
    } finally {
        isLoading.value = false
    }
}

const doApproveOrder = async (orderId: string) => {
    confirmingApproveId.value = null
    isLoading.value = true
    try {
        await $fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' })
        setFeedback(orderId, 'DISETUJUI', 'success')
        showToast('✅ Order berhasil disetujui!')
        setTimeout(() => fetchOrders(), 2000)
    } catch (e: any) {
        showToast('❌ Gagal menyetujui: ' + (e.statusMessage || e.message), 'error')
    } finally {
        isLoading.value = false
    }
}

const doRejectOrder = async (orderId: string) => {
    confirmingRejectId.value = null
    isLoading.value = true
    try {
        await $fetch(`/api/admin/orders/${orderId}/reject`, { method: 'POST' })
        setFeedback(orderId, 'DITOLAK', 'danger')
        showToast('Order berhasil ditolak')
        setTimeout(() => fetchOrders(), 2000)
    } catch (e: any) {
        showToast('❌ Gagal menolak: ' + (e.statusMessage || e.message), 'error')
    } finally {
        isLoading.value = false
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'approved': return 'bg-green-100 text-green-800'
        case 'rejected': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => fetchOrders())
</script>

<template>
  <div class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6">
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Toast -->
      <Transition name="toast">
          <div v-if="toast.show" 
              class="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-medium max-w-md"
              :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
              {{ toast.message }}
          </div>
      </Transition>
      
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
            <h1 class="text-2xl font-serif font-bold text-stone-900">Kelola Order</h1>
            <p class="text-sm text-stone-500">Daftar pesanan paket undangan baru.</p>
        </div>
        <div class="flex gap-2">
            <button @click="fetchOrders" class="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200" :disabled="isLoading">
                <i class="fas fa-sync-alt" :class="{ 'animate-spin': isLoading }"></i>
            </button>
            <NuxtLink to="/admin" class="px-4 py-2 bg-stone-100 rounded-lg text-stone-600 font-bold text-sm hover:bg-stone-200 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i> Kembali
            </NuxtLink>
        </div>
      </div>

      <!-- List -->
      <div class="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
            <thead class="bg-stone-50 text-stone-500 text-sm uppercase tracking-wider">
                <tr>
                <th class="p-4 text-left font-bold">Tanggal</th>
                <th class="p-4 text-left font-bold">User</th>
                <th class="p-4 text-left font-bold">Plan</th>
                <th class="p-4 text-right font-bold">Jumlah</th>
                <th class="p-4 text-center font-bold">Status</th>
                <th class="p-4 text-center font-bold">Bukti</th>
                <th class="p-4 text-right font-bold">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-stone-50 transition-colors">
                    <td class="p-4 text-stone-600 text-sm">
                        {{ new Date(order.createdAt).toLocaleDateString('id-ID') }}
                        <div class="text-xs text-stone-400">{{ new Date(order.createdAt).toLocaleTimeString('id-ID') }}</div>
                    </td>
                    <td class="p-4">
                        <div class="font-bold text-stone-900">{{ order.userName }}</div>
                        <div class="text-xs text-stone-500">{{ order.userEmail }}</div>
                    </td>
                    <td class="p-4">
                        <span class="capitalize font-medium px-2 py-1 rounded bg-stone-100 text-stone-600 text-xs">{{ order.plan }}</span>
                    </td>
                    <td class="p-4 text-right font-mono font-bold text-stone-900">
                        {{ formatCurrency(order.amount) }}
                    </td>
                    <td class="p-4 text-center">
                        <span :class="['px-2 py-1 rounded-full text-xs font-bold uppercase', getStatusColor(order.status)]">
                            {{ order.status }}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <a v-if="order.proofUrl" :href="order.proofUrl" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm hover:underline">
                            <i class="fas fa-external-link-alt mr-1"></i> Lihat
                        </a>
                        <span v-else class="text-stone-300">-</span>
                    </td>
                    <td class="p-4 text-right">
                        <div v-if="actionFeedback[order.id]" 
                             :class="[
                                'px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-2 justify-center transition-all duration-300',
                                actionFeedback[order.id]?.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                             ]">
                             <i :class="['fas', actionFeedback[order.id]?.type === 'success' ? 'fa-check' : 'fa-trash-alt']"></i>
                             {{ actionFeedback[order.id]?.text }}
                        </div>
                        <div class="flex justify-end gap-2" v-else-if="order.status === 'pending'">
                            <!-- Normal Mode -->
                            <template v-if="confirmingRejectId !== order.id && confirmingApproveId !== order.id">
                                <button @click="confirmingApproveId = order.id" :disabled="isLoading" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50" title="Approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button @click="confirmingRejectId = order.id" :disabled="isLoading" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50" title="Reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </template>
                            
                            <!-- Inline Reject Mode -->
                            <template v-else-if="confirmingRejectId === order.id">
                                <span class="text-[10px] font-bold text-red-600 self-center mr-1 uppercase tracking-wide">Tolak?</span>
                                <button @click="doRejectOrder(order.id)" :disabled="isLoading" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                                    Ya
                                </button>
                                <button @click="confirmingRejectId = null" class="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-300 transition-colors shadow-sm">
                                    Batal
                                </button>
                            </template>

                            <!-- Inline Approve Mode -->
                            <template v-else-if="confirmingApproveId === order.id">
                                <span class="text-[10px] font-bold text-green-600 self-center mr-1 uppercase tracking-wide">Setuju?</span>
                                <button @click="doApproveOrder(order.id)" :disabled="isLoading" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50">
                                    Ya
                                </button>
                                <button @click="confirmingApproveId = null" class="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-300 transition-colors shadow-sm">
                                    Batal
                                </button>
                            </template>
                        </div>
                        <span v-else class="text-xs text-stone-400 italic">Selesai</span>
                    </td>
                </tr>
                <tr v-if="orders.length === 0">
                    <td colspan="7" class="p-10 text-center text-stone-400 italic">
                        <i class="fas fa-check-circle text-4xl mb-3 block text-green-200"></i>
                        Belum ada order masuk.
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
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(100px);
}
</style>
