<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['admin']
})

interface PayoutUser {
    id: string
    name: string
    email: string
    referralBalance: number
}

const isLoading = ref(false)
const users = ref<PayoutUser[]>([])
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
const confirmingId = ref<string | null>(null)

useSeoMeta({
  title: 'Kelola Payout - Admin Undangan',
  robots: 'noindex, nofollow'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const fetchPayouts = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<PayoutUser[]>('/api/admin/payouts')
        users.value = data
    } catch (e: any) {
        showToast('Gagal mengambil data payout: ' + (e.message || 'Unknown error'), 'error')
    } finally {
        isLoading.value = false
    }
}

const processPayout = async (user: PayoutUser) => {
    confirmingId.value = null
    isLoading.value = true
    try {
        await $fetch('/api/admin/payouts/process', {
            method: 'POST',
            body: {
                userId: user.id,
                amount: user.referralBalance
            }
        })
        showToast(`✅ Berhasil memproses payout untuk ${user.name}!`)
        fetchPayouts()
    } catch (e: any) {
        showToast('❌ Gagal memproses: ' + (e.statusMessage || e.message), 'error')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => fetchPayouts())
</script>

<template>
  <div class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6">
    <div class="max-w-5xl mx-auto space-y-8">
      
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
            <h1 class="text-2xl font-serif font-bold text-stone-900">Kelola Payout Referral</h1>
            <p class="text-sm text-stone-500">Daftar user yang memiliki saldo referral mengendap.</p>
        </div>
        <div class="flex gap-2">
            <button @click="fetchPayouts" class="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200" :disabled="isLoading">
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
                <th class="p-4 text-left font-bold">User</th>
                <th class="p-4 text-left font-bold">Email</th>
                <th class="p-4 text-right font-bold">Saldo Referral</th>
                <th class="p-4 text-right font-bold">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
                <tr v-for="user in users" :key="user.id" class="hover:bg-stone-50 transition-colors">
                <td class="p-4 font-bold text-stone-800">{{ user.name }}</td>
                <td class="p-4 text-stone-600">{{ user.email }}</td>
                <td class="p-4 text-right font-mono font-bold text-green-600">
                    {{ formatCurrency(user.referralBalance) }}
                </td>
                <td class="p-4 text-right">
                    <!-- Normal Mode -->
                    <template v-if="confirmingId !== user.id">
                        <button @click="confirmingId = user.id" :disabled="isLoading" class="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
                            <i class="fas fa-check-circle mr-1"></i> Mark as Paid
                        </button>
                    </template>
                    <!-- Confirm Mode -->
                    <template v-else>
                        <div class="flex items-center justify-end gap-2">
                            <span class="text-[10px] font-bold text-amber-600 uppercase">Konfirmasi?</span>
                            <button @click="processPayout(user)" :disabled="isLoading" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50">
                                <i class="fas fa-check mr-1"></i> Ya
                            </button>
                            <button @click="confirmingId = null" class="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-300 transition-colors shadow-sm">
                                Batal
                            </button>
                        </div>
                    </template>
                </td>
                </tr>
                <tr v-if="users.length === 0">
                    <td colspan="4" class="p-10 text-center text-stone-400 italic">
                        <i class="fas fa-check-circle text-4xl mb-3 block text-green-200"></i>
                        Tidak ada user dengan saldo pending.
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
      </div>
      
      <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
          <p><strong>Cara Kerja:</strong> Transfer manual dulu ke rekening user (cek via WA), lalu klik tombol "Mark as Paid" di sini untuk memotong saldo mereka di sistem.</p>
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
