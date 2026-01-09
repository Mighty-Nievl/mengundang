<script setup lang="ts">
// User Dashboard - WhatsApp Broadcast Manager
definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const route = useRoute()
const slug = computed(() => route.query.slug as string || '')

const data = ref<any>(null)
const invitations = ref<any[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const testPhone = ref('')

const fetchInvitations = async () => {
    try {
        const res = await $fetch('/api/invitations')
        invitations.value = res as any[]
    } catch (e) {
        console.error('Failed to fetch invitations:', e)
    }
}

const fetchWAData = async () => {
    if (!slug.value) return
    try {
        isLoading.value = true
        data.value = await $fetch(`/api/wa/logs?slug=${slug.value}`)
    } catch (e: any) {
        alert('Gagal mengambil data: ' + e.message)
    } finally {
        isLoading.value = false
    }
}

const saveTemplate = async () => {
    if (!slug.value) return
    isSaving.value = true
    try {
        await $fetch('/api/wa/template', {
            method: 'POST',
            body: { slug: slug.value, template: data.value.template }
        })
        alert('✅ Template berhasil disimpan!')
    } catch (e: any) {
        alert('❌ Gagal: ' + e.message)
    } finally {
        isSaving.value = false
    }
}

const sendTest = async () => {
    if (!testPhone.value) return alert('Masukkan nomor HP!')
    if (!slug.value) return alert('Pilih undangan dulu!')
    try {
        await $fetch('/api/wa/send-invitation', {
            method: 'POST',
            body: { 
                phone: testPhone.value, 
                guestName: 'Test User',
                invitationSlug: slug.value
            }
        })
        alert('🚀 Pesan test masuk antrean!')
        fetchWAData()
    } catch (e: any) {
        alert('❌ Gagal: ' + e.message)
    }
}

const selectInvitation = (newSlug: string) => {
    navigateTo({ path: '/dashboard/whatsapp', query: { slug: newSlug } })
}

onMounted(async () => {
    await fetchInvitations()
    if (slug.value) {
        fetchWAData()
    }
})

watch(slug, (newSlug) => {
    if (newSlug) fetchWAData()
})

const formatTime = (iso: string) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    })
}

const getPreview = computed(() => {
    if (!data.value?.template) return 'Tulis template pesan dulu...'
    return data.value.template
        .replace(/\{\{name\}\}/g, 'Budi Santoso')
        .replace(/\{\{link\}\}/g, `https://mengundang.site/${slug.value}?to=Budi+Santoso`)
})
</script>

