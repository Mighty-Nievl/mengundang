<script setup lang="ts">
// WhatsApp CMS - Cloud API & Bot Management
definePageMeta({
    layout: 'default',
    middleware: ['admin']
})

interface WAMetrics {
    pending: number
    sent: number
    failed: number
}

interface WALog {
    id: string
    phoneNumber: string
    message: string
    status: 'pending' | 'sent' | 'failed'
    createdAt: string
}

interface WAStats {
    logs: WALog[]
    metrics: WAMetrics
    status: { lastSeen: string | null; isOnline: boolean }
    settings: {
        cloudToken: string
        cloudPhoneId: string
        cloudWabaId: string
        targetPhone: string
        template: string
        hasToken?: boolean
    }
}

const stats = ref<WAStats | null>(null)
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const testPhone = ref('')
const testMessage = ref('')
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Track if user wants to update token (since masked, we need explicit intent)
const updateToken = ref(false)
const newToken = ref('')

const settings = ref({
    cloudPhoneId: '',
    cloudWabaId: '',
    targetPhone: '',
    template: ''
})

// Toast notification helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

onMounted(() => fetchData())

const fetchData = async () => {
    loading.value = true
    try {
        const data = await $fetch<WAStats>('/api/admin/whatsapp')
        stats.value = data
        settings.value = {
            cloudPhoneId: data.settings.cloudPhoneId,
            cloudWabaId: data.settings.cloudWabaId,
            targetPhone: data.settings.targetPhone,
            template: data.settings.template
        }
        // Reset token update state
        updateToken.value = false
        newToken.value = ''
    } catch (e: any) {
        showToast('Gagal mengambil data: ' + e.message, 'error')
    } finally {
        loading.value = false
    }
}

// Batch save all settings in single API call
const saveAllSettings = async () => {
    saving.value = true
    try {
        const settingsToSave: Record<string, string> = {
            wa_cloud_phone_id: settings.value.cloudPhoneId,
            wa_cloud_waba_id: settings.value.cloudWabaId,
            wa_target_phone: settings.value.targetPhone,
            wa_invitation_template: settings.value.template
        }

        // Only include token if user explicitly wants to update it
        if (updateToken.value && newToken.value.trim()) {
            settingsToSave.wa_cloud_token = newToken.value.trim()
        }

        await $fetch('/api/admin/whatsapp', {
            method: 'POST',
            body: { action: 'batch_update_settings', settings: settingsToSave }
        })
        
        showToast('✅ Semua pengaturan berhasil disimpan!')
        
        // Refresh to get updated data
        await fetchData()
    } catch (e: any) {
        showToast('Gagal menyimpan: ' + (e.data?.message || e.message), 'error')
    } finally {
        saving.value = false
    }
}

const saveSetting = async (key: string, value: string) => {
    saving.value = true
    try {
        await $fetch('/api/admin/whatsapp', {
            method: 'POST',
            body: { action: 'update_setting', key, value }
        })
        showToast('✅ Setting berhasil disimpan!')
    } catch (e: any) {
        showToast(`Gagal menyimpan: ` + (e.data?.message || e.message), 'error')
    } finally {
        saving.value = false
    }
}

const sendTestCloud = async () => {
    if (!testPhone.value) {
        return showToast('Masukkan nomor HP penerima!', 'error')
    }
    testing.value = true
    try {
        const res = await $fetch<{ success: boolean; message: string }>('/api/admin/whatsapp', {
            method: 'POST',
            body: { 
                action: 'test_cloud_api', 
                phone: testPhone.value,
                value: testMessage.value
            }
        })
        showToast('✅ ' + res.message)
        // Refresh logs
        await fetchData()
    } catch (e: any) {
        showToast('❌ ' + (e.data?.message || e.message), 'error')
    } finally {
        testing.value = false
    }
}

const formatStatusTime = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString('id-ID')
}
</script>

