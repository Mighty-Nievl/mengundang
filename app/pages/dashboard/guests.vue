<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthClient } from '../../utils/auth-client'
import { useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'

const isAuthenticated = ref(false)
const currentUser = ref<any>(null)
const invitations = ref<any[]>([])
const selectedSlug = ref('')
const guests = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref<Record<string, boolean>>({})
const { showAlert, showConfirm } = usePremiumModal()
const route = useRoute()

// SEO
useSeoMeta({
    title: 'Kelola Tamu - Undangan Premium',
    description: 'Manajemen daftar tamu cepat ala spreadsheet.',
    robots: 'noindex, nofollow'
})

definePageMeta({
  middleware: ['auth']
})

onMounted(async () => {
    selectedSlug.value = route.query.slug as string || ''
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    if (data?.user) {
        isAuthenticated.value = true
        currentUser.value = data.user
        await fetchInvitations()
    }
})

const fetchInvitations = async () => {
    try {
        const data = await $fetch<any[]>('/api/invitations')
        invitations.value = data
        if (data.length > 0 && !selectedSlug.value) {
            selectedSlug.value = data[0].slug
        } else if (selectedSlug.value) {
            const exists = data.find(i => i.slug === selectedSlug.value)
             if (exists) fetchGuests()
        }
    } catch (e) {
        console.error('Failed to fetch invitations:', e)
    }
}

const fetchGuests = async () => {
    if (!selectedSlug.value) return
    isLoading.value = true
    try {
        guests.value = await $fetch(`/api/guests?slug=${selectedSlug.value}`)
    } catch (e) {
        console.error('Failed to fetch guests:', e)
    } finally {
        isLoading.value = false
    }
}

watch(selectedSlug, () => {
    fetchGuests()
})

// Spreadsheet Logic
const addRow = () => {
    const newGuest = {
        id: 'temp-' + uuidv4(),
        invitationSlug: selectedSlug.value,
        name: '',
        phoneNumber: '',
        note: '',
        isNew: true
    }
    guests.value.push(newGuest)
}

const saveGuestInline = async (guest: any) => {
    // Don't save if name is empty and it's temporary
    if (!guest.name && guest.id.startsWith('temp-')) return
    
    const guestId = guest.id
    isSaving.value[guestId] = true
    
    try {
        const res = await $fetch<any>('/api/guests', {
            method: 'POST',
            body: {
                id: guest.id.startsWith('temp-') ? undefined : guest.id,
                invitationSlug: selectedSlug.value,
                name: guest.name,
                phoneNumber: guest.phoneNumber,
                note: guest.note
            }
        })
        
        // Update temporary ID with real one
        if (guest.id.startsWith('temp-')) {
            guest.id = res.id
            guest.isNew = false
        }
    } catch (e) {
        console.error('Auto-save failed', e)
    } finally {
        isSaving.value[guestId] = false
    }
}

const deleteGuest = async (id: string, index: number) => {
    if (id.startsWith('temp-')) {
        guests.value.splice(index, 1)
        return
    }

    const confirmed = await showConfirm({
        title: 'Hapus Tamu',
        message: 'Yakin ingin menghapus tamu ini?',
        type: 'danger',
        confirmText: 'Ya, Hapus'
    })
    if (!confirmed) return

    try {
        await $fetch(`/api/guests/${id}`, { method: 'DELETE' })
        guests.value.splice(index, 1)
    } catch (e: any) {
        showAlert({ title: 'Gagal', message: 'Gagal menghapus data tamu', type: 'danger' })
    }
}

const getGuestLink = (guestName: string) => {
    const host = window.location.origin
    return `${host}/${selectedSlug.value}?to=${encodeURIComponent(guestName)}`
}

const copyLink = (guestName: string) => {
    if (!guestName) return
    const link = getGuestLink(guestName)
    navigator.clipboard.writeText(link)
    showAlert({ title: 'Tersalin', message: 'Link tamu berhasil disalin!', type: 'success' })
}

const isSendingWA = ref<Record<string, boolean>>({})

const shareWA = async (guest: any) => {
    if (!guest.name) {
        showAlert({ title: 'Error', message: 'Nama tamu harus diisi terlebih dahulu', type: 'danger' })
        return
    }
    if (!guest.phoneNumber) {
        showAlert({ title: 'Error', message: 'Nomor WhatsApp harus diisi terlebih dahulu', type: 'danger' })
        return
    }

    const guestId = guest.id
    isSendingWA.value[guestId] = true

    try {
        const res = await $fetch<any>('/api/wa/send-invitation', {
            method: 'POST',
            body: {
                phone: guest.phoneNumber,
                guestName: guest.name,
                invitationSlug: selectedSlug.value
            }
        })

        if (res.success) {
            showAlert({ 
                title: 'Terkirim! 🎉', 
                message: `Undangan untuk ${guest.name} sedang dikirim via WhatsApp Bot`, 
                type: 'success' 
            })
        }
    } catch (e: any) {
        console.error('Failed to send WA:', e)
        showAlert({ 
            title: 'Gagal', 
            message: e.data?.statusMessage || 'Gagal mengirim undangan via WhatsApp', 
            type: 'danger' 
        })
    } finally {
        isSendingWA.value[guestId] = false
    }
}

</script>

<template>
    <div v-if="isAuthenticated" class="min-h-screen bg-stone-50 font-sans text-stone-800 p-6 pb-20">
        <div class="max-w-7xl mx-auto space-y-8">
            
            <!-- Top Bar -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200">
                <div class="flex items-center gap-4">
                    <NuxtLink to="/dashboard" class="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-900 hover:text-white transition-all">
                        <i class="fas fa-arrow-left text-sm"></i>
                    </NuxtLink>
                    <div>
                        <h1 class="text-2xl font-serif font-bold text-stone-900">Guest Spreadsheet</h1>
                        <p class="text-sm text-stone-500">Input cepat tanpa popup. Data tersimpan otomatis.</p>
                    </div>
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <!-- Invitation Selector -->
                    <div class="relative flex-1 md:w-64">
                         <select v-model="selectedSlug" class="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm text-stone-800 appearance-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer">
                            <option v-for="inv in invitations" :key="inv.slug" :value="inv.slug">
                                {{ inv.groom }} & {{ inv.bride }}
                            </option>
                        </select>
                        <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs"></i>
                    </div>

                    <button @click="addRow" class="bg-gold-500 text-stone-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
                        <i class="fas fa-plus"></i>
                        <span>Tambah Baris</span>
                    </button>
                </div>
            </div>

            <!-- Spreadsheet Table Section -->
            <div class="bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse table-fixed min-w-[800px]">
                        <thead>
                            <tr class="bg-stone-900 text-white">
                                <th class="w-12 px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-white/10">#</th>
                                <th class="w-1/4 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Nama Tamu</th>
                                <th class="w-1/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">WhatsApp (08...)</th>
                                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Keterangan / Note</th>
                                <th class="w-48 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-stone-100">
                            <tr v-if="isLoading">
                                <td colspan="5" class="px-6 py-20 text-center">
                                    <div class="flex flex-col items-center gap-3">
                                        <i class="fas fa-spinner fa-spin text-2xl text-gold-500"></i>
                                        <p class="text-sm font-bold text-stone-400">Memuat data tamu...</p>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else-if="guests.length === 0">
                                <td colspan="5" class="px-6 py-24 text-center">
                                    <div class="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                        <div class="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 text-3xl">
                                            <i class="fas fa-table"></i>
                                        </div>
                                        <h4 class="font-bold text-stone-800 text-xl">Daftar Masih Kosong</h4>
                                        <p class="text-sm text-stone-400 leading-relaxed">Gunakan tombol "Tambah Baris" di atas untuk mulai memasukkan daftar tamu undangan Anda.</p>
                                        <button @click="addRow" class="mt-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gold-500 transition-all">Klik Disini</button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-for="(guest, idx) in guests" :key="guest.id" class="hover:bg-gold-50/30 transition-colors group">
                                <td class="px-4 py-0 text-center text-xs font-mono text-stone-300 border-r border-stone-50">
                                    {{ idx + 1 }}
                                </td>
                                <!-- Name Column -->
                                <td class="px-0 py-0 border-r border-stone-50 relative">
                                    <input 
                                        v-model="guest.name"
                                        @blur="saveGuestInline(guest)"
                                        @keyup.enter="($event.target as HTMLInputElement).blur()"
                                        placeholder="Ketik Nama..."
                                        class="w-full px-6 py-4 bg-transparent outline-none focus:bg-white focus:ring-2 ring-gold-500/20 text-sm font-bold text-stone-900 placeholder-stone-200 transition-all"
                                    />
                                    <div v-if="isSaving[guest.id]" class="absolute right-2 top-1/2 -translate-y-1/2">
                                        <i class="fas fa-spinner fa-spin text-[10px] text-gold-500"></i>
                                    </div>
                                </td>
                                <!-- Phone Column -->
                                <td class="px-0 py-0 border-r border-stone-50">
                                    <input 
                                        v-model="guest.phoneNumber"
                                        @blur="saveGuestInline(guest)"
                                        @keyup.enter="($event.target as HTMLInputElement).blur()"
                                        placeholder="08123..."
                                        class="w-full px-6 py-4 bg-transparent outline-none focus:bg-white focus:ring-2 ring-gold-500/20 text-sm font-medium text-stone-600 placeholder-stone-200 transition-all"
                                    />
                                </td>
                                <!-- Note Column -->
                                <td class="px-0 py-0 border-r border-stone-50">
                                    <input 
                                        v-model="guest.note"
                                        @blur="saveGuestInline(guest)"
                                        @keyup.enter="($event.target as HTMLInputElement).blur()"
                                        placeholder="Misal: Keluarga / Kantor"
                                        class="w-full px-6 py-4 bg-transparent outline-none focus:bg-white focus:ring-2 ring-gold-500/20 text-sm text-stone-500 placeholder-stone-100 transition-all"
                                    />
                                </td>
                                <!-- Actions -->
                                <td class="px-6 py-0 text-right">
                                    <div class="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <button @click="shareWA(guest)" :disabled="isSendingWA[guest.id]" class="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Kirim WA via Bot">
                                            <i v-if="isSendingWA[guest.id]" class="fas fa-spinner fa-spin text-xs"></i>
                                            <i v-else class="fab fa-whatsapp"></i>
                                        </button>
                                        <button @click="copyLink(guest.name)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="Salin Link">
                                            <i class="fas fa-copy text-[10px]"></i>
                                        </button>
                                        <button @click="deleteGuest(guest.id, idx)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all" title="Hapus">
                                            <i class="fas fa-trash-alt text-[10px]"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footer Quick Actions -->
                <div class="p-6 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                    <div class="flex items-center gap-4">
                         <div class="flex items-center gap-2 text-xs font-bold text-stone-400">
                             <div class="w-2 h-2 rounded-full bg-green-500"></div> Online Storage Active
                         </div>
                         <div class="w-px h-4 bg-stone-200"></div>
                         <p class="text-xs text-stone-400 italic">"Gunakan Tab atau Enter untuk pindah sel lebih cepat."</p>
                    </div>
                    <button @click="addRow" class="text-stone-900 font-bold text-sm hover:text-gold-600 transition-all flex items-center gap-2">
                        <i class="fas fa-plus-circle"></i> Tambah Baris Baru
                    </button>
                </div>
            </div>

            <!-- Stats & Feedback -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-stone-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl"></div>
                    <p class="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Terisi / Kapasitas</p>
                    <div class="flex items-end gap-2 text-3xl font-serif font-bold text-gold-400">
                        {{ guests.filter(g => g.name).length }} 
                        <span class="text-sm font-sans text-stone-500 pb-1">/ {{ currentUser?.maxGuests || 50 }} Tamu</span>
                    </div>
                </div>
                
                <div class="md:col-span-2 bg-white p-8 rounded-[2rem] border border-stone-200 flex items-center justify-between">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-gold-50 text-gold-600 rounded-2xl flex items-center justify-center text-xl">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div>
                             <h4 class="font-bold text-stone-900">Tips Penggunaan</h4>
                             <p class="text-xs text-stone-500 leading-relaxed mt-1">Gunakan format nomor HP diawali "08" untuk kemudahan. Sistem akan otomatis menyesuaikan untuk WhatsApp. Contoh: <span class="font-mono bg-stone-50 px-1">0812345678</span></p>
                        </div>
                    </div>
                    <button class="hidden lg:block text-stone-300 hover:text-stone-900 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Spreadsheet Style Focus */
input:focus {
    box-shadow: inset 0 0 0 2px rgba(212, 175, 55, 0.2);
}

/* Scrollbar styling for a cleaner look */
.overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
}
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
    background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 20px;
}

/* Animations */
.group:hover input {
    color: #000;
}
</style>
