<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default' // or admin layout if separate
})

const isLoading = ref(false)
const users = ref<any[]>([])
const processMsg = ref('')

useSeoMeta({
  title: 'Kelola Payout - Admin Undangan',
  robots: 'noindex, nofollow'
})

const fetchPayouts = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<any[]>('/api/admin/payouts')
        users.value = data
    } catch (e) {
        alert('Gagal mengambil data payout')
    } finally {
        isLoading.value = false
    }
}

const processPayout = async (user: any) => {
    const amount = user.referralBalance
    const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
    
    if (!confirm(`Yakin sudah transfer manual sebesar ${formatted} ke ${user.name}?\n\nSaldo di sistem akan dipotong setelah ini.`)) return

    isLoading.value = true
    try {
        await $fetch('/api/admin/payouts/process', {
            method: 'POST',
            body: {
                userId: user.id,
                amount: amount
            }
        })
        processMsg.value = `Berhasil memproses payout untuk ${user.name}!`
        setTimeout(() => processMsg.value = '', 3000)
        fetchPayouts() // Refresh list
    } catch (e: any) {
        alert('Gagal memproses: ' + (e.statusMessage || e.message))
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchPayouts()
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6">
    <div class="max-w-5xl mx-auto space-y-8">
      
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
            <h1 class="text-2xl font-serif font-bold text-stone-900">Kelola Payout Referral</h1>
            <p class="text-sm text-stone-500">Daftar user yang memiliki saldo referral mengendap.</p>
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
                    {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.referralBalance) }}
                </td>
                <td class="p-4 text-right">
                    <button @click="processPayout(user)" :disabled="isLoading" class="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-600 transition-colors shadow-sm disabled:opacity-50">
                        <i class="fas fa-check-circle mr-1"></i> Mark as Paid
                    </button>
                </td>
                </tr>
                <tr v-if="users.length === 0">
                    <td colspan="4" class="p-10 text-center text-stone-400 italic">
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
