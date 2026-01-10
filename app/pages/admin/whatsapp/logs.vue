<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

interface WALog { id: string; phoneNumber: string; message: string; status: string; createdAt: string }

const logs = ref<WALog[]>([])
const isLoading = ref(false)
const filter = ref<'all' | 'pending' | 'sent' | 'failed'>('all')
const page = ref(1)
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

useSeoMeta({ title: 'WA Logs - Admin', robots: 'noindex, nofollow' })

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => toast.value.show = false, 3000)
}

const fetchLogs = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<{ logs: WALog[] }>('/api/admin/whatsapp/logs', {
            query: { status: filter.value === 'all' ? '' : filter.value, page: page.value, limit: 50 }
        })
        logs.value = data.logs
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}

const getStatusColor = (status: string) => {
    if (status === 'sent') return 'text-green-600'
    if (status === 'failed') return 'text-red-600'
    return 'text-yellow-600'
}

watch([filter, page], fetchLogs)
onMounted(fetchLogs)
</script>

<template>
<div class="min-h-screen bg-white text-gray-900 text-sm">
    <!-- Toast -->
    <div v-if="toast.show" class="fixed top-4 right-4 z-50 px-4 py-2 rounded text-white text-xs font-medium shadow-lg"
         :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">{{ toast.message }}</div>

    <!-- Header -->
    <header class="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-40">
        <div class="flex items-center gap-3">
            <NuxtLink to="/admin/whatsapp" class="text-gray-400 hover:text-gray-900"><i class="fas fa-arrow-left"></i></NuxtLink>
            <span class="font-bold">WA Logs</span>
            <span v-if="isLoading" class="text-gray-400 text-xs"><i class="fas fa-spinner fa-spin"></i></span>
        </div>
        <button @click="fetchLogs" class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">Refresh</button>
    </header>

    <!-- Filter -->
    <div class="border-b px-4 py-2 flex gap-1">
        <button v-for="f in ['all', 'pending', 'sent', 'failed']" :key="f" @click="filter = f as any"
                class="px-3 py-1 text-xs rounded capitalize"
                :class="filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'">{{ f }}</button>
    </div>

    <main class="p-4 max-w-4xl mx-auto">
        <div v-if="logs.length === 0" class="text-center py-12 text-gray-400">No logs found</div>
        <div v-else class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="text-xs text-gray-500 uppercase border-b">
                    <tr>
                        <th class="py-2 pr-4">Phone</th>
                        <th class="py-2 pr-4">Message</th>
                        <th class="py-2 pr-4">Status</th>
                        <th class="py-2">Time</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
                        <td class="py-3 pr-4 font-mono text-xs">{{ log.phoneNumber }}</td>
                        <td class="py-3 pr-4 max-w-xs truncate">{{ log.message }}</td>
                        <td class="py-3 pr-4 uppercase text-xs font-medium" :class="getStatusColor(log.status)">{{ log.status }}</td>
                        <td class="py-3 text-xs text-gray-500">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-center gap-2">
            <button @click="page--" :disabled="page <= 1" class="px-3 py-1 text-xs border rounded disabled:opacity-50">Prev</button>
            <span class="px-3 py-1 text-xs text-gray-500">Page {{ page }}</span>
            <button @click="page++" :disabled="logs.length < 50" class="px-3 py-1 text-xs border rounded disabled:opacity-50">Next</button>
        </div>
    </main>
</div>
</template>
