<script setup lang="ts">
import { useAuthClient } from '../../utils/auth-client'

const isAuthenticated = ref(false)
const currentUser = ref<any>(null)
const invitations = ref<any[]>([])
const newSlug = ref('')
const createMsg = ref('')
const isLoading = ref(false)
const origin = ref('')

useSeoMeta({
  title: 'Dashboard - Undangan Premium',
  description: 'Kelola undangan pernikahan digital Anda. Edit teks, foto, dan musik kapan saja.',
  robots: 'noindex, nofollow'
})

definePageMeta({
  middleware: ['auth']
})

// Modal State
const modalActive = ref(false)
const modalType = ref<'delete' | 'rename' | 'invite' | 'stats'>('delete')
const modalData = ref<any>(null)
const modalInputValue = ref('')
const modalMsg = ref('')

// Dropdown State for Mobile
const activeDropdown = ref<string | null>(null)

onMounted(async () => {
  origin.value = window.location.origin
  const authClient = useAuthClient()
  const { data } = await authClient.getSession()
  currentUser.value = data?.user
  isAuthenticated.value = !!data?.user
  fetchInvitations()
  document.addEventListener('click', closeDropdownsOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdownsOutside)
})


const logout = async () => {
    const authClient = useAuthClient()
    await authClient.signOut()
    navigateTo('/login')
}

const fetchInvitations = async () => {
    isLoading.value = true
    try {
        const data = await $fetch<any[]>('/api/invitations')
        invitations.value = data.map(inv => ({
            ...inv,
            stats: {
                views: inv.stats?.views || 0,
                wishes: inv.stats?.wishes || 0
            }
        }))
    } catch(e) {} finally {
        isLoading.value = false
    }
}

const isSlotFull = computed(() => {
    return invitations.value.length >= (currentUser.value?.maxInvitations || 1)
})

const isDataComplete = (inv: any) => {
    const hero = inv.content?.hero
    const akad = inv.content?.events?.akad
    return hero?.groomNickname && hero?.groomNickname !== 'Groom' && 
           hero?.brideNickname && hero?.brideNickname !== 'Bride' && 
           akad?.location && akad?.location !== ''
}

const openModal = (type: 'delete' | 'rename' | 'invite' | 'stats', invitation: any) => {
    modalType.value = type
    modalData.value = invitation
    modalInputValue.value = type === 'rename' ? invitation.slug : ''
    modalActive.value = true
    modalMsg.value = ''
    activeDropdown.value = null
}

const closeModal = () => {
    modalActive.value = false
    modalData.value = null
}

const toggleDropdown = (slug: string, event: Event) => {
    event.stopPropagation()
    activeDropdown.value = activeDropdown.value === slug ? null : slug
}

const closeDropdownsOutside = () => {
    activeDropdown.value = null
}

const handleModalConfirm = async () => {
    if (!modalData.value) return
    const slug = modalData.value.slug
    
    try {
        if (modalType.value === 'delete') {
            await $fetch(`/api/invitations?slug=${slug}`, { method: 'DELETE' })
            showToast('Satu undangan berhasil dihapus 🗑️', 'info')
        } else if (modalType.value === 'rename') {
            const newSlug = modalInputValue.value
            if (!newSlug || newSlug === slug) return
            if (!/^[a-z0-9-]+$/.test(newSlug)) {
                modalMsg.value = 'Slug hanya boleh huruf kecil, angka, dan strip (-)'
                return
            }
            await $fetch('/api/invitations', { method: 'PUT', body: { oldSlug: slug, newSlug } })
            showToast('Link berhasil diganti! 🔗', 'success')
        } else if (modalType.value === 'invite') {
            const partnerEmail = modalInputValue.value
            if (!partnerEmail) return
            await $fetch('/api/invitations', {
                method: 'POST',
                body: { action: 'add_partner', slug, partnerEmail }
            })
            showToast('Partner berhasil ditambahkan! 👥', 'success')
        }
        
        fetchInvitations()
        closeModal()
    } catch (e: any) {
        modalMsg.value = 'Gagal: ' + (e.data?.statusMessage || e.statusMessage || 'Error')
    }
}

const { showAlert, showConfirm } = usePremiumModal()