<template>
    <div class="min-h-screen bg-stone-50 text-stone-800 p-6 md:p-8 font-sans">
        <div class="max-w-4xl mx-auto space-y-8">
            
            <!-- Toast Notification -->
            <Transition name="toast">
                <div v-if="toast.show" 
                    class="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-medium max-w-md"
                    :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                    {{ toast.message }}
                </div>
            </Transition>
            
            <!-- Header -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                <div>
                    <h1 class="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
                        <i class="fab fa-whatsapp text-green-500"></i> WhatsApp CMS
                    </h1>
                    <p class="text-stone-500">Configure Business API & Monitor Logs</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/admin" class="px-4 py-2 border border-stone-200 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i> Back to Admin
                    </NuxtLink>
                    <button @click="fetchData" class="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
                    </button>
                </div>
            </header>

            <div v-if="loading" class="flex justify-center py-20">
                <i class="fas fa-spinner fa-spin text-4xl text-stone-300"></i>
            </div>

            <template v-else-if="stats">
                <!-- Status & Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div class="text-xs font-bold text-stone-400 uppercase mb-2">Local Bot Status</div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full" :class="stats.status.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-400'"></div>
                            <span class="font-bold">{{ stats.status.isOnline ? 'ONLINE' : 'OFFLINE' }}</span>
                        </div>
                        <div class="text-[10px] text-stone-400 mt-1 italic">Last seen: {{ formatStatusTime(stats.status.lastSeen) }}</div>
                    </div>
                    <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div class="text-xs font-bold text-stone-400 uppercase mb-2">Messages Total</div>
                        <div class="text-2xl font-bold text-stone-900">{{ (stats.metrics.sent || 0) + (stats.metrics.failed || 0) }}</div>
                    </div>
                    <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div class="text-xs font-bold text-stone-400 uppercase mb-2">Failed Delivery</div>
                        <div class="text-2xl font-bold text-red-500">{{ stats.metrics.failed || 0 }}</div>
                    </div>
                </div>

                <!-- Cloud API Configuration -->
                <div class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div class="bg-stone-900 text-white p-6">
                        <h2 class="text-xl font-bold">WhatsApp Cloud API</h2>
                        <p class="text-stone-400 text-sm mt-1">Gunakan Meta WhatsApp Business API untuk pengiriman VVIP</p>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase text-stone-500 ml-1">Phone Number ID</label>
                                <input v-model="settings.cloudPhoneId" type="text" placeholder="Contoh: 1007563632430707" 
                                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase text-stone-500 ml-1">WABA ID</label>
                                <input v-model="settings.cloudWabaId" type="text" placeholder="WhatsApp Business Account ID" 
                                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm">
                            </div>
                        </div>

                        <!-- Token Section (Secure) -->
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase text-stone-500 ml-1">Cloud API Token</label>
                            
                            <!-- Show current token status -->
                            <div v-if="!updateToken" class="flex items-center gap-4">
                                <div class="flex-1 px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl font-mono text-sm text-stone-500">
                                    {{ stats.settings.hasToken ? stats.settings.cloudToken : '(No token configured)' }}
                                </div>
                                <button @click="updateToken = true" 
                                    class="px-4 py-3 border border-amber-300 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors">
                                    <i class="fas fa-edit mr-2"></i> Update Token
                                </button>
                            </div>

                            <!-- Token update form -->
                            <div v-else class="space-y-2">
                                <textarea v-model="newToken" rows="3" placeholder="Paste token baru di sini (EAABw...)" 
                                    class="w-full px-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono text-sm resize-none"></textarea>
                                <div class="flex items-center gap-2 text-xs">
                                    <i class="fas fa-exclamation-triangle text-amber-500"></i>
                                    <span class="text-amber-700">Token akan tersimpan saat klik Save Settings</span>
                                    <button @click="updateToken = false; newToken = ''" class="ml-auto text-stone-500 hover:text-stone-700">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase text-stone-500 ml-1">Target Phone (Admin)</label>
                            <input v-model="settings.targetPhone" type="text" placeholder="6285xxxxxxxx" 
                                class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm">
                        </div>

                        <div class="pt-4 flex justify-between items-center">
                            <div class="text-xs text-stone-400">
                                <i class="fas fa-shield-alt mr-1"></i> Token disimpan terenkripsi di database
                            </div>
                            <button @click="saveAllSettings" :disabled="saving" class="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50">
                                <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                                {{ saving ? 'Saving...' : 'Save Settings' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Test Connection -->
                <div class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6">
                    <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                        <i class="fas fa-paper-plane text-sky-500"></i> Test Cloud API
                    </h3>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1 space-y-2">
                            <input v-model="testPhone" type="text" placeholder="Nomor HP (Contoh: 0857... atau 6285...)" 
                                class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                        </div>
                        <div class="flex-[2] space-y-2">
                            <input v-model="testMessage" type="text" placeholder="Pesan (Opsional)" 
                                class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                        </div>
                        <button @click="sendTestCloud" :disabled="testing" class="px-6 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all disabled:opacity-50">
                            {{ testing ? 'Sending...' : 'Test Now' }}
                        </button>
                    </div>
                </div>

                <!-- Invitation Template -->
                <div class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6">
                    <h3 class="font-bold text-lg mb-2">Global Template</h3>
                    <p class="text-stone-500 text-sm mb-4">Template pesan default untuk notifikasi undangan.</p>
                    <textarea v-model="settings.template" rows="4" class="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 outline-none transition-all font-mono text-sm"></textarea>
                    <div class="mt-4 flex justify-end">
                        <button @click="saveSetting('wa_invitation_template', settings.template)" :disabled="saving" class="px-6 py-2 border border-stone-200 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors">
                            Update Template
                        </button>
                    </div>
                </div>

                <!-- Logs (Last 5) -->
                <div class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-stone-100 flex justify-between items-center">
                        <h3 class="font-bold">Recent Logs</h3>
                        <NuxtLink to="/admin/whatsapp/logs" class="text-xs font-bold text-amber-600 hover:underline">View All Logs</NuxtLink>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-stone-50 text-stone-400 font-bold uppercase text-[10px]">
                                <tr>
                                    <th class="px-6 py-3">Time</th>
                                    <th class="px-6 py-3">To</th>
                                    <th class="px-6 py-3">Message</th>
                                    <th class="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-stone-50">
                                <tr v-if="!stats.logs?.length">
                                    <td colspan="4" class="px-6 py-8 text-center text-stone-400">
                                        <i class="fas fa-inbox text-2xl mb-2 block"></i>
                                        No logs yet
                                    </td>
                                </tr>
                                <tr v-for="log in stats.logs?.slice(0, 5)" :key="log.id" class="hover:bg-stone-50 transition-colors">
                                    <td class="px-6 py-4 text-stone-400 whitespace-nowrap text-xs">{{ formatStatusTime(log.createdAt) }}</td>
                                    <td class="px-6 py-4 font-mono">{{ log.phoneNumber }}</td>
                                    <td class="px-6 py-4 max-w-[200px] truncate text-stone-500">{{ log.message }}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded text-[10px] font-bold uppercase"
                                            :class="{
                                                'bg-green-100 text-green-600': log.status === 'sent',
                                                'bg-amber-100 text-amber-600': log.status === 'pending',
                                                'bg-red-100 text-red-600': log.status === 'failed'
                                            }">
                                            {{ log.status }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
            
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