<template>
    <div class="min-h-screen bg-[#FDFCFB] p-6 md:p-8 font-sans pb-32">
        <div class="max-w-6xl mx-auto space-y-8">
            
            <!-- Header -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                <div class="flex items-center gap-4">
                    <NuxtLink to="/dashboard" class="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all">
                        <i class="fas fa-arrow-left"></i>
                    </NuxtLink>
                    <div>
                        <h1 class="text-2xl font-serif font-bold text-stone-900">WhatsApp Broadcast</h1>
                        <p class="text-sm text-stone-500">Kirim undangan ke tamu via WhatsApp.</p>
                    </div>
                </div>
                <!-- Invitation Selector -->
                <div class="flex items-center gap-3">
                    <span class="text-xs text-stone-400 font-bold">Undangan:</span>
                    <select 
                        :value="slug" 
                        @change="selectInvitation(($event.target as HTMLSelectElement).value)"
                        class="bg-stone-100 border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold text-stone-700 outline-none focus:border-gold-500"
                    >
                        <option value="">-- Pilih Undangan --</option>
                        <option v-for="inv in invitations" :key="inv.slug" :value="inv.slug">
                            {{ inv.groom || 'Groom' }} & {{ inv.bride || 'Bride' }} ({{ inv.slug }})
                        </option>
                    </select>
                </div>
            </header>

            <!-- No Invitation Selected -->
            <div v-if="!slug" class="bg-white p-16 rounded-3xl border border-stone-200 text-center">
                <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-stone-300">
                    <i class="fab fa-whatsapp"></i>
                </div>
                <h3 class="text-xl font-bold text-stone-900 mb-2">Pilih Undangan</h3>
                <p class="text-stone-500 max-w-md mx-auto">Pilih undangan di dropdown atas untuk mengelola broadcast WhatsApp ke tamu-tamu Anda.</p>
            </div>

            <!-- Main Content -->
            <div v-else-if="isLoading && !data" class="text-center py-20">
                <i class="fas fa-circle-notch fa-spin text-3xl text-stone-300"></i>
            </div>

            <div v-else-if="data" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left: Template Editor -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm space-y-6">
                        <div class="flex justify-between items-center">
                            <h3 class="font-bold text-lg text-stone-900 flex items-center gap-2">
                                <i class="fas fa-keyboard text-gold-500"></i> Template Pesan
                            </h3>
                            <div v-pre class="text-[10px] font-black uppercase text-stone-300 tracking-widest">
                                Variables: <code class="bg-stone-100 px-1 rounded">&#123;&#123;name&#125;&#125;</code>, <code class="bg-stone-100 px-1 rounded">&#123;&#123;link&#125;&#125;</code>
                            </div>
                        </div>
                        
                        <textarea 
                            v-model="data.template" 
                            rows="8" 
                            class="w-full p-6 bg-stone-50 border-2 border-stone-100 rounded-3xl focus:border-gold-500 focus:bg-white transition-all outline-none font-medium text-stone-700 leading-relaxed"
                            placeholder="Halo {{name}}! Kami mengundang..."
                        ></textarea>

                        <div class="flex justify-between items-center pt-2">
                             <div class="text-xs text-stone-400 italic">Gunakan variabel untuk personalisasi pesan.</div>
                             <button @click="saveTemplate" :disabled="isSaving" class="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50">
                                <i v-if="isSaving" class="fas fa-spinner fa-spin mr-2"></i>
                                Simpan Template
                             </button>
                        </div>
                    </div>

                    <!-- Test Tool -->
                    <div class="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        <h3 class="font-bold mb-4 flex items-center gap-2">
                            <i class="fab fa-whatsapp"></i> Kirim Test
                        </h3>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <input v-model="testPhone" type="text" placeholder="Nomor HP Anda (08...)" class="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-white transition-all text-sm font-bold placeholder:text-white/50" />
                            <button @click="sendTest" class="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all active:scale-95">
                                <i class="fas fa-paper-plane mr-2"></i> Kirim Test
                            </button>
                        </div>
                        <p class="text-xs text-white/60 mt-3">Coba kirim ke HP Anda sendiri untuk melihat hasilnya.</p>
                    </div>

                    <!-- Logs Table -->
                    <div class="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                        <div class="p-6 border-b border-stone-100 flex justify-between items-center">
                            <h3 class="font-bold">Riwayat Pengiriman</h3>
                            <button @click="fetchWAData" class="text-xs text-stone-400 hover:text-stone-900 transition-colors">
                                <i class="fas fa-sync-alt mr-1"></i> Refresh
                            </button>
                        </div>
                        <div v-if="data.logs.length === 0" class="p-12 text-center text-stone-400">
                            <i class="fas fa-inbox text-3xl mb-3 opacity-30"></i>
                            <p class="text-sm">Belum ada pesan terkirim.</p>
                        </div>
                        <div v-else class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead class="bg-stone-50 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th class="px-6 py-4">Waktu</th>
                                        <th class="px-6 py-4">Tamu</th>
                                        <th class="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-stone-50">
                                    <tr v-for="log in data.logs" :key="log.id" class="hover:bg-stone-50 transition-colors">
                                        <td class="px-6 py-4 text-stone-500">{{ formatTime(log.createdAt) }}</td>
                                        <td class="px-6 py-4 font-bold">{{ log.phoneNumber }}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight"
                                                :class="{
                                                    'bg-amber-100 text-amber-600': log.status === 'pending',
                                                    'bg-green-100 text-green-600': log.status === 'sent',
                                                    'bg-red-100 text-red-600': log.status === 'failed'
                                                }">
                                                {{ log.status === 'pending' ? 'Menunggu' : log.status === 'sent' ? 'Terkirim' : 'Gagal' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right: Preview -->
                <div class="space-y-6">
                    <div class="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col items-center">
                        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <h3 class="font-bold text-stone-900">Preview Pesan</h3>
                        <p class="text-xs text-stone-500 text-center mt-1 mb-6">Tampilan pesan di HP tamu.</p>

                        <!-- Mobile Frame Mockup -->
                        <div class="w-full bg-stone-100 rounded-[2.5rem] p-3 border-4 border-stone-900 relative">
                             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-stone-900 rounded-b-xl z-20"></div>
                             <div class="bg-white rounded-[2rem] min-h-[300px] p-4 pt-8 space-y-4">
                                 <!-- Incoming Chat bubble -->
                                 <div class="bg-emerald-100 p-3 rounded-2xl rounded-tl-none text-[11px] leading-relaxed text-stone-800 shadow-sm whitespace-pre-wrap font-medium">
                                     {{ getPreview }}
                                     <div class="text-right text-[8px] text-stone-400 mt-1">12:00 PM ✓✓</div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 gap-4">
                         <div class="bg-white p-5 rounded-2xl border border-stone-200 text-center">
                             <div class="text-2xl font-bold text-stone-900">{{ data.stats?.pending || 0 }}</div>
                             <div class="text-[10px] text-stone-400 font-bold uppercase mt-1">Menunggu</div>
                         </div>
                         <div class="bg-white p-5 rounded-2xl border border-stone-200 text-center">
                             <div class="text-2xl font-bold text-emerald-600">{{ data.stats?.sent || 0 }}</div>
                             <div class="text-[10px] text-stone-400 font-bold uppercase mt-1">Terkirim</div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
