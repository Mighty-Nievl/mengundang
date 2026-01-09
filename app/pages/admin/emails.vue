<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const isAuthorized = ref(false)
const currentUser = ref<any>(null)
const emailLogs = ref<any[]>([])
const activeTab = ref<'logs' | 'template'>('logs')
const isLoading = ref(false)
const isSaving = ref(false)
const selectedEmail = ref<any>(null)

// Template Editor State
const rsvpTemplate = ref('')
const defaultTemplate = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #1C1917;">Ada Tamu Baru! ✨</h2>
    <p>Halo, seseorang baru saja mengisi RSVP di undangan <strong>{{slug}}</strong>:</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p><strong>Nama:</strong> {{name}}</p>
    <p><strong>Status:</strong> {{status}}</p>
    <p><strong>Pesan:</strong> {{message}}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 14px; color: #666;">Cek selengkapnya di dashboard admin Anda.</p>
</div>
`

import { useAuthClient } from '../../utils/auth-client'

useSeoMeta({
  title: 'Log Email - Admin Undangan',
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
        emailLogs.value = await $fetch('/api/admin/emails')
        fetchSettings()
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

const fetchSettings = async () => {
    try {
        const settings = await $fetch<Record<string, string>>('/api/admin/settings')
        rsvpTemplate.value = settings.email_rsvp_template || defaultTemplate
    } catch (e) {
        console.error('Failed to fetch settings', e)
    }
}

const saveTemplate = async () => {
    isSaving.value = true
    try {
        await $fetch('/api/admin/settings', {
            method: 'POST',
            body: { key: 'email_rsvp_template', value: rsvpTemplate.value }
        })
        alert('✅ Template berhasil disimpan!')
    } catch (e: any) {
        alert('❌ Gagal: ' + (e.statusMessage || e.message))
    } finally {
        isSaving.value = false
    }
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const openModal = (email: any) => {
    selectedEmail.value = email
}
</script>

<template>
    <div v-if="isAuthorized" class="min-h-screen bg-stone-50 text-stone-800 p-6 font-sans">
        <div class="max-w-6xl mx-auto">
            <header class="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div>
                    <h1 class="text-3xl font-bold text-stone-900">Email CMS & Logs</h1>
                    <p class="text-stone-500 mt-1">Pantau semua email keluar dan status pengirimannya.</p>
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
            <div class="flex gap-4 mb-8 border-b border-stone-200 pb-1">
                <button @click="activeTab = 'logs'" :class="[activeTab === 'logs' ? 'border-b-4 border-purple-500 text-stone-900 bg-stone-50' : 'text-stone-400 hover:text-stone-600', 'px-6 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap']">
                    <i class="fas fa-history"></i> Log Pengiriman
                </button>
                <button @click="activeTab = 'template'" :class="[activeTab === 'template' ? 'border-b-4 border-purple-500 text-stone-900 bg-stone-50' : 'text-stone-400 hover:text-stone-600', 'px-6 py-3 font-bold transition-all flex items-center gap-2 whitespace-nowrap']">
                    <i class="fas fa-edit"></i> Edit Template
                </button>
            </div>

            <div v-if="activeTab === 'logs'" class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-fade">
                <div v-if="emailLogs.length === 0" class="p-12 text-center text-stone-400">
                    <i class="fas fa-envelope-open text-4xl mb-4 opacity-20"></i>
                    <p>Belum ada log email yang tercatat.</p>
                </div>

                <table v-else class="w-full">
                    <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th class="p-6 text-left">Penerima</th>
                            <th class="p-6 text-left">Subjek</th>
                            <th class="p-6 text-left">Status</th>
                            <th class="p-6 text-left">Waktu</th>
                            <th class="p-6 text-right">Detail</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                        <tr v-for="log in emailLogs" :key="log.id" class="hover:bg-stone-50 transition-colors">
                            <td class="p-6">
                                <div class="font-bold text-stone-900 truncate max-w-[200px]">{{ log.recipient }}</div>
                            </td>
                            <td class="p-6">
                                <div class="text-stone-600 truncate max-w-[300px]">{{ log.subject }}</div>
                            </td>
                            <td class="p-6">
                                <span v-if="log.status === 'sent'" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                    SENT
                                </span>
                                <span v-else class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase" :title="log.error">
                                    FAILED
                                </span>
                            </td>
                            <td class="p-6 text-sm text-stone-500">
                                {{ formatDate(log.createdAt) }}
                            </td>
                            <td class="p-6 text-right">
                                <button @click="openModal(log)" class="text-stone-400 hover:text-stone-900 transition-colors">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Template Editor -->
            <div v-if="activeTab === 'template'" class="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 animate-fade">
                <div class="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-800 text-sm">
                    <div class="font-bold mb-1"><i class="fas fa-info-circle mr-1"></i> Tips Variabel:</div>
                    Gunakan placeholder berikut untuk data dinamis: 
                    <code v-pre class="bg-white px-1 rounded border">{{name}}</code>, 
                    <code v-pre class="bg-white px-1 rounded border">{{status}}</code>, 
                    <code v-pre class="bg-white px-1 rounded border">{{slug}}</code>, 
                    <code v-pre class="bg-white px-1 rounded border">{{message}}</code>.
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-4">
                        <label class="block font-bold text-stone-700">HTML Template (RSVP Notification)</label>
                        <textarea 
                            v-model="rsvpTemplate" 
                            class="w-full h-[400px] p-6 font-mono text-sm border border-stone-200 rounded-2xl outline-none focus:border-purple-500 bg-stone-50"
                            placeholder="Tulis HTML template di sini..."
                        ></textarea>
                    </div>

                    <div class="space-y-4">
                        <label class="block font-bold text-stone-700">Live Preview (Desktop)</label>
                        <div class="h-[400px] border border-stone-100 rounded-2xl overflow-y-auto bg-stone-200 p-6 flex justify-center">
                            <div class="bg-white w-full max-w-[500px] h-fit p-6 rounded shadow-sm scale-90 origin-top" v-html="rsvpTemplate.replace(/\{\{name\}\}/g, 'Budi Santoso').replace(/\{\{status\}\}/g, 'Hadir').replace(/\{\{message\}\}/g, 'Selamat ya!').replace(/\{\{slug\}\}/g, 'happy-wedding')"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 pt-8 border-t flex justify-end gap-4">
                    <button @click="rsvpTemplate = defaultTemplate" class="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100">
                        Reset ke Default
                    </button>
                    <button @click="saveTemplate" :disabled="isSaving" class="bg-purple-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2">
                         <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <Transition name="fade">
            <div v-if="selectedEmail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
                <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoom">
                    <div class="p-6 border-b flex justify-between items-center bg-stone-50">
                        <div>
                            <h3 class="font-bold text-xl text-stone-900">Isi Email</h3>
                            <p class="text-xs text-stone-500">ID: {{ selectedEmail.id }}</p>
                        </div>
                        <button @click="selectedEmail = null" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-900">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-8 max-h-[70vh] overflow-y-auto">
                        <div class="space-y-4">
                            <div class="bg-white p-4 rounded-xl border border-stone-100 shadow-sm" v-html="selectedEmail.content"></div>
                            <div v-if="selectedEmail.error" class="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-sm font-mono overflow-x-auto">
                                <div class="font-bold mb-1">Error Logs:</div>
                                {{ selectedEmail.error }}
                            </div>
                        </div>
                    </div>
                    <div class="p-6 bg-stone-50 border-t flex justify-end">
                        <button @click="selectedEmail = null" class="bg-stone-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-900 transition-all">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.animate-zoom { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
