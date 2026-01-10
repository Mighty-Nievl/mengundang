<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['admin']
})

interface WALog {
    id: string
    phoneNumber: string
    message: string
    status: 'pending' | 'sent' | 'failed'
    createdAt: string
}

const logs = ref<WALog[]>([])
const loading = ref(true)
const pagination = ref({ page: 1, limit: 50, total: 0, totalPages: 0 })
const statusFilter = ref('')
const toast = ref({ show: false, message: '', type: 'error' as 'success' | 'error' })

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

onMounted(() => fetchLogs())

const fetchLogs = async (page = 1) => {
    loading.value = true
    try {
        const params = new URLSearchParams({ page: String(page), limit: '50' })
        if (statusFilter.value) params.set('status', statusFilter.value)
        
        const data = await $fetch<any>(`/api/admin/whatsapp/logs?${params}`)
        logs.value = data.logs
        pagination.value = data.pagination
    } catch (e: any) {
        showToast('Gagal mengambil data: ' + e.message, 'error')
    } finally {
        loading.value = false
    }
}

const setFilter = (status: string) => {
    statusFilter.value = status
    fetchLogs(1)
}

const formatTime = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('id-ID')
}

const getStatusClass = (status: string) => {
    return {
        'bg-green-100 text-green-600': status === 'sent',
        'bg-amber-100 text-amber-600': status === 'pending',
        'bg-red-100 text-red-600': status === 'failed'
    }
}
</script>

<template>
    <div class="min-h-screen bg-stone-50 text-stone-800 p-6 md:p-8 font-sans">
        <div class="max-w-6xl mx-auto space-y-6">
            
            <!-- Header -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                <div>
                    <h1 class="text-2xl font-serif font-bold text-stone-900 flex items-center gap-3">
                        <i class="fas fa-list-alt text-stone-400"></i> WhatsApp Logs
                    </h1>
                    <p class="text-stone-500 text-sm">Riwayat lengkap notifikasi WhatsApp</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink to="/admin/whatsapp" class="px-4 py-2 border border-stone-200 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i> Back
                    </NuxtLink>
                    <button @click="fetchLogs(pagination.page)" class="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
                    </button>
                </div>
            </header>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2">
                <button @click="setFilter('')" 
                    class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    :class="statusFilter === '' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 hover:bg-stone-50'">
                    All
                </button>
                <button @click="setFilter('pending')" 
                    class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    :class="statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white border border-stone-200 hover:bg-stone-50'">
                    <i class="fas fa-clock mr-1"></i> Pending
                </button>
                <button @click="setFilter('sent')" 
                    class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    :class="statusFilter === 'sent' ? 'bg-green-500 text-white' : 'bg-white border border-stone-200 hover:bg-stone-50'">
                    <i class="fas fa-check mr-1"></i> Sent
                </button>
                <button @click="setFilter('failed')" 
                    class="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    :class="statusFilter === 'failed' ? 'bg-red-500 text-white' : 'bg-white border border-stone-200 hover:bg-stone-50'">
                    <i class="fas fa-times mr-1"></i> Failed
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-20">
                <i class="fas fa-spinner fa-spin text-4xl text-stone-300"></i>
            </div>

            <!-- Table -->
            <div v-else class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-stone-100 flex justify-between items-center">
                    <span class="text-sm text-stone-500">
                        Showing {{ logs.length }} of {{ pagination.total }} logs
                    </span>
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
                            <tr v-if="logs.length === 0">
                                <td colspan="4" class="px-6 py-12 text-center text-stone-400">
                                    <i class="fas fa-inbox text-4xl mb-3 block"></i>
                                    No logs found
                                </td>
                            </tr>
                            <tr v-for="log in logs" :key="log.id" class="hover:bg-stone-50 transition-colors">
                                <td class="px-6 py-4 text-stone-400 whitespace-nowrap text-xs">{{ formatTime(log.createdAt) }}</td>
                                <td class="px-6 py-4 font-mono text-sm">{{ log.phoneNumber }}</td>
                                <td class="px-6 py-4 max-w-[300px] truncate text-stone-500" :title="log.message">{{ log.message }}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase" :class="getStatusClass(log.status)">
                                        {{ log.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="pagination.totalPages > 1" class="p-4 border-t border-stone-100 flex justify-center gap-2">
                    <button 
                        @click="fetchLogs(pagination.page - 1)" 
                        :disabled="pagination.page <= 1"
                        class="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="px-4 py-2 text-sm text-stone-500">
                        Page {{ pagination.page }} of {{ pagination.totalPages }}
                    </span>
                    <button 
                        @click="fetchLogs(pagination.page + 1)" 
                        :disabled="pagination.page >= pagination.totalPages"
                        class="px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            
        </div>
    </div>
</template>
