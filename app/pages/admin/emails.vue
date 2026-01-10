<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

interface EmailLog { id: string; recipient: string; subject: string; content: string; status: string; error?: string; createdAt: string }

const activeTab = ref<'logs' | 'template'>('logs')
const logs = ref<EmailLog[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const selectedLog = ref<EmailLog | null>(null)
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
const rsvpTemplate = ref('')

const defaultTemplate = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Ada Tamu Baru! ✨</h2>
    <p>Seseorang mengisi RSVP di undangan <strong>{{slug}}</strong>:</p>
    <hr />
    <p><strong>Nama:</strong> {{name}}</p>
    <p><strong>Status:</strong> {{status}}</p>
    <p><strong>Pesan:</strong> {{message}}</p>
</div>`

useSeoMeta({ title: 'Email Settings - Admin', robots: 'noindex, nofollow' })

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => toast.value.show = false, 3000)
}

const fetchLogs = async () => {
    isLoading.value = true
    try { logs.value = await $fetch('/api/admin/emails') } catch (e) { console.error(e) }
    finally { isLoading.value = false }
}

const fetchSettings = async () => {
    try {
        const s = await $fetch<Record<string, string>>('/api/admin/settings')
        rsvpTemplate.value = s.email_rsvp_template || defaultTemplate
    } catch (e) { console.error(e) }
}

const saveTemplate = async () => {
    isSaving.value = true
    try {
        await $fetch('/api/admin/settings', { method: 'POST', body: { key: 'email_rsvp_template', value: rsvpTemplate.value } })
        showToast('Template saved')
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isSaving.value = false }
}

// Basic HTML sanitizer
const sanitize = (html: string) => html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '')

onMounted(() => { fetchLogs(); fetchSettings() })
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
            <span class="font-bold">Email</span>
            <span v-if="isLoading" class="text-gray-400 text-xs"><i class="fas fa-spinner fa-spin"></i></span>
        </div>
        <button @click="fetchLogs" class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">Refresh</button>
    </header>

    <!-- Tabs -->
    <nav class="border-b px-4 flex gap-1">
        <button v-for="tab in ['logs', 'template']" :key="tab" @click="activeTab = tab as any"
                class="px-4 py-2 text-xs font-medium border-b-2 capitalize"
                :class="activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'">{{ tab }}</button>
    </nav>

    <main class="p-4 max-w-4xl mx-auto">
        <!-- LOGS TAB -->
        <div v-if="activeTab === 'logs'">
            <div v-if="logs.length === 0" class="text-center py-12 text-gray-400">No email logs</div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-xs text-gray-500 uppercase border-b">
                        <tr>
                            <th class="py-2 pr-4">Recipient</th>
                            <th class="py-2 pr-4">Subject</th>
                            <th class="py-2 pr-4">Status</th>
                            <th class="py-2 pr-4">Time</th>
                            <th class="py-2"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
                            <td class="py-3 pr-4 text-xs truncate max-w-[150px]">{{ log.recipient }}</td>
                            <td class="py-3 pr-4 truncate max-w-[200px]">{{ log.subject }}</td>
                            <td class="py-3 pr-4">
                                <span class="text-xs font-medium uppercase" :class="log.status === 'sent' ? 'text-green-600' : 'text-red-600'">{{ log.status }}</span>
                            </td>
                            <td class="py-3 pr-4 text-xs text-gray-500">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</td>
                            <td class="py-3">
                                <button @click="selectedLog = log" class="text-gray-400 hover:text-gray-900"><i class="fas fa-eye"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TEMPLATE TAB -->
        <div v-if="activeTab === 'template'" class="space-y-4">
            <div class="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                Variables: <code class="bg-white px-1 rounded">{{name}}</code>, <code class="bg-white px-1 rounded">{{status}}</code>, <code class="bg-white px-1 rounded">{{slug}}</code>, <code class="bg-white px-1 rounded">{{message}}</code>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">HTML Template</label>
                    <textarea v-model="rsvpTemplate" rows="12" class="w-full px-3 py-2 border rounded font-mono text-xs"></textarea>
                </div>
                <div>
                    <label class="text-xs text-gray-500 uppercase block mb-1">Preview</label>
                    <div class="border rounded p-4 bg-gray-50 h-[280px] overflow-auto text-xs" v-html="sanitize(rsvpTemplate.replace(/\{\{name\}\}/g, 'Budi').replace(/\{\{status\}\}/g, 'Hadir').replace(/\{\{slug\}\}/g, 'contoh').replace(/\{\{message\}\}/g, 'Selamat!'))"></div>
                </div>
            </div>
            <div class="flex gap-2">
                <button @click="rsvpTemplate = defaultTemplate" class="px-4 py-2 border rounded text-xs hover:bg-gray-50">Reset</button>
                <button @click="saveTemplate" :disabled="isSaving" class="flex-1 py-2 bg-gray-900 text-white rounded text-xs font-medium">
                    {{ isSaving ? 'Saving...' : 'Save Template' }}
                </button>
            </div>
        </div>
    </main>

    <!-- Detail Modal -->
    <Teleport to="body">
        <div v-if="selectedLog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="selectedLog = null">
            <div class="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
                <div class="border-b px-4 py-3 flex justify-between items-center">
                    <span class="font-bold">Email Detail</span>
                    <button @click="selectedLog = null" class="text-gray-400 hover:text-gray-900"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-4 overflow-auto max-h-[60vh]">
                    <div class="text-xs text-gray-500 mb-2">To: {{ selectedLog.recipient }}</div>
                    <div class="text-xs text-gray-500 mb-4">Subject: {{ selectedLog.subject }}</div>
                    <div class="border rounded p-4 bg-gray-50 text-xs" v-html="sanitize(selectedLog.content)"></div>
                    <div v-if="selectedLog.error" class="mt-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-800">
                        <b>Error:</b> {{ selectedLog.error }}
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</div>
</template>
