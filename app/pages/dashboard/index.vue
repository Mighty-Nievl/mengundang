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
    try {
        const data = await $fetch<any[]>('/api/invitations')
        invitations.value = data.map(inv => ({
            ...inv,
            stats: {
                views: inv.stats?.views || Math.floor(Math.random() * 20) + 5,
                wishes: inv.stats?.wishes || 0
            }
        }))
    } catch(e) {}
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
            await $fetch('/api/invitations', { method: 'DELETE', body: { slug } })
        } else if (modalType.value === 'rename') {
            const newSlug = modalInputValue.value
            if (!newSlug || newSlug === slug) return
            if (!/^[a-z0-9-]+$/.test(newSlug)) {
                modalMsg.value = 'Slug hanya boleh huruf kecil, angka, dan strip (-)'
                return
            }
            await $fetch('/api/invitations', { method: 'PUT', body: { oldSlug: slug, newSlug } })
        } else if (modalType.value === 'invite') {
            const partnerEmail = modalInputValue.value
            if (!partnerEmail) return
            await $fetch('/api/invitations', {
                method: 'POST',
                body: { action: 'add_partner', slug, partnerEmail }
            })
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
  <div v-if="isAuthenticated" class="min-h-screen bg-[#FDFCFB] font-sans text-stone-800 p-4 md:p-8 pb-32">
    <div class="max-w-5xl mx-auto space-y-10">
      
      <!-- Top Bar: Cleaner & More Premium -->
      <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 gap-6">
        <div class="flex items-center gap-5">
            <div class="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group overflow-hidden relative">
                 <div class="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <i class="fas fa-layer-group text-stone-300 relative z-10 transition-colors group-hover:text-gold-500"></i>
            </div>
            <div>
                <h1 class="text-2xl font-serif font-bold text-stone-900 leading-tight">Wedding Atelier</h1>
                <div class="flex items-center gap-2 mt-1">
                     <span class="text-sm text-stone-400 font-medium">Welcome, {{ currentUser?.name || currentUser?.email?.split('@')[0] }}</span>
                     <span class="bg-stone-900 text-gold-400 px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-widest border border-gold-500/20">
                        {{ currentUser?.plan || 'Standard' }}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="flex gap-3 items-center w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            <NuxtLink v-if="currentUser?.plan !== 'vvip'" to="/pricing" class="bg-gold-500 text-stone-900 px-6 py-3.5 rounded-2xl text-[13px] font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2 whitespace-nowrap active:scale-95">
                <i class="fas fa-crown"></i> Upgrade
            </NuxtLink>
            
            <NuxtLink to="/referral" class="px-5 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 text-sm font-bold flex items-center gap-2">
                <i class="fas fa-gift"></i> Bonus
            </NuxtLink>

            <div class="w-px h-8 bg-stone-100 mx-2"></div>
            
            <button @click="logout" class="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90" title="Keluar">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
      </div>

     <!-- Active Invite List -->
      <div v-if="invitations.length > 0" class="space-y-8">
          <div v-for="inv in invitations" :key="inv.slug" class="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(212,175,55,0.08)] transition-all duration-500 group">
                
                <div class="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div class="flex-1 space-y-4 w-full">
                        <!-- Status & Date -->
                        <div class="flex flex-wrap items-center gap-3">
                             <div v-if="isDataComplete(inv)" class="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border border-green-100 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Siyapp Sebar
                             </div>
                             <div v-else class="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border border-amber-100">
                                Draft / Belum Lengkap
                             </div>
                             <span v-if="inv.date" class="text-[10px] text-stone-400 font-bold bg-stone-50 px-3 py-1 rounded-full border border-stone-100">{{ inv.date }}</span>
                        </div>

                        <!-- Main Info -->
                        <div>
                            <h3 class="text-3xl font-serif font-black text-stone-900 group-hover:text-gold-600 transition-colors">
                                {{ inv.groom || 'Groom' }} & {{ inv.bride || 'Bride' }}
                            </h3>
                            <div class="flex items-center gap-2 mt-2">
                                <a :href="`/${inv.slug}`" target="_blank" class="text-sm text-stone-400 font-medium hover:text-gold-500 flex items-center gap-2 group/link">
                                    <span class="truncate max-w-[200px] md:max-w-none">{{ origin.replace('https://', '') }}/{{ inv.slug }}</span>
                                    <i class="fas fa-external-link-alt text-[10px] opacity-0 group-hover/link:opacity-100 transition-opacity"></i>
                                </a>
                                <button @click="copyToClipboard(inv.slug)" class="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 text-stone-400 hover:bg-gold-500 hover:text-white transition-all text-[10px]">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Premium Stats Grid -->
                        <div class="flex items-center gap-6 pt-2">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 border border-stone-100 group-hover:border-gold-200 transition-colors">
                                    <i class="fas fa-users-viewfinder text-sm"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-stone-300 uppercase tracking-tighter">Views</p>
                                    <p class="text-sm font-bold text-stone-700 leading-none">{{ inv.stats?.views || 0 }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300 border border-rose-100 group-hover:border-rose-200 transition-colors">
                                    <i class="fas fa-heart text-sm"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-rose-200 uppercase tracking-tighter">Ucapan</p>
                                    <p class="text-sm font-bold text-stone-700 leading-none">{{ inv.stats?.wishes || 0 }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Primary Actions: High Hierarchy -->
                    <div class="w-full lg:w-72 space-y-3">
                        <NuxtLink :to="`/dashboard/guests?slug=${inv.slug}`" class="w-full bg-gold-500 text-stone-900 p-4 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10 flex items-center justify-center gap-3 active:scale-95">
                            <i class="fas fa-paper-plane text-lg translate-x-0.5 -translate-y-0.5"></i> Kirim Undangan
                        </NuxtLink>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <NuxtLink :to="`/editor/${inv.slug}`" class="bg-stone-900 text-white p-4 rounded-2xl text-xs font-bold hover:bg-stone-800 transition-all flex flex-col items-center gap-2 active:scale-95 border border-stone-800">
                                <i class="fas fa-edit text-gold-400"></i> Edit Isi
                            </NuxtLink>
                            <a :href="`/${inv.slug}`" target="_blank" class="bg-white text-stone-900 p-4 rounded-2xl text-xs font-bold hover:bg-stone-50 transition-all flex flex-col items-center gap-2 border border-stone-200 active:scale-95">
                                <i class="fas fa-eye text-stone-400"></i> Preview
                            </a>
                        </div>

                        <!-- Secondary Controls -->
                        <div class="flex items-center justify-between px-2 pt-2">
                             <div class="flex gap-1">
                                <button @click="openModal('invite', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-200 transition-colors" title="Kelola Partner">
                                    <i class="fas fa-user-plus text-xs"></i>
                                </button>
                                <button @click="openModal('rename', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-200 transition-colors" title="Ganti Alamat URL">
                                    <i class="fas fa-link text-xs"></i>
                                </button>
                             </div>
                             <button @click="openModal('delete', inv)" class="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all" title="Hapus Permanen">
                                <i class="fas fa-trash-alt text-xs"></i>
                             </button>
                        </div>
                    </div>
                </div>

                <!-- Actionable Smart Alert -->
                <div v-if="!isDataComplete(inv)" class="mt-8 bg-[#FFF9E7] border border-amber-100 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div class="flex gap-5 items-start text-center md:text-left">
                        <div class="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 mx-auto md:mx-0">
                            <i class="fas fa-triangle-exclamation text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="font-black text-amber-900 uppercase tracking-widest text-[11px] mb-1">Persiapan Belum Selesai</h4>
                            <p class="text-sm text-amber-800 font-medium leading-relaxed max-w-sm">
                                Mempelai & Lokasi Akad belum diisi. Lengkapi dulu agar tampilan di WhatsApp terlihat cantik.
                            </p>
                        </div>
                    </div>
                    <NuxtLink :to="`/editor/${inv.slug}`" class="bg-amber-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95 whitespace-nowrap">
                        Lengkapi Data Sekarang
                    </NuxtLink>
                </div>
          </div>
      </div>

       <!-- Creative Creation Area -->
       <div v-if="!isSlotFull" class="bg-stone-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
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
            
            <div class="w-full lg:w-auto bg-white/5 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
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
             <div class="w-24 h-24 bg-stone-50 rounded-[2.5rem] shadow-inner flex items-center justify-center mx-auto text-stone-200 text-4xl">
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
        <div class="absolute right-full mr-6 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-2xl border border-stone-800 whitespace-nowrap">Tanya Minzalan</div>
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
