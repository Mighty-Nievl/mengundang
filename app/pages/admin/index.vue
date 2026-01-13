<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['admin']
})

// Types
interface Order { id: string; userName: string; userEmail: string; plan: string; amount: number; status: string; proofUrl: string | null; createdAt: string }
interface User { id: string; email: string; name: string; role: string; plan: string; maxInvitations: number; usage?: number }
interface PayoutUser { id: string; name: string; email: string; referralBalance: number }

// State
const activeTab = ref<'orders' | 'users' | 'payouts' | 'settings'>('orders')
const isLoading = ref(false)
const orders = ref<Order[]>([])
const users = ref<User[]>([])
const payouts = ref<PayoutUser[]>([])
const searchQuery = ref('')
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' })

// Confirmations
const confirmAction = ref<{ type: string; id: string; data?: any } | null>(null)

// Settings
const upgradeEnabled = ref(true)

// Stats
interface Stats { totalUsers: number; pendingOrders: number; pendingPayouts: { count: number; amount: number }; totalRevenue: number }
const stats = ref<Stats | null>(null)

useSeoMeta({ title: 'Admin Panel', robots: 'noindex, nofollow' })

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message: msg, type }
    setTimeout(() => toast.value.show = false, 3000)
}

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

// Fetch Data
const fetchOrders = async () => {
    try { orders.value = await ($fetch as any)('/api/admin/orders') } catch (e) { console.error(e) }
}
const fetchUsers = async () => {
    try { users.value = await ($fetch as any)('/api/users') as User[] } catch (e) { console.error(e) }
}
const fetchPayouts = async () => {
    try { payouts.value = await ($fetch as any)('/api/admin/payouts') } catch (e) { console.error(e) }
}
const fetchSettings = async () => {
    try {
        const s = await ($fetch as any)('/api/admin/settings') as Record<string, string>
        upgradeEnabled.value = s.upgrade_enabled !== 'false'
    } catch (e) { console.error(e) }
}
const fetchStats = async () => {
    try { stats.value = await ($fetch as any)('/api/admin/stats') } catch (e) { console.error(e) }
}

const loadTab = async () => {
    isLoading.value = true
    if (activeTab.value === 'orders') await fetchOrders()
    else if (activeTab.value === 'users') await fetchUsers()
    else if (activeTab.value === 'payouts') await fetchPayouts()
    else if (activeTab.value === 'settings') await fetchSettings()
    isLoading.value = false
}

watch(activeTab, loadTab)
onMounted(() => { fetchStats(); loadTab() })

