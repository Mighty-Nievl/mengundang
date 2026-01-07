<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const isLoading = ref(false)
const orders = ref<any[]>([])
const processMsg = ref('')
const confirmingRejectId = ref<string | null>(null)

const { showConfirm, showAlert } = usePremiumModal()

useSeoMeta({
  title: 'Kelola Order - Admin Undangan',
  robots: 'noindex, nofollow'
})

const fetchOrders = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<any[]>('/api/admin/orders')
        orders.value = data
    } catch (e) {
        showAlert({ title: 'Error', message: 'Gagal mengambil data order', type: 'danger' })
    } finally {
        isLoading.value = false
    }
}


const showInlineSuccess = (msg: string) => {
    processMsg.value = msg
    setTimeout(() => { processMsg.value = '' }, 3000)
}

const approveOrder = async (orderId: string) => {
    const confirmed = await showConfirm({
        title: 'Setujui Order',
        message: 'Yakin ingin menyetujui order ini? User akan mendapat notifikasi.',
        type: 'success',
        confirmText: 'Ya, Setujui',
        cancelText: 'Batal'
    })
    
    if (!confirmed) return

    isLoading.value = true
    try {
        await $fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' })
        showInlineSuccess('Order berhasil disetujui!')
        fetchOrders()
    } catch (e: any) {
        showAlert({ title: 'Gagal', message: 'Gagal menyetujui: ' + (e.statusMessage || e.message), type: 'danger' })
    } finally {
        isLoading.value = false
    }
}

const doRejectOrder = async (orderId: string) => {
    // Confirmation is handled inline
    confirmingRejectId.value = null // Close inline confirm

    isLoading.value = true
    try {
        await $fetch(`/api/admin/orders/${orderId}/reject`, { method: 'POST' })
        showInlineSuccess('Order berhasil ditolak.')
        fetchOrders()
    } catch (e: any) {
        showAlert({ title: 'Gagal', message: 'Gagal menolak: ' + (e.statusMessage || e.message), type: 'danger' })
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

onMounted(() => {
    fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6">
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
            <h1 class="text-2xl font-serif font-bold text-stone-900">Kelola Order</h1>
            <p class="text-sm text-stone-500">Daftar pesanan paket undangan baru.</p>
        </div>
        <NuxtLink to="/admin" class="px-4 py-2 bg-stone-100 rounded-lg text-stone-600 font-bold text-sm hover:bg-stone-200 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i> Kembali
        </NuxtLink>
      </div>

      <div v-if="processMsg" class="p-4 bg-green-100 text-green-700 rounded-xl font-bold text-center animate-bounce">
          {{ processMsg }}
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
                        {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.amount) }}
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
                        <div class="flex justify-end gap-2" v-if="order.status === 'pending'">
                            <!-- Normal Mode -->
                            <template v-if="confirmingRejectId !== order.id">
                                <button @click="approveOrder(order.id)" :disabled="isLoading" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50" title="Approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button @click="confirmingRejectId = order.id" :disabled="isLoading" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50" title="Reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </template>
                            
                            <!-- Inline Verification Mode -->
                            <template v-else>
                                <span class="text-[10px] font-bold text-red-600 self-center mr-1 uppercase tracking-wide">Tolak?</span>
                                <button @click="doRejectOrder(order.id)" :disabled="isLoading" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                                    Ya
                                </button>
                                <button @click="confirmingRejectId = null" class="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-300 transition-colors shadow-sm">
                                    Batal
                                </button>
                            </template>
                        </div>
                        <span v-else class="text-xs text-stone-400 italic">Selesai</span>
                    </td>
                </tr>
                <tr v-if="orders.length === 0">
                    <td colspan="7" class="p-10 text-center text-stone-400 italic">
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
