<script setup lang="ts">
import { useAuthClient } from '../utils/auth-client'

const isAuthenticated = ref(false)
const currentUser = ref<any>(null)
const referralData = ref<any>(null)
const isPayoutLoading = ref(false)
const host = ref('')

// UI States
const showPayoutModal = ref(false)
const copyFeedback = ref(false)
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Payout Form
const payoutForm = reactive({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    phoneNumber: '',
    agreement: false
})

definePageMeta({
  middleware: ['auth']
})

useSeoMeta({
  title: 'Program Referral - Undangan Premium',
  description: 'Dapatkan komisi Rp5.000-15.000 per undangan. Ajak teman, dapatkan cuan!',
  robots: 'noindex, nofollow'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

onMounted(async () => {
    host.value = window.location.host
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    if (data?.user) {
        isAuthenticated.value = true
        currentUser.value = data.user
        await fetchReferral()
    }
})

const fetchReferral = async () => {
    try {
        const data = await $fetch('/api/user/referral')
        referralData.value = data
        
        // Pre-fill form if data exists
        if (data) {
            payoutForm.bankName = (data as any).bankName || ''
            payoutForm.bankAccountNumber = (data as any).bankAccountNumber || ''
            payoutForm.bankAccountName = (data as any).bankAccountName || ''
            payoutForm.phoneNumber = (data as any).phoneNumber || ''
        }
    } catch (e) {}
}

const openPayoutModal = () => {
    showPayoutModal.value = true
}

const closePayoutModal = () => {
    showPayoutModal.value = false
    payoutForm.agreement = false
}

const submitPayout = async () => {
    if (!payoutForm.agreement) {
        showToast('Mohon setujui Syarat & Ketentuan pencairan dana.', 'error')
        return
    }

    if (!payoutForm.bankName || !payoutForm.bankAccountNumber || !payoutForm.bankAccountName || !payoutForm.phoneNumber) {
        showToast('Mohon lengkapi semua data pembayaran.', 'error')
        return
    }

    isPayoutLoading.value = true
    try {
        await $fetch('/api/user/payout/request', { 
            method: 'POST',
            body: { 
                bankName: payoutForm.bankName,
                bankAccountNumber: payoutForm.bankAccountNumber,
                bankAccountName: payoutForm.bankAccountName,
                phoneNumber: payoutForm.phoneNumber
            }
        })
        
        closePayoutModal()
        await fetchReferral() 
        showToast('✅ Permintaan terkirim! Admin akan segera memproses dalam 1x24 jam.')
        
    } catch (e: any) {
        showToast('❌ ' + (e.data?.statusMessage || e.message), 'error')
    } finally {
        isPayoutLoading.value = false
    }
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    copyFeedback.value = true
    setTimeout(() => {
        copyFeedback.value = false
    }, 2000)
}

const shareViaWhatsapp = () => {
    if (!referralData.value) return
    const text = `Eh, ada diskon spesial buat undangan digital di Undangan! 🤩\n\nDesainnya premium banget, fitur lengkap (RSVP, QR Code, Amplop Digital). \n\nCek disini, lumayan diskonnya pake kode ku: *${host.value}/s/${referralData.value.referralCode}*`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
}

// Progress Calculation
const payoutProgress = computed(() => {
    if (!referralData.value) return 0
    const progress = (referralData.value.balance / 30000) * 100
    return Math.min(progress, 100)
})
</script>

<template>
  <div v-if="isAuthenticated" class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6 pb-20">
    <div class="max-w-5xl mx-auto space-y-8">
      
      <!-- Toast Notification -->
      <Transition name="toast">
          <div v-if="toast.show" 
              class="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-medium max-w-md"
              :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
              {{ toast.message }}
          </div>
      </Transition>
      
      <!-- Header -->
      <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard" class="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white transition-all group">
              <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          </NuxtLink>
          <div>
              <h1 class="text-3xl font-serif font-bold text-stone-900">Program Referral</h1>
              <p class="text-sm text-stone-500 font-medium">Ajak teman, dapatkan penghasilan tambahan.</p>
          </div>
      </div>

      <!-- Referral Hero Section -->
       <div v-if="referralData" class="bg-gradient-to-br from-stone-900 via-stone-800 to-black rounded-3xl shadow-2xl border border-stone-700/50 overflow-hidden relative group">
          <!-- Background Effects -->
          <div class="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2 group-hover:bg-gold-400/15 transition-all duration-700"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div class="p-8 md:p-10 relative z-10 text-white">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div class="space-y-4 max-w-2xl">
                      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-300 text-[10px] font-bold uppercase tracking-widest">
                          <i class="fas fa-star text-xs"></i> Premium Partner
                      </div>
                      <h3 class="font-serif text-3xl md:text-4xl font-bold leading-tight">
                        Bagikan & <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">Dapatkan Cuan</span>
                      </h3>
                      <p class="text-stone-300 text-sm md:text-base leading-relaxed">
                          Dapatkan komisi <span class="text-white font-bold">Rp5.000 - Rp15.000</span> per undangan.
                          Teman Anda juga mendapat <span class="text-gold-400 font-bold border-b border-gold-500/30">DISKON SPESIAL</span> secara instan!
                      </p>
                  </div>

                  <!-- Balance Card -->
                   <div class="w-full md:w-auto flex flex-col items-end gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner transition-transform hover:scale-[1.02]">
                       <div class="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Saldo Bisa Ditarik</div>
                       <div class="text-4xl font-bold font-serif text-white tracking-tight">
                           {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(referralData.balance) }}
                       </div>
                       
                       <!-- Progress Bar Layout -->
                       <div class="w-full mt-2">
                            <div class="flex justify-between text-[9px] text-stone-400 mb-1 uppercase font-bold">
                                <span>Progress Pencairan</span>
                                <span>{{ Math.round(payoutProgress) }}%</span>
                            </div>
                            <div class="w-full bg-stone-700/50 rounded-full h-2 overflow-hidden border border-white/5">
                                <div class="bg-gradient-to-r from-gold-400 to-gold-600 h-full rounded-full transition-all duration-1000 ease-out" :style="{ width: `${payoutProgress}%` }"></div>
                            </div>
                       </div>

                       <button @click="openPayoutModal" 
                               :disabled="isPayoutLoading || (referralData.balance < 30000)" 
                               class="w-full mt-4 bg-gradient-to-r from-gold-400 to-gold-500 text-stone-900 py-3 px-6 rounded-xl font-bold font-sans hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:shadow-none flex items-center justify-center gap-2 active:scale-95">
                           <i v-if="isPayoutLoading" class="fas fa-spinner fa-spin"></i>
                           <i v-else class="fas fa-wallet"></i>
                           {{ isPayoutLoading ? 'Memproses...' : 'Tarik Saldo' }}
                       </button>
                   </div>
              </div>

              <!-- Action Grid -->
              <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Code Box -->
                  <div class="bg-black/30 rounded-2xl p-1 border border-white/5 active:scale-[0.99] transition-transform">
                      <div class="bg-stone-800/80 rounded-xl p-5 border border-stone-700 h-full flex flex-col justify-center">
                          <label class="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Kode Unik & Link</label>
                          <div class="flex gap-3">
                              <!-- Copy Button -->
                              <button @click="copyToClipboard(`${host}/s/${referralData.referralCode}`)" 
                                      class="flex-1 bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm tracking-wide text-stone-300 font-bold shadow-inner flex items-center justify-between group transition-all"
                                      title="Salin Link">
                                  <span>{{ referralData.referralCode }}</span>
                                  <div class="w-8 h-8 rounded bg-stone-700 flex items-center justify-center text-white group-active:scale-95 transition-transform" :class="{'bg-green-500': copyFeedback}">
                                     <i :class="copyFeedback ? 'fas fa-check' : 'fas fa-copy'"></i>
                                  </div>
                              </button>
                              
                              <!-- WhatsApp Button -->
                              <button @click="shareViaWhatsapp"
                                      class="bg-emerald-600 hover:bg-emerald-500 text-white px-5 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 border border-emerald-400/30">
                                  <i class="fab fa-whatsapp text-xl"></i>
                                  <span class="hidden md:inline">Share WA</span>
                              </button>
                          </div>
                      </div>
                  </div>

                   <!-- Quick Stats -->
                   <div class="grid grid-cols-2 gap-4">
                       <div class="bg-stone-800/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                           <div class="text-2xl font-bold text-white mb-1">{{ referralData.invitedFriends.filter((f: any) => f.status === 'approved').length }}</div>
                           <div class="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Sukses Upgrade</div>
                       </div>
                       <div class="bg-stone-800/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                           <div class="text-2xl font-bold text-white mb-1">{{ referralData.invitedFriends.length }}</div>
                           <div class="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Total Klik/Join</div>
                       </div>
                   </div>

               </div>
          </div>
       </div>

       <!-- Lower Section: History & Tutorial -->
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Left Column: Invite History -->
           <div class="lg:col-span-1 flex flex-col gap-6">
                <!-- Invited Friends List -->
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 h-full flex flex-col">
                     <h4 class="font-bold text-stone-900 mb-6 flex items-center gap-3 text-lg">
                         <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><i class="fas fa-users"></i></div>
                         Teman Diundang
                     </h4>
                     
                     <div v-if="referralData?.invitedFriends?.length > 0" class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                         <div v-for="friend in referralData.invitedFriends" :key="friend.createdAt" class="p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-blue-200 hover:shadow-sm transition-all">
                             <div class="flex items-center justify-between mb-3">
                                 <div class="flex items-center gap-3">
                                     <div class="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 text-sm">
                                         <i class="fas fa-user"></i>
                                     </div>
                                     <div>
                                         <div class="text-sm font-bold text-stone-800">{{ friend.name }}</div>
                                         <div class="text-[10px] text-stone-500 font-medium">{{ new Date(friend.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }} • {{ friend.plan.toUpperCase() }}</div>
                                     </div>
                                 </div>
                                 <div :class="{
                                     'bg-emerald-100 text-emerald-700 border-emerald-200': friend.status === 'approved',
                                     'bg-orange-100 text-orange-700 border-orange-200': friend.status === 'pending',
                                     'bg-red-100 text-red-700 border-red-200': friend.status === 'rejected'
                                 }" class="text-[9px] px-3 py-1 rounded-full font-bold uppercase border">
                                     {{ friend.status === 'approved' ? 'Lunas' : friend.status === 'pending' ? 'Pending' : 'Batal' }}
                                 </div>
                             </div>
                             <div class="flex justify-between items-center text-[11px] pt-3 border-t border-dashed border-stone-200">
                                 <span class="text-stone-500">Potongan Teman:</span>
                                 <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">-Rp {{ new Intl.NumberFormat('id-ID').format(friend.discount) }}</span>
                             </div>
                         </div>
                     </div>
                     
                     <!-- Premium Empty State -->
                     <div v-else class="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-400">
                         <div class="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-2xl text-stone-300">
                             <i class="fas fa-user-plus"></i>
                         </div>
                         <p class="text-sm font-medium text-stone-500">Belum ada teman bergabung.</p>
                         <button @click="shareViaWhatsapp" class="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <i class="fab fa-whatsapp"></i> Ajak via WA
                         </button>
                     </div>
                </div>
           </div>

           <!-- Right Column: Transaction History & Rules -->
           <div class="lg:col-span-2 space-y-6">
                
                <!-- TUTORIAL CARDS -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:border-gold-300 transition-colors">
                        <div class="w-10 h-10 bg-gold-50 text-gold-600 flex items-center justify-center rounded-xl text-lg mb-3">
                            <i class="fas fa-share-alt"></i>
                        </div>
                        <h4 class="font-bold text-stone-900 text-sm mb-1">1. Bagikan Link</h4>
                        <p class="text-[11px] text-stone-500 leading-relaxed">Share ke grup WA keluarga atau sobat nikah.</p>
                    </div>
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:border-blue-300 transition-colors">
                        <div class="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl text-lg mb-3">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4 class="font-bold text-stone-900 text-sm mb-1">2. Teman Upgrade</h4>
                        <p class="text-[11px] text-stone-500 leading-relaxed">Saat mereka beli paket Premium, bonus masuk.</p>
                    </div>
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:border-green-300 transition-colors">
                        <div class="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-xl text-lg mb-3">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <h4 class="font-bold text-stone-900 text-sm mb-1">3. Cairkan Kilat</h4>
                        <p class="text-[11px] text-stone-500 leading-relaxed">Tarik ke rekening/e-wallet min. Rp 30.000.</p>
                    </div>
                </div>

                <!-- Transaction History -->
                <div class="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                     <h4 class="font-bold text-stone-900 mb-6 flex items-center gap-3 text-lg">
                         <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"><i class="fas fa-history"></i></div>
                         Riwayat Transaksi
                     </h4>
                     <div v-if="referralData?.transactions && referralData.transactions.length > 0" class="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                         <table class="w-full text-left border-collapse">
                             <thead class="text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                                 <tr>
                                     <th class="py-2 pl-2">Keterangan</th>
                                     <th class="py-2 text-right pr-2">Nominal</th>
                                 </tr>
                             </thead>
                             <tbody class="text-sm">
                                 <tr v-for="tx in referralData.transactions" :key="tx.id" class="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                     <td class="py-3 pl-2">
                                         <div class="flex items-center gap-3">
                                             <div :class="tx.type === 'bonus' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'" class="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0">
                                                  <i :class="tx.type === 'bonus' ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
                                             </div>
                                             <div>
                                                 <div class="font-bold text-stone-800">{{ tx.type === 'bonus' ? 'Komisi Masuk' : 'Penarikan Dana' }}</div>
                                                 <div class="text-[10px] text-stone-400">{{ new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</div>
                                             </div>
                                         </div>
                                     </td>
                                     <td class="py-3 pr-2 text-right">
                                         <span :class="tx.type === 'bonus' ? 'text-emerald-600' : 'text-rose-600'" class="font-mono font-bold">
                                             {{ tx.type === 'bonus' ? '+' : '-' }} {{ new Intl.NumberFormat('id-ID').format(tx.amount) }}
                                         </span>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                     </div>
                     <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-stone-400 text-sm italic border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50">
                         <i class="fas fa-receipt text-3xl mb-3 opacity-20"></i>
                         Belum ada transaksi keluar masuk
                     </div>
                 </div>
           </div>
       </div>

    </div>

    <!-- Payout Modal -->
    <Teleport to="body">
        <div v-if="showPayoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div @click="closePayoutModal" class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"></div>
            
            <!-- Modal Content -->
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h3 class="text-xl font-serif font-bold text-stone-900">Tarik Saldo</h3>
                    <button @click="closePayoutModal" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto">
                    <div class="mb-6 bg-gold-50 border border-gold-200 rounded-xl p-4 flex items-start gap-3">
                        <i class="fas fa-info-circle text-gold-600 mt-1"></i>
                        <p class="text-xs text-gold-800 leading-relaxed">
                            Pastikan data rekening benar. Saldo akan ditransfer ke rekening Anda.
                        </p>
                    </div>

                    <form @submit.prevent="submitPayout" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nama Bank</label>
                            <div class="relative">
                                <i class="fas fa-university absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></i>
                                <input v-model="payoutForm.bankName" type="text" placeholder="Contoh: BCA / Mandiri / GoPay" 
                                       class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all text-sm font-bold text-stone-900" 
                                       required />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nomor Rekening</label>
                            <div class="relative">
                                <i class="fas fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></i>
                                <input v-model="payoutForm.bankAccountNumber" type="text" placeholder="1234xxxxxx" 
                                       class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all text-sm font-bold text-stone-900 font-mono" 
                                       required />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Atas Nama</label>
                            <div class="relative">
                                <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></i>
                                <input v-model="payoutForm.bankAccountName" type="text" placeholder="Nama Pemilik Rekening" 
                                       class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all text-sm font-bold text-stone-900" 
                                       required />
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">WhatsApp Aktif</label>
                            <div class="relative">
                                <i class="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></i>
                                <input v-model="payoutForm.phoneNumber" type="tel" placeholder="08xxxxxxxx" 
                                       class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all text-sm font-bold text-stone-900 font-mono" 
                                       required />
                            </div>
                        </div>

                        <!-- AGREEMENT CHECKBOX -->
                        <div class="bg-stone-50 rounded-xl p-3 border border-stone-200">
                             <label class="flex items-start gap-3 cursor-pointer">
                                 <input v-model="payoutForm.agreement" type="checkbox" class="mt-1 w-4 h-4 text-gold-500 focus:ring-gold-400 border-gray-300 rounded cursor-pointer">
                                 <span class="text-[11px] text-stone-500 select-none">
                                     Saya mengerti bahwa proses verifikasi manual dan transfer dana membutuhkan waktu <b>maksimal 1x24 jam kerja</b>. Saldo akan ditarik oleh Admin setelah form dikirim.
                                 </span>
                             </label>
                        </div>

                         <div class="pt-2">
                            <button type="submit" :disabled="isPayoutLoading || !payoutForm.agreement" 
                                    class="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                                <i v-if="isPayoutLoading" class="fas fa-spinner fa-spin"></i>
                                <span v-else>Konfirmasi Penarikan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e7e5e4;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a29e;
}
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