const removePartner = async () => {
    if (!modalData.value) return
    const confirmed = await showConfirm({
        title: 'Hapus Akses Partner',
        message: 'Yakin ingin menghapus akses pasangan?',
        type: 'warning',
        confirmText: 'Ya, Hapus Akses'
    })
    
    if (!confirmed) return
    
    try {
        await $fetch('/api/invitations', {
            method: 'POST',
            body: { action: 'remove_partner', slug: modalData.value.slug }
        })
        fetchInvitations()
        closeModal()
    } catch (e: any) {
        modalMsg.value = 'Gagal menghapus: ' + (e.data?.statusMessage || 'Error')
    }
}

const shareToPartnerWA = () => {
    if (!modalData.value) return
    const email = modalData.value.partnerEmail || modalInputValue.value
    const message = `Halo! ✨\n\nSaya mengundang Anda untuk mengelola undangan digital kita di Undangan.\n\nLogin: ${origin.value}/login\nEmail: ${email}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

const toast = ref({ message: '', type: 'info', active: false })
const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.value = { message: msg, type, active: true }
    setTimeout(() => { toast.value.active = false }, 3000)
}

const createInvitation = async () => {
    if(!newSlug.value) return
    if(!/^[a-z0-9-]+$/.test(newSlug.value)) {
        createMsg.value = 'Hanya huruf kecil, angka, dan strip'
        return
    }
    
    if(isSlotFull.value) return showToast('Slot penuh!', 'error')
    
    isLoading.value = true
    createMsg.value = ''
    
    try {
        await $fetch('/api/invitations', { method: 'POST', body: { slug: newSlug.value } })
        createMsg.value = '✅ Berhasil!'
        showToast('Berhasil dibuat! 🎉', 'success')
        setTimeout(() => {
            newSlug.value = ''
            fetchInvitations()
        }, 1000)
    } catch (e: any) {
        createMsg.value = '❌ ' + (e.data?.statusMessage || 'Gagal')
    } finally { isLoading.value = false }
}

const copyToClipboard = (slug: string) => {
  const fullUrl = `${origin.value}/${slug}`
  navigator.clipboard.writeText(fullUrl)
  showToast('Link tersalin! 🚀', 'success') 
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFB] font-sans text-stone-800 p-4 md:p-8 pb-32">
    <!-- Skeleton Loading -->
    <DashboardSkeleton v-if="isLoading" />

    <!-- Main Dashboard -->
    <div v-if="isAuthenticated && !isLoading" class="max-w-5xl mx-auto space-y-10">
      
      <!-- Top Bar: Cleaner & More Premium -->
      <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 gap-6">
        <div class="flex items-center gap-5 w-full md:w-auto">
            <div class="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group overflow-hidden relative shrink-0">
                 <div class="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <i class="fas fa-layer-group text-stone-300 relative z-10 transition-colors group-hover:text-gold-500"></i>
            </div>
            <div class="flex-1">
                <h1 class="text-2xl font-serif font-bold text-stone-900 leading-tight">Mengundang</h1>
                <div class="flex items-center gap-2 mt-1">
                     <span class="text-sm text-stone-400 font-medium truncate max-w-[150px]">Welcome, {{ currentUser?.name || currentUser?.email?.split('@')[0] }}</span>
                     <span class="bg-stone-900 text-gold-400 px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border border-gold-500/20 shrink-0">
                        {{ currentUser?.plan || 'Standard' }}
                    </span>
                </div>
            </div>
            <!-- Mobile Menu Toggle -->
            <div class="md:hidden relative">
                 <button @click.stop="toggleDropdown('user', $event)" class="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
                    <i class="fas fa-bars"></i>
                 </button>
                 <!-- Mobile Dropdown -->
                 <div v-if="activeDropdown === 'user'" class="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-stone-100 w-48 py-2 z-50 animate-slide-up origin-top-right">
                    <NuxtLink v-if="['admin', 'superuser', 'staff'].includes(currentUser?.role)" to="/admin" class="block px-4 py-3 hover:bg-stone-50 text-sm font-bold text-stone-900 border-b border-stone-50">
                        <i class="fas fa-shield-halved mr-2 text-stone-400"></i> Admin Panel
                    </NuxtLink>
                    <NuxtLink to="/pricing" class="block px-4 py-3 hover:bg-stone-50 text-sm font-bold text-gold-600">
                        <i class="fas fa-crown mr-2"></i> Upgrade
                    </NuxtLink>
                    <NuxtLink to="/referral" class="block px-4 py-3 hover:bg-stone-50 text-sm font-bold text-emerald-600">
                        <i class="fas fa-gift mr-2"></i> Bonus
                    </NuxtLink>
                    <div class="h-px bg-stone-100 my-1"></div>
                    <button @click="logout" class="block w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-bold text-red-500">
                        <i class="fas fa-sign-out-alt mr-2"></i> Keluar
                    </button>
                 </div>
            </div>
        </div>
        
        <!-- Desktop Nav -->
        <div class="hidden md:flex gap-4 items-center">
            <!-- Admin Link -->
            <NuxtLink v-if="['admin', 'superuser', 'staff'].includes(currentUser?.role)" to="/admin" class="bg-stone-900 text-white px-5 py-3 rounded-2xl text-[13px] font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-black/10">
                <i class="fas fa-shield-halved text-gold-500"></i> Admin Panel
            </NuxtLink>

            <!-- Referral Link (CRITICAL) -->
            <NuxtLink to="/referral" class="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[13px] font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                <i class="fas fa-gift"></i> Bonus & Referral
            </NuxtLink>

            <!-- Upgrade Link -->
            <NuxtLink v-if="currentUser?.plan !== 'vvip'" to="/pricing" class="bg-gold-500 text-stone-900 px-5 py-3 rounded-2xl text-[13px] font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2">
                <i class="fas fa-crown"></i> Upgrade
            </NuxtLink>
            
            <button @click="logout" class="w-11 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all" title="Keluar">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
      </div>

     <!-- Active Invite List -->
      <div v-if="invitations.length > 0" class="space-y-8">
          <div v-for="inv in invitations" :key="inv.slug" class="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(212,175,55,0.08)] transition-all duration-500 group relative overflow-hidden">
                
                <div class="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
                    <div class="flex-1 space-y-5 w-full">
                        <!-- Head: Status & Tools -->
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <!-- Status Badges -->
                            <div class="flex items-center gap-3">
                                 <div v-if="isDataComplete(inv)" class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Siap Disebar
                                 </div>
                                 <div v-else class="bg-stone-100 text-stone-500 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest border border-stone-200 flex items-center gap-2">
                                    <i class="fas fa-pen-ruler"></i> Draft Mode
                                 </div>
                                 <span v-if="inv.date" class="hidden md:inline-block text-[10px] text-stone-400 font-bold bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">{{ inv.date }}</span>
                            </div>

                            <!-- Mini Tools (Always Visible) -->
                            <div class="flex items-center gap-2">
                                <button @click="openModal('invite', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all" title="Kelola Partner">
                                    <i class="fas fa-user-plus text-xs"></i>
                                </button>
                                <button @click="openModal('rename', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all" title="Ganti URL">
                                    <i class="fas fa-link text-xs"></i>
                                </button>
                                <button @click="openModal('delete', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Hapus">
                                    <i class="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Main Info -->
                        <div>
                            <h3 class="text-4xl font-serif font-black text-stone-900 group-hover:text-gold-600 transition-colors">
                                {{ inv.groom || 'Groom' }} & {{ inv.bride || 'Bride' }}
                            </h3>
                            <div class="flex items-center gap-2 mt-3">
                                <a :href="`/${inv.slug}`" target="_blank" class="text-sm text-stone-400 font-bold hover:text-gold-500 flex items-center gap-2 group/link bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 transition-colors">
                                    <i class="fas fa-globe text-xs opacity-50"></i>
                                    <span class="truncate max-w-[200px] md:max-w-none">{{ origin.replace('https://', '') }}/{{ inv.slug }}</span>
                                </a>
                                <button @click="copyToClipboard(inv.slug)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-50 text-stone-400 hover:bg-gold-500 hover:text-white transition-all text-xs border border-stone-100">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Compact Stats -->
                        <div class="flex items-center gap-6 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-eye text-stone-300 text-xs"></i>
                                <span class="text-xs font-bold text-stone-600">{{ inv.views || 0 }} Views</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-heart text-stone-300 text-xs"></i>
                                <span class="text-xs font-bold text-stone-600">{{ inv.wishes || 0 }} Ucapan</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Action Center -->
                    <div class="w-full lg:w-80 space-y-3 mt-4 lg:mt-0">
                        <!-- Primary Action: Always Guests & Share -->
                        <NuxtLink :to="`/dashboard/guests?slug=${inv.slug}`" class="w-full bg-gold-500 text-stone-900 p-4 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10 flex items-center justify-center gap-3 active:scale-95 group/btn">
                            <i class="fas fa-paper-plane text-lg group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform"></i> 
                            Kelola Tamu & Kirim
                        </NuxtLink>
                        
                        <!-- Secondary Grid: Edit, Preview, WA -->
                        <div class="grid grid-cols-3 gap-3">
                            <NuxtLink :to="`/editor/${inv.slug}`" class="bg-white text-stone-600 p-4 rounded-2xl text-xs font-bold hover:bg-stone-50 transition-all flex flex-col items-center gap-2 active:scale-95 border border-stone-200">
                                <i class="fas fa-edit text-stone-400"></i> Edit Isi
                            </NuxtLink>
                            <a :href="`/${inv.slug}`" target="_blank" class="bg-white text-stone-600 p-4 rounded-2xl text-xs font-bold hover:bg-stone-50 transition-all flex flex-col items-center gap-2 border border-stone-200 active:scale-95">
                                <i class="fas fa-eye text-stone-400"></i> Preview
                            </a>
                            <NuxtLink :to="`/dashboard/whatsapp?slug=${inv.slug}`" class="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 border border-emerald-100 active:scale-95">
                                <i class="fab fa-whatsapp"></i> Broadcast
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Dark System Alert (Replaces Amber Box) -->
                <div v-if="!isDataComplete(inv)" class="mt-6 bg-stone-50 border border-stone-100 rounded-2xl p-4 flex gap-4 items-center relative z-10 group-hover:bg-amber-50/50 group-hover:border-amber-100 transition-colors">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-amber-500 text-lg">
                        <i class="fas fa-triangle-exclamation"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-[11px] font-black text-stone-400 uppercase tracking-wider mb-0.5">Sistem Deteksi</p>
                        <p class="text-xs font-bold text-stone-600">Data mempelai belum lengkap.</p>
                    </div>
                    <NuxtLink :to="`/editor/${inv.slug}`" class="text-[10px] font-black uppercase underline text-stone-900 hover:text-gold-600">
                        Fix Now
                    </NuxtLink>
                </div>
          </div>
      </div>

       <!-- Creative Creation Area -->
       <div v-if="!isSlotFull" class="bg-stone-900 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
        <!-- Abstract Background -->
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-gold-400/5 rounded-full blur-[80px] group-hover:bg-gold-500/10 transition-all duration-1000"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-stone-800/20 rounded-full blur-[80px]"></div>

        <div class="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div class="flex-1 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400/20 to-gold-600/20 text-gold-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-gold-500/10">
                    <i class="fas fa-sparkles animate-pulse"></i> New Invitation
                </div>
                <h2 class="font-serif font-black text-4xl mb-3 text-white leading-tight">
                    Mulai Undangan Baru
                </h2>
                <p class="text-stone-400 text-base max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">Buat link khusus yang mudah diingat untuk hari bahagia Anda nanti.</p>
            </div>
            
            <div class="w-full lg:w-auto bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
                <form @submit.prevent="createInvitation" class="flex flex-col sm:flex-row gap-2">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <span class="text-stone-600 text-[13px] font-bold">{{ origin.replace('https://', '') }}/</span>
                        </div>
                        <input v-model="newSlug" 
                            type="text" 
                            placeholder="nama-link" 
                            class="pl-[120px] md:pl-[140px] pr-6 py-5 bg-black/40 text-white placeholder-stone-700 rounded-3xl border border-stone-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none w-full sm:w-80 transition-all font-bold text-sm"
                            required
                        />
                    </div>
                    <button :disabled="isLoading" class="bg-white text-stone-900 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gold-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap">
                        <i v-if="isLoading" class="fas fa-circle-notch fa-spin"></i>
                        <span v-else>Ciptakan <i class="fas fa-chevron-right ml-2 text-[10px]"></i></span>
                    </button>
                </form>
                <p v-if="createMsg" class="mt-3 text-center text-xs font-bold" :class="createMsg.includes('Berhasil') ? 'text-green-400' : 'text-rose-400'">
                    {{ createMsg }}
                </p>
            </div>
        </div>
      </div>
      
       <!-- Empty Slot Reached -->
        <div v-if="invitations.length === 0 && isSlotFull" class="text-center py-24 space-y-6">
             <div class="w-24 h-24 bg-stone-50 rounded-3xl shadow-inner flex items-center justify-center mx-auto text-stone-200 text-4xl">
                <i class="fas fa-lock"></i>
            </div>
            <div class="space-y-2">
                <h3 class="font-serif font-black text-2xl text-stone-900">Slot Belum Tersedia</h3>
                <p class="text-stone-400 max-w-xs mx-auto font-medium">Silakan upgrade paket untuk mulai membuat undangan digital pertama Anda.</p>
            </div>
            <NuxtLink to="/pricing" class="inline-block bg-stone-900 text-gold-400 px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl active:scale-95 border border-gold-500/20">
                Lihat Pilihan Paket
            </NuxtLink>
        </div>

    </div>

    <!-- Modals (Custom Styled) -->
    <Transition name="fade">
        <div v-if="modalActive" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-stone-950/80 backdrop-blur-md" @click="closeModal"></div>
            <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up border border-white/20">
                <div class="p-10">
                    <div class="flex items-center gap-5 mb-8">
                        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                             :class="{
                                 'bg-red-50 text-red-500': modalType === 'delete',
                                 'bg-gold-50 text-gold-600': modalType === 'rename',
                                 'bg-emerald-50 text-emerald-600': modalType === 'invite'
                             }">
                            <i class="fas" :class="{
                                'fa-trash-can': modalType === 'delete',
                                'fa-link-slash': modalType === 'rename',
                                'fa-user-friends': modalType === 'invite'
                            }"></i>
                        </div>
                        <div>
                            <h3 class="font-serif font-black text-2xl text-stone-900 leading-tight">
                                {{ modalType === 'delete' ? 'Hapus' : modalType === 'rename' ? 'Ganti URL' : 'Tambah Partner' }}
                            </h3>
                            <p class="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                {{ modalType === 'delete' ? 'Konfirmasi Penghapusan' : modalType === 'rename' ? 'Alamat Link Baru' : 'Akses Kolaborasi' }}
                            </p>
                        </div>
                    </div>

                    <div v-if="modalType === 'delete'" class="space-y-6">
                         <div class="bg-red-50 p-6 rounded-3xl border border-red-100">
                            <p class="text-red-800 text-xs font-bold leading-relaxed">
                                Mohon ketik nama link <span class="bg-white px-2 py-1 rounded-lg border border-red-200 mx-1">{{ modalData.slug }}</span> di bawah ini:
                            </p>
                            <input v-model="modalInputValue" class="w-full mt-4 p-4 border border-red-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white uppercase" />
                         </div>
                         <div class="flex gap-3">
                            <button @click="closeModal" class="flex-1 bg-stone-50 text-stone-400 font-bold py-4 rounded-2xl hover:bg-stone-100 transition-colors">Batal</button>
                            <button @click="handleModalConfirm" :disabled="modalInputValue.toLowerCase() !== modalData.slug.toLowerCase()" class="flex-1 bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-20 active:scale-95 transition-all">Hapus! </button>
                         </div>
                    </div>

                    <div v-else class="space-y-6">
                         <div>
                            <input v-model="modalInputValue" :placeholder="modalType === 'rename' ? 'romeo-juliet' : 'email@partner.com'" class="w-full p-5 bg-stone-50 border-2 border-stone-50 rounded-2xl focus:border-gold-500 focus:bg-white outline-none font-bold text-stone-800 transition-all" />
                            <p class="text-[10px] text-stone-400 mt-3 italic text-center px-4">"{{ modalType === 'rename' ? 'Satu kali ganti maka alamat lama tidak akan bisa diakses kembali.' : 'Pasangan Anda bisa membantu mengisi data undangan.' }}"</p>
                         </div>
                         <div class="flex gap-3">
                            <button @click="closeModal" class="flex-1 bg-stone-100 text-stone-400 font-bold py-4 rounded-2xl hover:bg-stone-200 transition-colors">Batal</button>
                            <button @click="handleModalConfirm" class="flex-1 bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all">Simpan</button>
                         </div>
                    </div>
                    
                    <p v-if="modalMsg" class="mt-6 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">{{ modalMsg }}</p>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Support Floating -->
    <a href="https://wa.me/6282265030113" target="_blank" class="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-90 transition-all z-50 group">
        <i class="fab fa-whatsapp"></i>
        <div class="absolute right-full mr-6 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl border border-stone-800 whitespace-nowrap">Tanya Admin</div>
    </a>

    <!-- Toast Notification -->
    <Transition name="toast">
        <div v-if="toast.active" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-[0_15px_50px_rgb(0,0,0,0.1)] border bg-white border-gold-400">
             <i class="fas fa-check-circle text-gold-500 text-xl"></i>
             <p class="text-sm font-black text-stone-900 tracking-tight">{{ toast.message }}</p>
        </div>
    </Transition>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { 
    from { opacity: 0; transform: translateY(30px) scale(0.9); } 
    to { opacity: 1; transform: translateY(0) scale(1); } 
}

.toast-enter-active, .toast-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 40px); }
</style>
