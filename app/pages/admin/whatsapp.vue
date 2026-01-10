<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

interface WASettings { cloudToken: string; cloudPhoneId: string; cloudWabaId: string; targetPhone: string; template: string; hasToken?: boolean }
interface WAMetrics { pending: number; sent: number; failed: number }
interface WAStatus { cloudApiOk: boolean; cloudApiError?: string; botOnline: boolean; botLastSeen: string | null }

const stats = ref<{ settings: WASettings; metrics: WAMetrics; status: WAStatus } | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const activeTab = ref<'status' | 'settings' | 'template'>('status')
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Editable fields
const newToken = ref('')
const updateToken = ref(false)
const phoneId = ref('')
const wabaId = ref('')
const targetPhone = ref('')
const template = ref('')

useSeoMeta({ title: 'WhatsApp Settings - Admin', robots: 'noindex, nofollow' })

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => toast.value.show = false, 3000)
}

const fetchStats = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<any>('/api/admin/whatsapp')
        stats.value = data
        phoneId.value = data.settings.cloudPhoneId || ''
        wabaId.value = data.settings.cloudWabaId || ''
        targetPhone.value = data.settings.targetPhone || ''
        template.value = data.settings.template || ''
    } catch (e) { console.error(e) }
    finally { isLoading.value = false }
}

const saveSettings = async () => {
    isSaving.value = true
    try {
        const settings: Record<string, string> = {
            wa_cloud_phone_id: phoneId.value,
            wa_cloud_waba_id: wabaId.value,
            wa_target_phone: targetPhone.value,
        }
        if (updateToken.value && newToken.value.trim()) {
            settings.wa_cloud_token = newToken.value.trim()
        }
        await $fetch('/api/admin/whatsapp', { method: 'POST', body: { action: 'batch_update_settings', settings } })
        showToast('Settings saved')
        updateToken.value = false
        newToken.value = ''
        await fetchStats()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isSaving.value = false }
}

const saveTemplate = async () => {
    isSaving.value = true
    try {
        await $fetch('/api/admin/whatsapp', { method: 'POST', body: { action: 'batch_update_settings', settings: { wa_invitation_template: template.value } } })
        showToast('Template saved')
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isSaving.value = false }
}

const testCloudApi = async () => {
    isLoading.value = true
    try {
        await $fetch('/api/admin/whatsapp', { 
            method: 'POST', 
            body: { action: 'test_cloud_api', phone: targetPhone.value } 
        })
        showToast('Test message sent!')
    } catch (e: any) { showToast(e.statusMessage || 'Failed', 'error') }
    finally { isLoading.value = false }
}

onMounted(fetchStats)
</script>

<template>
<div class="min-h-screen bg-white text-gray-900 text-sm">
    <!-- Toast -->
    <div v-if="toast.show" class="fixed top-4 right-4 z-50 px-4 py-2 rounded text-white text-xs font-medium shadow-lg"
         :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">{{ toast.message }}</div>

    <!-- Header -->
    <header class="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-40">
        <div class="flex items-center gap-3">
            <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-900"><i class="fas fa-arrow-left"></i></NuxtLink>
            <span class="font-bold">WhatsApp</span>
            <span v-if="isLoading" class="text-gray-400 text-xs"><i class="fas fa-spinner fa-spin"></i></span>
        </div>
        <NuxtLink to="/admin/whatsapp/logs" class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">View Logs</NuxtLink>
    </header>

    <!-- Tabs -->
    <nav class="border-b px-4 flex gap-1">
        <button v-for="tab in ['status', 'settings', 'template']" :key="tab" @click="activeTab = tab as any"
                class="px-4 py-2 text-xs font-medium border-b-2 capitalize"
                :class="activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'">{{ tab }}</button>
    </nav>

    <main class="p-4 max-w-2xl mx-auto">
        <!-- STATUS TAB -->
        <div v-if="activeTab === 'status' && stats" class="space-y-4">
            <div class="border rounded p-4">
                <div class="text-xs text-gray-500 uppercase mb-2">Cloud API</div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full" :class="stats.status.cloudApiOk ? 'bg-green-500' : 'bg-red-500'"></span>
                        <span>{{ stats.status.cloudApiOk ? 'Connected' : 'Not configured' }}</span>
                    </div>
                    <button @click="testCloudApi" :disabled="isLoading" class="text-xs px-3 py-1 border rounded hover:bg-gray-50">Test</button>
                </div>
            </div>
            <div class="border rounded p-4">
                <div class="text-xs text-gray-500 uppercase mb-2">Local Bot</div>
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="stats.status.botOnline ? 'bg-green-500' : 'bg-gray-300'"></span>
                    <span>{{ stats.status.botOnline ? 'Online' : 'Offline' }}</span>
                    <span v-if="stats.status.botLastSeen" class="text-xs text-gray-400 ml-2">{{ stats.status.botLastSeen }}</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div class="border rounded p-4 text-center">
                    <div class="text-2xl font-bold text-yellow-600">{{ stats.metrics.pending }}</div>
                    <div class="text-xs text-gray-500">Pending</div>
                </div>
                <div class="border rounded p-4 text-center">
                    <div class="text-2xl font-bold text-green-600">{{ stats.metrics.sent }}</div>
                    <div class="text-xs text-gray-500">Sent</div>
                </div>
                <div class="border rounded p-4 text-center">
                    <div class="text-2xl font-bold text-red-600">{{ stats.metrics.failed }}</div>
                    <div class="text-xs text-gray-500">Failed</div>
                </div>
            </div>
        </div>

        <!-- SETTINGS TAB -->
        <div v-if="activeTab === 'settings'" class="space-y-4">
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">Cloud API Token</label>
                    <div v-if="!updateToken" class="flex gap-2">
                        <input type="text" :value="stats?.settings.hasToken ? '••••••••' : '(not set)'" readonly class="flex-1 px-3 py-2 border rounded bg-gray-50 text-gray-500" />
                        <button @click="updateToken = true" class="px-3 py-2 border rounded text-xs hover:bg-gray-50">Change</button>
                    </div>
                    <div v-else class="flex gap-2">
                        <input v-model="newToken" type="text" placeholder="Paste new token..." class="flex-1 px-3 py-2 border rounded" />
                        <button @click="updateToken = false; newToken = ''" class="px-3 py-2 border rounded text-xs hover:bg-gray-50">Cancel</button>
                    </div>
                </div>
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">Phone Number ID</label>
                    <input v-model="phoneId" type="text" class="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">WABA ID</label>
                    <input v-model="wabaId" type="text" class="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">Target Phone (Admin)</label>
                    <input v-model="targetPhone" type="text" placeholder="628xxx" class="w-full px-3 py-2 border rounded" />
                </div>
            </div>
            <button @click="saveSettings" :disabled="isSaving" class="w-full py-2 bg-gray-900 text-white rounded text-xs font-medium">
                {{ isSaving ? 'Saving...' : 'Save Settings' }}
            </button>
        </div>

        <!-- TEMPLATE TAB -->
        <div v-if="activeTab === 'template'" class="space-y-4">
            <div>
                <label class="text-xs text-gray-500 uppercase block mb-1">Invitation Template</label>
                <textarea v-model="template" rows="8" class="w-full px-3 py-2 border rounded font-mono text-xs" placeholder="Variables: {nama}, {link}, {slug}"></textarea>
            </div>
            <button @click="saveTemplate" :disabled="isSaving" class="w-full py-2 bg-gray-900 text-white rounded text-xs font-medium">
                {{ isSaving ? 'Saving...' : 'Save Template' }}
            </button>
        </div>
    </main>
</div>
</template>
