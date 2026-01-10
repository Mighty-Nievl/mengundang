<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

interface AdminUser {
    id: string
    email: string
    name: string
    role: string
    plan: string
    maxInvitations: number
    maxGuests: number
    usage?: number
    success?: boolean
}

const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })
const deletingEmail = ref<string | null>(null)

useSeoMeta({
  title: 'Manajemen User - Admin Undangan',
  robots: 'noindex, nofollow'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 4000)
}

onMounted(() => fetchData())

const fetchData = async () => {
    isLoading.value = true
    try {
        users.value = await $fetch('/api/users') as AdminUser[]
    } catch (e) {
        console.error(e)
        showToast('Gagal mengambil data', 'error')
    } finally {
        isLoading.value = false
    }
}

const savePlan = async (user: AdminUser) => {
    isLoading.value = true
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: {
                action: 'edit',
                email: user.email,
                plan: user.plan
                // Note: maxInvitations will be set by backend using getPlanLimits
            }
        })
        user.success = true
        setTimeout(() => user.success = false, 2000)
        showToast('✅ Plan berhasil diupdate!')
    } catch(e: any) {
        showToast('❌ Gagal: ' + (e.statusMessage || e.message), 'error')
    } finally { 
        isLoading.value = false 
    }
}

const deleteUser = async (email: string) => {
    deletingEmail.value = null
    isLoading.value = true
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: { action: 'delete', email }
        })
        showToast('✅ User berhasil dihapus')
        fetchData()
    } catch (e: any) {
        showToast('❌ Gagal: ' + (e.statusMessage || e.message), 'error')
    } finally {
        isLoading.value = false
    }
}

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const q = searchQuery.value.toLowerCase()
    return users.value.filter(u => 
        (u.name?.toLowerCase().includes(q)) || 
        (u.email?.toLowerCase().includes(q))
    )
})

const getPlanColor = (plan: string) => {
    switch(plan) {
        case 'free': return 'text-stone-600'
        case 'regular': return 'text-blue-600'
        case 'vip': return 'text-amber-600'
        case 'vvip': return 'text-purple-600'
        default: return 'text-stone-600'
    }
}
</script>

<template>
    <div class="min-h-screen bg-stone-50 text-stone-800 p-6 font-sans">
        <div class="max-w-6xl mx-auto">
            
            <!-- Toast -->
            <Transition name="toast">
                <div v-if="toast.show" 
                    class="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-medium max-w-md"
                    :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                    {{ toast.message }}
                </div>
            </Transition>
            
            <header class="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div>
                    <h1 class="text-3xl font-bold text-stone-900">Manajemen Pengguna</h1>
                    <p class="text-stone-500 mt-1">Kelola paket dan akses pengguna.</p>
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

            <!-- Users Table -->
            <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div class="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 class="font-bold text-lg">Daftar Pengguna ({{ users.length }})</h2>
                    <div class="relative w-full md:w-64">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Cari user..." 
                            class="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-500 bg-stone-50"
                        />
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th class="p-4">Nama & Email</th>
                                <th class="p-4">Plan</th>
                                <th class="p-4">Usage</th>
                                <th class="p-4">Role</th>
                                <th class="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-stone-100">
                            <tr v-for="user in filteredUsers" :key="user.email" class="hover:bg-stone-50">
                                <td class="p-4">
                                    <div class="font-bold text-stone-900">{{ user.name }}</div>
                                    <div class="text-xs text-stone-500">{{ user.email }}</div>
                                </td>
                                <td class="p-4">
                                    <div class="relative flex items-center w-fit">
                                        <select v-model="user.plan" @change="savePlan(user)" 
                                            class="text-xs font-bold px-2 py-1 rounded bg-stone-50 border border-stone-200 outline-none focus:border-amber-500 transition-all uppercase pr-8"
                                            :class="getPlanColor(user.plan)">
                                            <option value="free">FREE</option>
                                            <option value="regular">REGULAR</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP</option>
                                        </select>
                                        <Transition name="fade-up">
                                            <div v-if="user.success" class="absolute -right-6 text-green-500 text-sm">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                        </Transition>
                                    </div>
                                </td>
                                <td class="p-4 text-stone-500">{{ user.usage || 0 }} / {{ user.maxInvitations || 1 }}</td>
                                <td class="p-4 uppercase text-xs font-bold text-stone-400">{{ user.role }}</td>
                                <td class="p-4 text-right">
                                    <template v-if="user.role !== 'admin' && user.role !== 'superuser'">
                                        <!-- Normal state -->
                                        <button v-if="deletingEmail !== user.email" @click="deletingEmail = user.email" class="text-stone-400 hover:text-red-600 transition-colors">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <!-- Confirm state -->
                                        <div v-else class="flex items-center justify-end gap-2">
                                            <span class="text-[10px] font-bold text-red-600 uppercase">Hapus?</span>
                                            <button @click="deleteUser(user.email)" class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Ya</button>
                                            <button @click="deletingEmail = null" class="bg-stone-200 text-stone-600 px-2 py-1 rounded text-xs font-bold">Batal</button>
                                        </div>
                                    </template>
                                    <span v-else class="text-xs text-stone-300 italic">Protected</span>
                                </td>
                            </tr>
                            <tr v-if="filteredUsers.length === 0">
                                <td colspan="5" class="p-10 text-center text-stone-400">
                                    <i class="fas fa-users text-4xl mb-3 block opacity-20"></i>
                                    {{ searchQuery ? 'Tidak ada hasil' : 'Belum ada pengguna' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.5s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100px); }
</style>