// Actions - Orders
const approveOrder = async (id: string) => {
    confirmAction.value = null
    isLoading.value = true
    try {
        await ($fetch as any)(`/api/admin/orders/${id}/approve`, { method: 'POST' })
        showToast('Order approved')
        await fetchOrders()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}
const rejectOrder = async (id: string) => {
    confirmAction.value = null
    isLoading.value = true
    try {
        await ($fetch as any)(`/api/admin/orders/${id}/reject`, { method: 'POST' })
        showToast('Order rejected')
        await fetchOrders()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}

// Actions - Users
const updateUserPlan = async (user: User, newPlan: string) => {
    isLoading.value = true
    try {
        await ($fetch as any)('/api/users', { method: 'POST', body: { action: 'edit', email: user.email, plan: newPlan } })
        showToast('Plan updated')
        await fetchUsers()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}
const deleteUser = async (email: string) => {
    confirmAction.value = null
    isLoading.value = true
    try {
        await ($fetch as any)('/api/users', { method: 'POST', body: { action: 'delete', email } })
        showToast('User deleted')
        await fetchUsers()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}

// Actions - Payouts
const processPayout = async (user: PayoutUser) => {
    confirmAction.value = null
    isLoading.value = true
    try {
        await ($fetch as any)('/api/admin/payouts/process', { method: 'POST', body: { userId: user.id, amount: user.referralBalance } })
        showToast('Payout processed')
        await fetchPayouts()
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}

// Actions - Settings
const toggleUpgrade = async () => {
    isLoading.value = true
    try {
        await ($fetch as any)('/api/admin/settings', { method: 'POST', body: { key: 'upgrade_enabled', value: String(!upgradeEnabled.value) } })
        upgradeEnabled.value = !upgradeEnabled.value
        showToast(`Upgrade ${upgradeEnabled.value ? 'enabled' : 'disabled'}`)
    } catch (e: any) { showToast(e.statusMessage || 'Error', 'error') }
    finally { isLoading.value = false }
}

// Computed
const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const q = searchQuery.value.toLowerCase()
    return users.value.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})
</script>

<template>
<div class="min-h-screen bg-white text-gray-900 text-sm">
    <!-- Toast -->
    <div v-if="toast.show" class="fixed top-4 right-4 z-50 px-4 py-2 rounded text-white text-xs font-medium shadow-lg transition-all"
         :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
        {{ toast.message }}
    </div>

    <!-- Header -->
    <header class="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-40">
        <div class="flex items-center gap-3">
            <span class="font-bold text-base">Admin</span>
            <span v-if="isLoading" class="text-gray-400 text-xs"><i class="fas fa-spinner fa-spin"></i></span>
        </div>
        <div class="flex items-center gap-2">
            <NuxtLink to="/admin/whatsapp" class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">WhatsApp</NuxtLink>
            <NuxtLink to="/admin/emails" class="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">Email</NuxtLink>
            <NuxtLink to="/dashboard" class="px-3 py-1.5 text-xs bg-gray-900 text-white rounded">Exit</NuxtLink>
        </div>
    </header>

    <!-- Stats Row -->
    <div v-if="stats" class="grid grid-cols-4 border-b text-center text-xs">
        <div class="py-3 border-r">
            <div class="text-lg font-bold">{{ stats.totalUsers }}</div>
            <div class="text-gray-500">Users</div>
        </div>
        <div class="py-3 border-r">
            <div class="text-lg font-bold" :class="stats.pendingOrders > 0 ? 'text-red-600' : ''">{{ stats.pendingOrders }}</div>
            <div class="text-gray-500">Orders</div>
        </div>
        <div class="py-3 border-r">
            <div class="text-lg font-bold" :class="stats.pendingPayouts.count > 0 ? 'text-amber-600' : ''">{{ stats.pendingPayouts.count }}</div>
            <div class="text-gray-500">Payouts</div>
        </div>
        <div class="py-3">
            <div class="text-lg font-bold text-green-600">{{ formatCurrency(stats.totalRevenue).replace('Rp', '') }}</div>
            <div class="text-gray-500">Revenue</div>
        </div>
    </div>

    <!-- Tabs -->
    <nav class="border-b px-4 flex gap-1 overflow-x-auto">
        <button v-for="tab in ['orders', 'users', 'payouts', 'settings']" :key="tab"
                @click="activeTab = tab as any"
                class="px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap capitalize"
                :class="activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'">
            {{ tab }}
            <span v-if="tab === 'orders' && orders.filter(o => o.status === 'pending').length" class="ml-1 bg-red-500 text-white px-1.5 rounded-full text-[10px]">
                {{ orders.filter(o => o.status === 'pending').length }}
            </span>
        </button>
    </nav>

    <!-- Content -->
    <main class="p-4 max-w-6xl mx-auto">

        <!-- ORDERS TAB -->
        <div v-if="activeTab === 'orders'">
            <div v-if="orders.length === 0" class="text-center py-12 text-gray-400">No pending orders</div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-xs text-gray-500 uppercase border-b">
                        <tr>
                            <th class="py-2 pr-4">User</th>
                            <th class="py-2 pr-4">Plan</th>
                            <th class="py-2 pr-4 text-right">Amount</th>
                            <th class="py-2 pr-4">Proof</th>
                            <th class="py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr v-for="o in orders" :key="o.id" class="hover:bg-gray-50">
                            <td class="py-3 pr-4">
                                <div class="font-medium">{{ o.userName }}</div>
                                <div class="text-xs text-gray-500">{{ o.userEmail }}</div>
                            </td>
                            <td class="py-3 pr-4 uppercase text-xs font-medium">{{ o.plan }}</td>
                            <td class="py-3 pr-4 text-right font-mono">{{ formatCurrency(o.amount) }}</td>
                            <td class="py-3 pr-4">
                                <a v-if="o.proofUrl" :href="o.proofUrl" target="_blank" class="text-blue-600 hover:underline text-xs">View</a>
                                <span v-else class="text-gray-300">-</span>
                            </td>
                            <td class="py-3 text-right">
                                <template v-if="o.status === 'pending'">
                                    <template v-if="confirmAction?.id === o.id">
                                        <span class="text-xs text-gray-500 mr-2">{{ confirmAction.type }}?</span>
                                        <button @click="confirmAction.type === 'approve' ? approveOrder(o.id) : rejectOrder(o.id)" class="text-xs px-2 py-1 bg-gray-900 text-white rounded mr-1">Yes</button>
                                        <button @click="confirmAction = null" class="text-xs px-2 py-1 border rounded">No</button>
                                    </template>
                                    <template v-else>
                                        <button @click="confirmAction = { type: 'approve', id: o.id }" class="text-xs px-2 py-1 bg-green-600 text-white rounded mr-1">✓</button>
                                        <button @click="confirmAction = { type: 'reject', id: o.id }" class="text-xs px-2 py-1 bg-red-600 text-white rounded">✗</button>
                                    </template>
                                </template>
                                <span v-else class="text-xs text-gray-400 capitalize">{{ o.status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- USERS TAB -->
        <div v-if="activeTab === 'users'">
            <div class="mb-4">
                <input v-model="searchQuery" type="text" placeholder="Search users..." class="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div v-if="filteredUsers.length === 0" class="text-center py-12 text-gray-400">No users found</div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-xs text-gray-500 uppercase border-b">
                        <tr>
                            <th class="py-2 pr-4">User</th>
                            <th class="py-2 pr-4">Plan</th>
                            <th class="py-2 pr-4">Usage</th>
                            <th class="py-2 pr-4">Role</th>
                            <th class="py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50">
                            <td class="py-3 pr-4">
                                <div class="font-medium">{{ u.name }}</div>
                                <div class="text-xs text-gray-500">{{ u.email }}</div>
                            </td>
                            <td class="py-3 pr-4">
                                <select :value="u.plan" @change="updateUserPlan(u, ($event.target as HTMLSelectElement).value)" class="text-xs px-2 py-1 border rounded uppercase font-medium bg-white">
                                    <option value="free">FREE</option>
                                    <option value="regular">REGULAR</option>
                                    <option value="vip">VIP</option>
                                    <option value="vvip">VVIP</option>
                                </select>
                            </td>
                            <td class="py-3 pr-4 text-xs text-gray-500">{{ u.usage || 0 }}/{{ u.maxInvitations }}</td>
                            <td class="py-3 pr-4 text-xs uppercase text-gray-400">{{ u.role }}</td>
                            <td class="py-3 text-right">
                                <template v-if="u.role !== 'admin' && u.role !== 'superuser'">
                                    <template v-if="confirmAction?.id === u.id">
                                        <span class="text-xs text-red-600 mr-2">Delete?</span>
                                        <button @click="deleteUser(u.email)" class="text-xs px-2 py-1 bg-red-600 text-white rounded mr-1">Yes</button>
                                        <button @click="confirmAction = null" class="text-xs px-2 py-1 border rounded">No</button>
                                    </template>
                                    <button v-else @click="confirmAction = { type: 'delete', id: u.id }" class="text-gray-400 hover:text-red-600">
                                        <i class="fas fa-trash-alt text-xs"></i>
                                    </button>
                                </template>
                                <span v-else class="text-xs text-gray-300">-</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- PAYOUTS TAB -->
        <div v-if="activeTab === 'payouts'">
            <div v-if="payouts.length === 0" class="text-center py-12 text-gray-400">No pending payouts</div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-xs text-gray-500 uppercase border-b">
                        <tr>
                            <th class="py-2 pr-4">User</th>
                            <th class="py-2 pr-4 text-right">Balance</th>
                            <th class="py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr v-for="p in payouts" :key="p.id" class="hover:bg-gray-50">
                            <td class="py-3 pr-4">
                                <div class="font-medium">{{ p.name }}</div>
                                <div class="text-xs text-gray-500">{{ p.email }}</div>
                            </td>
                            <td class="py-3 pr-4 text-right font-mono text-green-600 font-medium">{{ formatCurrency(p.referralBalance) }}</td>
                            <td class="py-3 text-right">
                                <template v-if="confirmAction?.id === p.id">
                                    <span class="text-xs text-gray-500 mr-2">Paid?</span>
                                    <button @click="processPayout(p)" class="text-xs px-2 py-1 bg-gray-900 text-white rounded mr-1">Yes</button>
                                    <button @click="confirmAction = null" class="text-xs px-2 py-1 border rounded">No</button>
                                </template>
                                <button v-else @click="confirmAction = { type: 'payout', id: p.id, data: p }" class="text-xs px-3 py-1 bg-gray-900 text-white rounded">Mark Paid</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                <b>Note:</b> Transfer dulu ke rekening user, lalu klik "Mark Paid".
            </div>
        </div>

        <!-- SETTINGS TAB -->
        <div v-if="activeTab === 'settings'" class="max-w-md">
            <div class="border rounded p-4 flex items-center justify-between">
                <div>
                    <div class="font-medium">Upgrade Feature</div>
                    <div class="text-xs text-gray-500">Allow users to purchase premium plans</div>
                </div>
                <button @click="toggleUpgrade" :disabled="isLoading" 
                        class="px-4 py-2 rounded text-sm font-medium transition-colors"
                        :class="upgradeEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'">
                    {{ upgradeEnabled ? 'ON' : 'OFF' }}
                </button>
            </div>
            
            <div class="mt-4 space-y-2">
                <NuxtLink to="/admin/whatsapp" class="block border rounded p-4 hover:bg-gray-50 transition-colors">
                    <div class="font-medium">WhatsApp Settings</div>
                    <div class="text-xs text-gray-500">Cloud API & Local Bot configuration</div>
                </NuxtLink>
                <NuxtLink to="/admin/emails" class="block border rounded p-4 hover:bg-gray-50 transition-colors">
                    <div class="font-medium">Email Settings</div>
                    <div class="text-xs text-gray-500">Email logs & template editor</div>
                </NuxtLink>
            </div>
        </div>

    </main>
</div>
</template>
