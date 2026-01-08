<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthClient } from '../../utils/auth-client'


const currentUser = ref<any>(null)
const { showAlert, showConfirm } = usePremiumModal()

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

useSeoMeta({
  title: `Edit: ${slug} - Undangan Premium`,
  robots: 'noindex, nofollow'
})

const form = ref<any>({
  meta: {}, hero: {}, cover: {}, quote: {}, story: [], groom: {}, bride: {}, events: { akad: {}, resepsi: {} }, gift: {}, rsvp: {}, music: {}, gallery: []
})

const isLoading = ref(false)
const saveStatus = ref('')
const driveFolderUrl = ref('')
const isSyncingDrive = ref(false)
const host = ref('')

const getDriveIdFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Detect "bad" temporary drive-storage link
    if (url.includes('drive-storage.googleapis.com') || url.includes('googleusercontent.com/drive-storage')) {
        return 'BAD_LINK_TEMPORARY';
    }

    const folderMatch = url.match(/folders\/([-\w]+)/);
    if (folderMatch) return folderMatch[1] || null;
    
    const fileMatch = url.match(/d\/([-\w]+)/);
    if (fileMatch) return fileMatch[1] || null;
    
    const idMatch = url.match(/[?&]id=([-\w]+)/);
    if (idMatch) return idMatch[1] || null;

    if (/^[-\w]{25,}$/.test(url)) return url;
    
    return null;
}

const convertToDriveUrl = (url: string) => {
    const id = getDriveIdFromUrl(url)
    if (id === 'BAD_LINK_TEMPORARY') return 'BAD_LINK_TEMPORARY'
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
    return url
}

useHead({
    meta: [
        { name: 'referrer', content: 'no-referrer' }
    ]
})

const driveMsg = ref<Record<string, string>>({})

// Helper to get nested value
const getNestedValue = (obj: any, path: string) => {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !current.hasOwnProperty(part)) {
      return undefined
    }
    current = current[part]
  }
  return current
}

// Helper to set nested value
const setNestedValue = (obj: any, path: string, value: any) => {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current === null || typeof current !== 'object') {
      return // Cannot set value if path is invalid
    }
    if (!current.hasOwnProperty(part) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {}
    }
    current = current[part]
  }
  if (current !== null && typeof current === 'object') {
    current[parts[parts.length - 1]] = value
  }
}

// Image Compression Helper
const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const max_size = 1200; // Max dimension

                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob as Blob);
                }, 'image/jpeg', 0.8);
            };
        };
    });
}

const checkAndConvertDriveLink = (path: string, index: number | null = null) => {
    let val = ''
    if (path === 'groom.image') val = form.value.groom.image
    if (path === 'bride.image') val = form.value.bride.image
    if (path === 'meta.image') val = form.value.meta.image
    if (path === 'cover.backgroundImage') val = form.value.cover.backgroundImage
    if (path === 'hero.backgroundImage') val = form.value.hero.backgroundImage
    if (path === 'gift.qrisUrl') val = form.value.gift.qrisUrl
    if (path === 'gallery' && index !== null) val = form.value.gallery[index]
    
    if (val && (val.includes('drive.google') || val.includes('googleusercontent') || val.includes('/d/'))) {
        const newUrl = convertToDriveUrl(val)
        const msgKey = index !== null ? `gallery.${index}` : path

        if (newUrl === 'BAD_LINK_TEMPORARY') {
             driveMsg.value[msgKey] = '❌ Gunakan Link "Share" (Bukan copy path)'
             return
        }

        if (newUrl !== val) {
            if (path === 'groom.image') form.value.groom.image = newUrl
            if (path === 'bride.image') form.value.bride.image = newUrl
            if (path === 'meta.image') form.value.meta.image = newUrl
            if (path === 'cover.backgroundImage') form.value.cover.backgroundImage = newUrl
            if (path === 'hero.backgroundImage') form.value.hero.backgroundImage = newUrl
            if (path === 'gift.qrisUrl') form.value.gift.qrisUrl = newUrl
            if (path === 'gallery' && index !== null) form.value.gallery[index] = newUrl
            
            driveMsg.value[msgKey] = '✅ Link Drive Berhasil Dikonversi!'
            setTimeout(() => {
                delete driveMsg.value[msgKey]
            }, 4000)
        }
    }
}

const syncDriveGallery = async () => {
    if (!driveFolderUrl.value) return showAlert({ title: 'Input Kosong', message: 'Masukkan Link Folder Google Drive dulu', type: 'warning' })
    
    isSyncingDrive.value = true
    try {
        // @ts-ignore
        const files: any[] = await $fetch('/api/drive/list' as any, {
            params: { url: driveFolderUrl.value }
        })
        
        if (files.length === 0) {
            showAlert({ title: 'Folder Kosong', message: 'Tidak ditemukan gambar di folder tersebut. Pastikan folder Publik/Anyone with Link.', type: 'warning' })
        } else {
            const confirmed = await showConfirm({ 
                title: 'Sync Galeri', 
                message: `Ditemukan ${files.length} gambar. Tambahkan ke galeri?`,
                type: 'info'
            })
            if(confirmed) {
                if (!form.value.gallery) form.value.gallery = []
                files.forEach(f => {
                    if (!form.value.gallery.includes(f.url)) {
                        form.value.gallery.push(f.url)
                    }
                })
                showAlert({ title: 'Berhasil', message: 'Foto-foto berhasil ditambahkan ke galeri!', type: 'success' })
                driveFolderUrl.value = ''
            }
        }
    } catch (e: any) {
        showAlert({ title: 'Gagal Sync', message: 'Terjadi kesalahan: ' + (e.statusMessage || e.message), type: 'danger' })
    } finally {
        isSyncingDrive.value = false
    }
}

const formattedStartTime = computed({
    get() {
        const s = form.value.music?.startTime || 0
        const m = Math.floor(s / 60).toString().padStart(2, '0')
        const sec = (s % 60).toString().padStart(2, '0')
        return `${m}:${sec}`
    },
    set(val: string) {
        if (!form.value.music) form.value.music = {}
        const [m, s] = val.split(':').map(Number)
        if (m !== undefined && s !== undefined && !isNaN(m) && !isNaN(s)) {
            form.value.music.startTime = (m * 60) + s
        }
    }
})

// File Upload Handler
const handleFileUpload = async (event: Event, path: string, index?: number) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    saveStatus.value = 'Mengompres...'
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressed, 'upload.jpg')

    isLoading.value = true
    saveStatus.value = 'Mengupload...'
    try {
        const res = await $fetch<{ url: string }>('/api/upload', {
            method: 'POST',
            body: formData
        })

        if (index !== undefined) {
             form.value.gallery[index] = res.url
        } else {
            const parts = path.split('.')
            if (parts.length === 2) {
                form.value[parts[0]][parts[1]] = res.url
            } else {
                form.value[parts[0]] = res.url
            }
        }
        await saveData(true)
        saveStatus.value = 'Foto berhasil diunggah!'
        setTimeout(() => saveStatus.value = '', 3000)
    } catch (e) {
        console.error(e)
        showAlert({ title: 'Gagal Upload', message: 'Gagal mengunggah foto. Silakan coba lagi.', type: 'danger' })
    } finally {
        isLoading.value = false
    }
}

const addGalleryImage = () => {
    if (!form.value.gallery) form.value.gallery = []
    form.value.gallery.push('')
}

const removeGalleryImage = (idx: number) => {
    form.value.gallery.splice(idx, 1)
}

const addBankAccount = () => {
    if (!form.value.gift.accounts) form.value.gift.accounts = []
    form.value.gift.accounts.push({ bankName: '', number: '', name: '' })
}

const removeBankAccount = (idx: number) => {
    form.value.gift.accounts.splice(idx, 1)
}

definePageMeta({
  middleware: ['auth']
})

onMounted(async () => {
    host.value = window.location.host
    const authClient = useAuthClient()
    const { data } = await authClient.getSession()
    currentUser.value = data?.user
    fetchData()
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const data: any = await $fetch(`/api/v2-content?slug=${slug}&v=${Date.now()}`)
    
    // Authorization Check
    if (!data._auth?.isAuthorized) {
        router.push('/unauthorized')
        return
    }

    form.value = data || form.value
    // Ensure nested objects exist
    if (!form.value.meta) form.value.meta = {}
    if (!form.value.cover) form.value.cover = {}
    if (!form.value.gift) form.value.gift = {}
    if (!form.value.quote) form.value.quote = {}
    if (!form.value.story) form.value.story = []
    if (!form.value.music) form.value.music = {}
    if (!form.value.gallery) form.value.gallery = []
  } catch (e: any) { 
    console.error(e) 
    if (e.statusCode === 403 || e.statusCode === 401) {
        showAlert({ title: 'Akses Ditolak', message: 'Sesi berakhir atau akses ditolak. Silakan login kembali.', type: 'danger' }).then(() => {
            router.push('/login')
        })
    }
  } finally { isLoading.value = false }
}

const saveData = async (silent = false) => {
  if (!silent) isLoading.value = true
  try {
    if (!form.value.meta) form.value.meta = {}
    if (!form.value.cover) form.value.cover = {}
    if (!form.value.quote) form.value.quote = {}
    if (!form.value.story) form.value.story = []
    form.value.meta.updatedAt = Date.now() // Force metadata refresh
    
    await $fetch(`/api/v2-content?slug=${slug}`, { method: 'POST', body: form.value })
    
    if (!silent) {
        saveStatus.value = 'Berhasil Disimpan!'
        setTimeout(() => saveStatus.value = '', 3000)
    } else {
        saveStatus.value = 'Tersimpan otomatis...'
        setTimeout(() => saveStatus.value = '', 1500)
    }
  } catch (e) {
    saveStatus.value = 'Gagal menyimpan!'
  } finally { isLoading.value = false }
}
const uploadFile = async (file: File) => {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressed, 'upload.jpg')
    try {
        const res = await $fetch<{ url: string }>('/api/upload', {
            method: 'POST',
            body: formData
        })
        return res.url
    } catch (e) {
        showAlert({ title: 'Gagal Upload', message: 'Terjadi kesalahan saat mengunggah gambar.', type: 'danger' })
        return null
    }
}

const handlePaste = async (event: ClipboardEvent, path: string, index: number | null = null) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
               saveStatus.value = 'Mengupload...'
               const url = await uploadFile(file)
               if (url) {
                   // Assign to nested path
                   if (path === 'groom.image') form.value.groom.image = url
                   if (path === 'bride.image') form.value.bride.image = url
                   if (path === 'meta.image') form.value.meta.image = url
                   if (path === 'cover.backgroundImage') form.value.cover.backgroundImage = url
                   if (path === 'hero.backgroundImage') form.value.hero.backgroundImage = url
                   if (path === 'gift.qrisUrl') form.value.gift.qrisUrl = url
                   if (path === 'gallery') {
                       if (index !== null && form.value.gallery) form.value.gallery[index] = url
                       else if (index === null) {
                           if (!form.value.gallery) form.value.gallery = []
                           form.value.gallery.push(url)
                       }
                   }
                   saveStatus.value = 'Gambar Terupload!'
                   setTimeout(() => saveStatus.value = '', 2000)
               }
                }
            }
    }
}
// End of setup
// UI State for Tabs
const activeTab = ref(route.query.tab as string || 'hero')
const sidebarExpanded = ref(false)
const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'fas fa-star' },

    { id: 'cover', label: 'Halaman Cover', icon: 'fas fa-book-open' },
    { id: 'quote', label: 'Ayat Suci / Quotes', icon: 'fas fa-quran' },
    { id: 'story', label: 'Love Story', icon: 'fas fa-heart' },
    { id: 'mempelai', label: 'Data Mempelai', icon: 'fas fa-user-friends' },
    { id: 'acara', label: 'Rangkaian Acara', icon: 'fas fa-calendar-alt' },
    { id: 'galeri', label: 'Galeri Foto', icon: 'fas fa-images' },
    { id: 'hadiah', label: 'Amplop & QRIS', icon: 'fas fa-gift' },
    { id: 'tamu', label: 'Daftar Tamu', icon: 'fas fa-user-tag' },
    { id: 'musik', label: 'Musik Latar', icon: 'fas fa-music' },
    { id: 'settings', label: 'Pengatur & SEO', icon: 'fas fa-cog' },
]

// Guest List Logic
const guestNameInput = ref('')
const generatedGuestLink = computed(() => {
    if (!guestNameInput.value) return ''
    const encodedName = encodeURIComponent(guestNameInput.value)
    return `${window.location.origin}/${slug}?to=${encodedName}`
})

const copyGuestLink = () => {
    if (!generatedGuestLink.value) return
    navigator.clipboard.writeText(generatedGuestLink.value)
    showAlert({ title: 'Tersalin', message: 'Link tamu berhasil disalin ke clipboard!', type: 'success' })
}

const shareGuestWA = () => {
    if (!generatedGuestLink.value) return
    const message = `Halo ${guestNameInput.value}! ✨\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang bapak/ibu/saudara/i untuk hadir di acara pernikahan kami.\n\nDetail undangan dapat dilihat pada link di bawah ini:\n${generatedGuestLink.value}\n\nMerupakan suatu kebahagiaan bagi kami apabila bapak/ibu/saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

// Rename Slug Logic
const newSlugInput = ref(slug)
const isRenaming = ref(false)

const renameSlug = async () => {
    if (!newSlugInput.value || newSlugInput.value === slug) return
    if(!/^[a-z0-9-]+$/.test(newSlugInput.value)) {
        return showAlert({ title: 'Link Tidak Valid', message: 'Link hanya boleh huruf kecil, angka, dan strip (-)', type: 'warning' })
    }
    
    const confirmed = await showConfirm({
        title: 'Ubah Link Undangan',
        message: `Yakin ingin mengubah link menjadi "${newSlugInput.value}"? Link lama tidak akan bisa diakses lagi.`,
        type: 'danger',
        confirmText: 'Ya, Ubah Link'
    })

    if(!confirmed) return

    isRenaming.value = true
    try {
        await $fetch('/api/invitations', {
            method: 'PUT',
            body: {
                oldSlug: slug,
                newSlug: newSlugInput.value
            }
        })
        showAlert({ title: 'Berhasil', message: 'Link berhasil diubah! Mengalihkan ke halaman baru...', type: 'success' }).then(() => {
            window.location.href = `/editor/${newSlugInput.value}?tab=settings`
        })
    } catch (e: any) {
        showAlert({ 
            title: 'Gagal Ubah Link', 
            message: e.statusMessage || 'Gagal mengubah link. Mungkin link sudah dipakai orang lain.', 
            type: 'danger' 
        })
    } finally {
        isRenaming.value = false
    }
}

// Scroll to top and update URL when switching tabs
watch(activeTab, (newTab) => {
    router.replace({ query: { ...route.query, tab: newTab } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
})

// --- REAL-TIME PREVIEW LOGIC ---
const previewIframe = ref<HTMLIFrameElement | null>(null)

// Watch deep changes in form and send to iframe
watch(form, (newVal) => {
    if (previewIframe.value && previewIframe.value.contentWindow) {
        previewIframe.value.contentWindow.postMessage({
            type: 'PREVIEW_UPDATE',
            data: JSON.parse(JSON.stringify(newVal)) // Ensure plain object
        }, '*')
    }
}, { deep: true })

// --- AUTO SCALE PREVIEW ---
const previewContainer = ref<HTMLElement | null>(null)
const previewScale = ref(1)

const updateScale = () => {
    if (!previewContainer.value) return
    
    // Safety buffer
    const paddingX = 64 // 32px left + 32px right
    const paddingY = 64 // 32px top + 32px bottom (approx)

    const containerW = previewContainer.value.offsetWidth
    const containerH = previewContainer.value.offsetHeight
    
    if (containerW === 0 || containerH === 0) return

    const targetW = 375
    const targetH = 812

    // Scale to fit width
    const scaleW = (containerW - paddingX) / targetW
    // Scale to fit height
    const scaleH = (containerH - paddingY) / targetH

    // Choose the smaller scale to ensure it fits BOTH dimensions
    let scale = Math.min(scaleW, scaleH)
    
    // Clamp scale:
    // Max 1.0 (don't zoom in larger than actual phone size)
    // Min 0.5 (don't get too tiny)
    scale = Math.min(Math.max(scale, 0.5), 1.0)
    
    previewScale.value = scale
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateScale)
        // Initial check with delay to ensure layout is stable
        setTimeout(updateScale, 100)
        setTimeout(updateScale, 500)
    }
})

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateScale)
    }
})

</script>

<style scoped>
.label-input {
    @apply block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider;
}
.input-field {
    @apply w-full border border-stone-200 p-3 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all;
}
.btn-icon {
    @apply w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center bg-stone-50 text-stone-600 rounded-lg hover:bg-gold-100 hover:text-gold-600 border border-stone-200 transition-all active:scale-95;
}
.text-success {
    @apply text-[10px] font-bold text-green-600;
}
.text-hint {
    @apply text-[10px] text-gray-400;
}
.text-success {
    @apply text-[10px] text-green-600 font-bold;
}

/* Hide scrollbar for tab navigation on mobile */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom scrollbar for vertical sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 2px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a29e;
}

/* Fade slide transition for sidebar labels */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Simple fade animation */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>
  <div class="h-screen w-full bg-stone-100 font-sans text-stone-800 flex flex-col overflow-hidden">
    <!-- Navbar Fixed -->
    <div class="bg-white border-b border-stone-200 h-16 flex-shrink-0 flex items-center justify-between px-6 z-30">
        <div class="flex items-center gap-4">
             <NuxtLink to="/dashboard" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-800 hover:text-white transition-colors" title="Kembali ke Dashboard">
                <i class="fas fa-arrow-left"></i>
             </NuxtLink>
            <div class="flex flex-col">
                <h1 class="text-sm font-bold flex items-center gap-2">
                    Edit: {{ slug }}
                    <span v-if="saveStatus" class="text-[10px] font-bold text-green-600 animate-pulse bg-green-50 px-2 py-0.5 rounded-full">{{ saveStatus }}</span>
                </h1>
            </div>
        </div>
        
        <div class="flex gap-3 items-center">
             <div class="hidden lg:flex items-center gap-2 mr-4 text-xs font-bold text-stone-400">
                <i class="fas fa-desktop"></i> Split View Active
             </div>
             <a :href="`/${slug}`" target="_blank" class="px-4 py-2 bg-stone-100 text-stone-600 font-bold text-xs rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2">
                <i class="fas fa-external-link-alt"></i> Live Site
             </a>
             <button @click="saveData(false)" :disabled="isLoading" class="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-lg hover:bg-gold-600 transition-colors shadow-sm flex items-center gap-2">
                <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                <span>Simpan</span>
             </button>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- LEFT PANEL: Editor Form (Scrollable) -->
      <div class="w-full lg:w-[60%] xl:w-[70%] flex-shrink-0 bg-stone-50 border-r border-stone-200 flex flex-col lg:flex-row h-full overflow-hidden relative z-20 shadow-xl lg:shadow-none">
          
          <!-- Tab Navigation Sidebar (Desktop Only) -->
          <div class="hidden lg:flex flex-shrink-0 flex-col bg-white border-r border-stone-100 overflow-y-auto py-3 transition-all duration-300"
               :class="sidebarExpanded ? 'w-48' : 'w-16'">
               <!-- Toggle Button -->
               <button @click="sidebarExpanded = !sidebarExpanded" 
                       class="mx-2 mb-3 p-2 rounded-lg hover:bg-stone-100 transition-all text-stone-500 hover:text-stone-900 flex items-center justify-center">
                   <i :class="sidebarExpanded ? 'fas fa-chevron-left' : 'fas fa-chevron-right'" class="text-xs"></i>
               </button>
               
               <div class="flex flex-col gap-0.5">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        class="w-full py-2.5 px-3 flex items-center gap-3 transition-all relative hover:bg-stone-50 group"
                        :class="[
                            activeTab === tab.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600',
                            sidebarExpanded ? 'justify-start' : 'justify-center'
                        ]"
                    >
                        <!-- Active Indicator -->
                         <div v-if="activeTab === tab.id" class="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-gold-500 rounded-r-lg"></div>
                         
                         <div class="w-10 h-10 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
                              :class="activeTab === tab.id ? 'bg-stone-900 text-gold-500 shadow-xl shadow-stone-900/20' : 'text-stone-300 group-hover:bg-stone-100 group-hover:text-stone-600'">
                            <i :class="tab.icon" class="text-sm"></i>
                        </div>
                        
                        <Transition name="fade-slide">
                            <span v-if="sidebarExpanded" class="text-sm font-bold whitespace-nowrap">
                                {{ tab.label }}
                            </span>
                        </Transition>
                    </button>
               </div>
          </div>


          <!-- Mobile Tab Navigation (Horizontal Scroll) -->
          <div class="lg:hidden flex-shrink-0 bg-white border-b border-stone-200 z-30">
               <div class="flex overflow-x-auto no-scrollbar py-3 px-4 gap-2">
                   <button 
                       v-for="tab in tabs" 
                       :key="tab.id"
                       @click="activeTab = tab.id"
                       class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
                       :class="activeTab === tab.id 
                           ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20' 
                           : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100'"
                   >
                       <i :class="tab.icon"></i>
                       {{ tab.label }}
                   </button>
               </div>
          </div>

          <!-- Form Scroll Area -->
           <div class="flex-1 overflow-y-auto p-6 scroll-smooth bg-stone-50/50">
             <form @submit.prevent="saveData" class="space-y-8 pb-20">

            
            <!-- Tab: Hero -->
            <div v-show="activeTab === 'hero'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-star text-gold-500"></i> Hero Section (Tampilan Atas)
                    </h2>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="label-input">Nama Panggilan Pria</label>
                        <input v-model="form.hero.groomNickname" placeholder="Contoh: Rizky" @blur="saveData(true)" class="input-field" />
                    </div>
                    <div>
                        <label class="label-input">Nama Panggilan Wanita</label>
                        <input v-model="form.hero.brideNickname" placeholder="Contoh: Anisa" @blur="saveData(true)" class="input-field" />
                    </div>
                    <div class="col-span-1 md:col-span-2">
                        <label class="label-input">Tanggal (Teks Utama)</label>
                        <input v-model="form.hero.date" placeholder="Contoh: Sabtu, 28 Desember 2025" @blur="saveData(true)" class="input-field" />
                    </div>
                
                    <div class="col-span-1 md:col-span-2 border-t pt-4 border-dashed border-stone-200">
                        <label class="label-input">Background Image Hero (Opsional)</label>
                        <div class="flex gap-2">
                             <div class="flex-1">
                                <input v-model="form.hero.backgroundImage" @paste="handlePaste($event, 'hero.backgroundImage')" @change="checkAndConvertDriveLink('hero.backgroundImage')" placeholder="https://... (Paste Link Gambar/Drive Disini)" @blur="saveData(true)" class="input-field bg-stone-50" />
                             </div>
                             <label class="btn-icon cursor-pointer min-w-[46px]" title="Upload dari Perangkat">
                                <i class="fas fa-upload text-stone-600"></i>
                                <input type="file" @change="handleFileUpload($event, 'hero.backgroundImage')" class="hidden" accept="image/*" />
                             </label>
                            <button type="button" @click="checkAndConvertDriveLink('hero.backgroundImage')" class="btn-icon min-w-[46px]" title="Cek Link Drive"><i class="fas fa-sync"></i></button>
                        </div>
                        <div v-if="form.hero.backgroundImage" class="mt-4 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-sm">
                            <img :src="form.hero.backgroundImage" class="w-full h-auto object-cover max-h-48" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                        </div>
                        <p v-if="driveMsg['hero.backgroundImage']" class="text-success mt-1"><i class="fas fa-check-circle"></i> {{ driveMsg['hero.backgroundImage'] }}</p>
                        <p v-else class="text-hint mt-1">Biarkan kosong untuk background putih polos.</p>
                    </div>
                </div>
            </div>



            <!-- Tab: Cover -->
            <div v-show="activeTab === 'cover'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-book-open text-gold-500"></i> Halaman Sampul (Cover Depan)
                    </h2>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="label-input">Background Image Cover</label>
                        <div class="flex gap-2">
                             <div class="flex-1">
                                <input v-model="form.cover.backgroundImage" @paste="handlePaste($event, 'cover.backgroundImage')" @change="checkAndConvertDriveLink('cover.backgroundImage')" placeholder="https://... (Paste Link Gambar/Drive)" @blur="saveData(true)" class="input-field bg-stone-50" />
                             </div>
                             <label class="btn-icon cursor-pointer min-w-[46px]" title="Upload dari Perangkat">
                                <i class="fas fa-upload text-stone-600"></i>
                                <input type="file" @change="handleFileUpload($event, 'cover.backgroundImage')" class="hidden" accept="image/*" />
                             </label>
                            <button type="button" @click="checkAndConvertDriveLink('cover.backgroundImage')" class="btn-icon min-w-[46px]" title="Cek Link Drive"><i class="fas fa-sync"></i></button>
                        </div>
                        <div v-if="form.cover.backgroundImage" class="mt-4 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-sm">
                             <img :src="form.cover.backgroundImage" class="w-full h-auto object-cover max-h-48" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                        </div>
                        <p v-if="driveMsg['cover.backgroundImage']" class="text-success mt-1"><i class="fas fa-check-circle"></i> {{ driveMsg['cover.backgroundImage'] }}</p>
                        <p v-else class="text-hint mt-1">Gambar ini muncul saat undangan pertama kali dibuka.</p>
                    </div>
                </div>
            </div>

            <!-- Tab: Quote / Ayat Suci -->
            <div v-show="activeTab === 'quote'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-quran text-gold-500"></i> Ayat Suci / Quotes
                    </h2>
                </div>
                <div class="p-6 space-y-6">
                    <div>
                        <label class="label-input">Teks Arab (Opsional)</label>
                        <textarea v-model="form.quote.arabic" placeholder="Contoh: وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم..." @blur="saveData(true)" class="input-field h-24 font-serif text-right text-lg"></textarea>
                        <p class="text-hint mt-1">Gunakan font Arab yang sesuai jika memungkinkan.</p>
                    </div>
                    <div>
                        <label class="label-input">Terjemahan / Isi Quote</label>
                        <textarea v-model="form.quote.content" placeholder="Contoh: Dan di antara tanda-tanda kekuasaan-Nya..." @blur="saveData(true)" class="input-field h-32"></textarea>
                    </div>
                     <div>
                        <label class="label-input">Sumber / Referensi</label>
                        <input v-model="form.quote.source" placeholder="Contoh: QS Ar-Rum: 21" @blur="saveData(true)" class="input-field" />
                    </div>
                </div>
            </div>

            <!-- Tab: Love Story -->
            <div v-show="activeTab === 'story'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-heart text-gold-500"></i> Love Story
                    </h2>
                     <button @click="form.story.push({ year: '', title: '', content: '' }); saveData(true)" class="btn-primary text-sm py-2">
                        <i class="fas fa-plus mr-1"></i> Tambah Cerita
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <div v-if="form.story.length === 0" class="text-center py-12 text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <i class="fas fa-heart-broken text-4xl mb-3 opacity-20"></i>
                        <p>Belum ada cerita cinta yang ditulis.</p>
                    </div>

                    <div v-else v-for="(item, index) in form.story" :key="index" class="bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-sm relative group">
                        <button @click="form.story.splice(index, 1); saveData(true)" class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors z-10" title="Hapus">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>

                        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                             <div class="md:col-span-3">
                                <label class="label-input text-xs">Tahun / Tanggal</label>
                                <input v-model="item.year" placeholder="2020 / 12 Jan 2021" @blur="saveData(true)" class="input-field text-sm" />
                            </div>
                            <div class="md:col-span-9">
                                <label class="label-input text-xs">Judul Momen</label>
                                <input v-model="item.title" placeholder="Pertama Bertemu" @blur="saveData(true)" class="input-field text-sm font-bold" />
                            </div>
                             <div class="md:col-span-12">
                                <label class="label-input text-xs">Cerita Singkat</label>
                                <textarea v-model="item.content" placeholder="Ceritakan sedikit kenangan manis di sini..." @blur="saveData(true)" class="input-field text-sm h-20"></textarea>
                            </div>
                             <div class="md:col-span-12">
                                 <label class="label-input text-xs mb-2 block">Foto Momen (Opsional)</label>
                                 <div class="flex items-center gap-4">
                                     <div v-if="item.image" class="w-16 h-16 rounded-lg overflow-hidden border border-stone-200">
                                         <img :src="item.image" class="w-full h-full object-cover">
                                     </div>
                                     <div class="flex-1">
                                         <input type="text" v-model="item.image" placeholder="URL Foto (Google Drive / Direct Link)" @blur="saveData(true)" class="input-field text-sm mb-1" />
                                          <button type="button" @click="checkAndConvertDriveLink(`story.${index}.image`, item)" class="text-xs text-gold-600 hover:underline">
                                            <i class="fas fa-sync mr-1"></i> Cek & Convert Link Drive
                                        </button>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab: Mempelai -->
            <div v-show="activeTab === 'mempelai'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-heart text-gold-500"></i> Data Mempelai
                    </h2>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-stone-100 pb-2 mb-2">
                             <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fas fa-male"></i></div>
                             <h3 class="font-bold text-stone-700">Mempelai Pria</h3>
                        </div>
                        <div>
                            <label class="label-input">Nama Lengkap</label>
                            <input v-model="form.groom.fullName" placeholder="Nama Lengkap" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Nama Orang Tua (Putra dari...)</label>
                             <textarea v-model="form.groom.parents" placeholder="Putra dari Bpk..." @blur="saveData(true)" class="input-field h-20"></textarea>
                        </div>
                        <div>
                            <label class="label-input">Instagram</label>
                            <input v-model="form.groom.instagram" placeholder="@username" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Foto Profil</label>
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <input v-model="form.groom.image" @paste="handlePaste($event, 'groom.image')" @change="checkAndConvertDriveLink('groom.image')" placeholder="URL Foto" @blur="saveData(true)" class="input-field bg-stone-50" />
                                </div>
                                <label class="btn-icon cursor-pointer min-w-[46px]" title="Upload dari Perangkat">
                                    <i class="fas fa-upload text-stone-600"></i>
                                    <input type="file" @change="handleFileUpload($event, 'groom.image')" class="hidden" accept="image/*" />
                                 </label>
                                <button type="button" @click="checkAndConvertDriveLink('groom.image')" class="btn-icon min-w-[46px]"><i class="fas fa-sync"></i></button>
                            </div>
                            <div v-if="form.groom.image" class="mt-4 w-32 h-32 rounded-full border-4 border-white ring-1 ring-stone-200 bg-white overflow-hidden shadow-md mx-auto">
                                 <img :src="form.groom.image" class="w-full h-full object-cover" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                            </div>
                            <p v-if="driveMsg['groom.image']" class="text-success mt-1"><i class="fas fa-check-circle"></i> {{ driveMsg['groom.image'] }}</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-stone-100 pb-2 mb-2">
                             <div class="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><i class="fas fa-female"></i></div>
                             <h3 class="font-bold text-stone-700">Mempelai Wanita</h3>
                        </div>
                        <div>
                            <label class="label-input">Nama Lengkap</label>
                            <input v-model="form.bride.fullName" placeholder="Nama Lengkap" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                             <label class="label-input">Nama Orang Tua (Putri dari...)</label>
                             <textarea v-model="form.bride.parents" placeholder="Putri dari Bpk..." @blur="saveData(true)" class="input-field h-20"></textarea>
                        </div>
                        <div>
                            <label class="label-input">Instagram</label>
                            <input v-model="form.bride.instagram" placeholder="@username" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Foto Profil</label>
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <input v-model="form.bride.image" @paste="handlePaste($event, 'bride.image')" @change="checkAndConvertDriveLink('bride.image')" placeholder="URL Foto" @blur="saveData(true)" class="input-field bg-stone-50" />
                                </div>
                                <label class="btn-icon cursor-pointer min-w-[46px]" title="Upload dari Perangkat">
                                    <i class="fas fa-upload text-stone-600"></i>
                                    <input type="file" @change="handleFileUpload($event, 'bride.image')" class="hidden" accept="image/*" />
                                 </label>
                                <button type="button" @click="checkAndConvertDriveLink('bride.image')" class="btn-icon min-w-[46px]"><i class="fas fa-sync"></i></button>
                            </div>
                            <div v-if="form.bride.image" class="mt-4 w-32 h-32 rounded-full border-4 border-white ring-1 ring-stone-200 bg-white overflow-hidden shadow-md mx-auto">
                                 <img :src="form.bride.image" class="w-full h-full object-cover" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                            </div>
                            <p v-if="driveMsg['bride.image']" class="text-success mt-1"><i class="fas fa-check-circle"></i> {{ driveMsg['bride.image'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab: Acara -->
            <div v-show="activeTab === 'acara'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-calendar-alt text-gold-500"></i> Rangkaian Acara
                    </h2>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Akad -->
                    <div class="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <h3 class="font-bold text-stone-700 border-b pb-2">Akad Nikah / Pemberkatan</h3>
                        <div>
                            <label class="label-input">Jam</label>
                            <input v-model="form.events.akad.time" placeholder="08:00 WIB - Selesai" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Tanggal (Teks)</label>
                            <input v-model="form.events.akad.date" placeholder="Sabtu, 28 Desember 2025" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Lokasi (Gedung/Masjid)</label>
                            <textarea v-model="form.events.akad.location" @blur="saveData(true)" class="input-field h-20"></textarea>
                        </div>
                        <div>
                            <label class="label-input">Tanggal & Jam (Untuk Countdown)</label>
                            <div class="flex items-center gap-3 bg-white border border-stone-200 p-2 rounded-lg focus-within:ring-2 ring-gold-500 transition-all">
                                <div class="w-10 h-10 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                                    <i class="fas fa-stopwatch"></i>
                                </div>
                                <input type="datetime-local" v-model="form.events.akad.isoDate" @blur="saveData(true)" class="w-full outline-none text-sm font-bold text-stone-700 bg-transparent" />
                            </div>
                            <p class="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1.5">
                                <i class="fas fa-info-circle text-gold-500"></i>
                                <span>Waktu ini akan digunakan otomatis untuk <strong>Hitung Mundur (Countdown)</strong>.</span>
                            </p>
                        </div>

                         <div>
                            <label class="label-input">Link Google Maps</label>
                            <input v-model="form.events.akad.mapUrl" placeholder="https://maps.google.com/..." @blur="saveData(true)" class="input-field" />
                        </div>
                    </div>
                    
                    <!-- Resepsi -->
                    <div class="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <h3 class="font-bold text-stone-700 border-b pb-2">Resepsi</h3>
                        <div>
                            <label class="label-input">Jam</label>
                            <input v-model="form.events.resepsi.time" placeholder="11:00 WIB - Selesai" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Tanggal (Teks)</label>
                            <input v-model="form.events.resepsi.date" placeholder="Sabtu, 28 Desember 2025" @blur="saveData(true)" class="input-field" />
                        </div>
                        <div>
                            <label class="label-input">Lokasi</label>
                            <textarea v-model="form.events.resepsi.location" @blur="saveData(true)" class="input-field h-20"></textarea>
                        </div>
                        <div>
                            <label class="label-input">Link Google Maps</label>
                            <input v-model="form.events.resepsi.mapUrl" placeholder="https://maps.google.com/..." @blur="saveData(true)" class="input-field" />
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tab: Galeri -->
            <div v-show="activeTab === 'galeri'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-images text-gold-500"></i> Galeri Foto
                    </h2>
                     <button type="button" @click="addGalleryImage" class="text-xs bg-stone-800 text-white px-3 py-2 rounded hover:bg-stone-700 font-bold shadow">+ Tambah Slot</button>
                </div>
                <div class="p-6">

                <!-- Drive Integration -->
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-blue-500"><i class="fab fa-google-drive fa-lg"></i></div>
                        <div class="flex-1 space-y-2">
                             <label class="text-xs font-bold text-blue-600 block">Import dari Google Drive Folder</label>
                             <div class="flex gap-2">
                                <input v-model="driveFolderUrl" placeholder="Paste Link Folder Google Drive..." @blur="saveData(true)" class="input-field border-blue-200 focus:ring-blue-500" />
                                <button type="button" @click="syncDriveGallery" :disabled="isSyncingDrive" class="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                                    {{ isSyncingDrive ? 'Loading...' : 'Ambil Foto' }}
                                </button>
                            </div>
                            <p class="text-[10px] text-blue-500 opacity-80">Folder harus di-set "Anyone with the link can view".</p>
                        </div>
                    </div>
                </div>

                <!-- Gallery Grid View -->
                 <div class="space-y-4">
                     <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div v-for="(img, idx) in form.gallery" :key="idx" class="relative group aspect-square rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden hover:shadow-lg transition-all">
                             
                             <!-- Image / Placeholder -->
                             <img v-if="img" :src="img" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/400x400/f5f5f4/a8a29e?text=Broken+Link'" />
                             <div v-else class="w-full h-full flex flex-col items-center justify-center text-stone-300 p-4 text-center">
                                 <i class="fas fa-image text-2xl mb-2 opacity-50"></i>
                                 <span class="text-[10px] font-bold">Paste URL / Upload</span>
                             </div>

                             <!-- Overlay Actions -->
                             <div class="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                 
                                 <!-- Input for URL -->
                                 <input v-model="form.gallery[idx]" @paste="handlePaste($event, 'gallery', Number(idx))" @change="checkAndConvertDriveLink('gallery', Number(idx))" placeholder="Paste Link..." @blur="saveData(true)" class="w-full bg-white/90 backdrop-blur text-xs px-3 py-2 rounded-lg outline-none text-stone-900 font-bold text-center mb-1" />
                                 
                                 <div class="flex gap-2">
                                     <label class="w-8 h-8 flex items-center justify-center bg-white text-stone-600 rounded-full hover:bg-gold-500 hover:text-white cursor-pointer transition-all shadow-lg" title="Ganti Foto">
                                         <i class="fas fa-upload text-xs"></i>
                                         <input type="file" @change="handleFileUpload($event, 'gallery', Number(idx))" class="hidden" accept="image/*" />
                                     </label>
                                     <button type="button" @click="removeGalleryImage(Number(idx))" class="w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg" title="Hapus">
                                         <i class="fas fa-trash-alt text-xs"></i>
                                     </button>
                                 </div>
                             </div>

                             <!-- Index Badge -->
                             <div class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-lg pointer-events-none">
                                 {{ idx + 1 }}
                             </div>
                         </div>
                         
                         <!-- Add Button Block -->
                         <button type="button" @click="addGalleryImage" class="aspect-square rounded-2xl border-2 border-dashed border-stone-200 hover:border-gold-400 hover:bg-gold-50/50 flex flex-col items-center justify-center text-stone-400 hover:text-gold-600 transition-all gap-2 group/add">
                             <div class="w-10 h-10 rounded-full bg-stone-100 group-hover/add:bg-gold-100 flex items-center justify-center transition-colors">
                                <i class="fas fa-plus text-sm"></i>
                             </div>
                             <span class="text-xs font-bold">Tambah Foto</span>
                         </button>
                     </div>
                 </div>
            </div>
            </div>

            <!-- Tab: Hadiah -->
            <div v-show="activeTab === 'hadiah'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                 <div class="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                    <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-gift text-gold-500"></i> Amplop Digital
                    </h2>
                     <button type="button" @click="addBankAccount" class="text-xs bg-gold-500 text-stone-900 px-4 py-2 rounded-lg hover:bg-gold-400 font-bold shadow-sm transition-all">+ Tambah Bank</button>
                 </div>
                 
                 <div class="p-6 space-y-4 mb-8">
                    <div v-for="(acc, idx) in form.gift.accounts" :key="idx" class="bg-stone-50 p-6 rounded-2xl border border-stone-200 relative group transition-all hover:shadow-md hover:bg-white">
                        <button type="button" @click="removeBankAccount(Number(idx))" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-stone-400 shadow-sm hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-stone-100">
                            <i class="fas fa-trash-alt text-sm"></i>
                        </button>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="label-input">Nama Bank / E-Wallet</label>
                                <input v-model="form.gift.accounts[idx].bankName" placeholder="Contoh: BCA / DANA" @blur="saveData(true)" class="input-field border-stone-100 shadow-sm" />
                            </div>
                             <div>
                                <label class="label-input">No. Rekening</label>
                                <input v-model="form.gift.accounts[idx].number" placeholder="Contoh: 1234567890" @blur="saveData(true)" class="input-field border-stone-100 shadow-sm" />
                            </div>
                             <div class="col-span-1 md:col-span-2">
                                <label class="label-input">Atas Nama</label>
                                <input v-model="form.gift.accounts[idx].name" placeholder="Nama Pemilik Rekening" @blur="saveData(true)" class="input-field border-stone-100 shadow-sm" />
                            </div>
                        </div>
                    </div>
                     <p v-if="!form.gift.accounts?.length" class="text-center text-gray-400 italic text-sm">Belum ada rekening yang ditambahkan.</p>
                 </div>

                 <div class="border-t pt-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
                     <h3 class="font-bold text-stone-700 mb-4 flex items-center gap-2"><i class="fas fa-qrcode"></i> QRIS (Opsional)</h3>
                     <div class="flex gap-2">
                        <div class="flex-1">
                             <input v-model="form.gift.qrisUrl" @paste="handlePaste($event, 'gift.qrisUrl')" @change="checkAndConvertDriveLink('gift.qrisUrl')" placeholder="Paste Link Gambar QRIS..." @blur="saveData(true)" class="input-field bg-white" />
                        </div>
                        <label class="btn-icon cursor-pointer min-w-[46px] flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50" title="Upload dari Perangkat">
                            <i class="fas fa-upload text-stone-600"></i>
                            <input type="file" @change="handleFileUpload($event, 'gift.qrisUrl')" class="hidden" accept="image/*" />
                        </label>
                        <button type="button" @click="checkAndConvertDriveLink('gift.qrisUrl')" class="btn-icon min-w-[46px] bg-white border border-stone-200 shadow-sm" title="Cek Link Drive"><i class="fas fa-sync"></i></button>
                     </div>
                     <div v-if="form.gift.qrisUrl" class="mt-4 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-[200px] mx-auto">
                         <img :src="form.gift.qrisUrl" class="w-full h-auto object-cover" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                    </div>
                     <p v-if="driveMsg['gift.qrisUrl']" class="text-success mt-1 text-center"><i class="fas fa-check-circle"></i> {{ driveMsg['gift.qrisUrl'] }}</p>
                 </div>
            </div>

            <!-- Tab: Daftar Tamu -->
            <div v-show="activeTab === 'tamu'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-user-tag text-gold-500"></i> Kirim Undangan (Kustom Nama)
                    </h2>
                </div>
                <div class="p-6 space-y-8">
                    <!-- Link Generator Card -->
                    <div class="bg-gradient-to-br from-stone-900 to-stone-800 p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
                        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl"></div>
                        
                        <div class="relative z-10 space-y-6">
                            <div>
                                <label class="label-input !text-stone-400">Nama Tamu yang Diundang</label>
                                <input v-model="guestNameInput" placeholder="Contoh: Bapak Budi & Istri" class="w-full bg-stone-800 border-2 border-stone-700 p-4 rounded-xl text-lg font-bold text-white placeholder:text-stone-600 focus:border-gold-500 outline-none transition-all" />
                                <p class="text-[10px] text-stone-500 mt-2 italic">Nama ini akan muncul secara otomatis di halaman depan (Cover) undangan.</p>
                            </div>

                            <Transition name="fade">
                                <div v-if="guestNameInput" class="space-y-4 animate-fade-in">
                                    <div class="bg-stone-900/50 p-4 rounded-xl border border-stone-700/50">
                                        <label class="text-[10px] font-bold text-gold-500 uppercase tracking-widest block mb-2">Link Khusus Tamu</label>
                                        <div class="font-mono text-xs break-all text-stone-300 bg-stone-950 p-3 rounded-lg border border-stone-800">
                                            {{ generatedGuestLink }}
                                        </div>
                                    </div>

                                    <div class="flex flex-col sm:flex-row gap-3">
                                        <button type="button" @click="copyGuestLink" class="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
                                            <i class="fas fa-copy"></i> Salin Link
                                        </button>
                                        <button type="button" @click="shareGuestWA" class="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-600/20">
                                            <i class="fab fa-whatsapp text-lg"></i> Kirim WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </Transition>

                            <div v-if="!guestNameInput" class="py-10 text-center border-2 border-dashed border-stone-700 rounded-2xl">
                                <i class="fas fa-magic text-4xl text-stone-700 mb-3 block"></i>
                                <p class="text-stone-500 text-sm italic">Ketik nama tamu di atas untuk membuat link khusus.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 flex gap-4">
                            <div class="w-10 h-10 bg-gold-100 text-gold-600 flex items-center justify-center rounded-full flex-shrink-0">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-stone-800 mb-1">Kenapa pakai Link Khusus?</h4>
                                <p class="text-xs text-stone-500 leading-relaxed">Selain terlihat lebih profesional, nama tamu akan muncul di "Cover" sehingga tamu merasa lebih dihargai secara personal.</p>
                            </div>
                        </div>
                        <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-4">
                            <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full flex-shrink-0">
                                <i class="fas fa-share-alt"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-stone-800 mb-1">Tips Berbagi</h4>
                                <p class="text-xs text-stone-500 leading-relaxed">Copy link-nya dan simpan di catatan hp jika anda ingin mengirimnya nanti secara massal atau manual.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab: Musik -->
            <div v-show="activeTab === 'musik'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-music text-gold-500"></i> Musik Latar
                    </h2>
                </div>
                <div class="p-6 space-y-6">
    const musicPresets = [
        { title: 'Payung Teduh - Akad', url: 'https://kamiundang.site/music/akad.mp3' },
        { title: 'Tulus - Teman Hidup', url: 'https://kamiundang.site/music/teman-hidup.mp3' },
        { title: 'Yura Yunita - Cinta dan Rahasia', url: 'https://kamiundang.site/music/cinta-rahasia.mp3' },
        { title: 'Instrumental - Canon in D', url: 'https://kamiundang.site/music/canon-in-d.mp3' },
        { title: 'Shane Filan - Beautiful In White', url: 'https://kamiundang.site/music/beautiful-in-white.mp3' },
    ]
    const isMusicModalOpen = ref(false)
    
    // ... inside the music tab ...
                    <div>
                        <label class="label-input">URL Lagu (.mp3)</label>
                        <div class="flex gap-2">
                            <input v-model="form.music.url" placeholder="https://example.com/song.mp3" @blur="saveData(true)" class="input-field" />
                            <button type="button" @click="isMusicModalOpen = true" class="px-4 py-2 bg-stone-900 text-white rounded-lg font-bold text-xs hover:bg-gold-600 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                                <i class="fas fa-list-music"></i> Pilih Lagu
                            </button>
                        </div>
                        
                        <!-- Music Helper -->
                        <div class="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                             <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5">
                                 <i class="fas fa-lightbulb"></i>
                             </div>
                             <div class="text-xs text-stone-600 space-y-1">
                                 <p class="font-bold">Tips Musik:</p>
                                 <ul class="list-disc pl-4 opacity-80 space-y-0.5">
                                     <li>Gunakan link yang berakhiran <strong>.mp3</strong>.</li>
                                     <li>Link Youtube / Spotify <strong>TIDAK BISA</strong> digunakan.</li>
                                     <li>Rekomendasi: Gunakan tombol <strong>"Pilih Lagu"</strong> untuk lagu populer siap pakai.</li>
                                 </ul>
                             </div>
                        </div>
                    </div>

                    <!-- Music Library Modal -->
                    <Transition name="fade">
                        <div v-if="isMusicModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" @click="isMusicModalOpen = false"></div>
                            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
                                <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                    <h3 class="font-bold text-lg text-stone-800"><i class="fas fa-music text-gold-500 mr-2"></i> Pustaka Musik</h3>
                                    <button @click="isMusicModalOpen = false" class="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="overflow-y-auto p-2">
                                    <button 
                                        v-for="(song, idx) in musicPresets" 
                                        :key="idx" 
                                        @click="form.music.url = song.url; isMusicModalOpen = false; saveData(true)"
                                        class="w-full text-left p-4 hover:bg-stone-50 rounded-xl transition-all group border-b border-stone-50 last:border-0 flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white transition-colors font-bold text-xs">
                                                {{ idx + 1 }}
                                            </div>
                                            <div>
                                                <p class="font-bold text-sm text-stone-800">{{ song.title.split(' - ')[1] || song.title }}</p>
                                                <p class="text-[11px] text-stone-400 uppercase tracking-wider">{{ song.title.split(' - ')[0] || 'Unknown Artist' }}</p>
                                            </div>
                                        </div>
                                        <div class="w-8 h-8 rounded-full border border-stone-200 text-stone-300 flex items-center justify-center group-hover:border-gold-500 group-hover:text-gold-500">
                                            <i class="fas fa-check"></i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                
                    <div class="bg-stone-50 p-4 rounded-xl border border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label class="label-input">Mulai Dari (MM:SS)</label>
                            <input v-model="formattedStartTime" placeholder="00:00" @blur="saveData(true)" class="input-field text-center font-mono" />
                        </div>
                        <div class="flex items-center gap-3 pt-6 md:pt-0">
                            <input v-model="form.music.fade" type="checkbox" id="fadeToggle" class="w-5 h-5 accent-gold-600" />
                            <label for="fadeToggle" class="select-none cursor-pointer font-bold text-stone-700">Aktifkan Fade In</label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab: SEO & RSVP -->
             <div v-show="activeTab === 'settings'" class="bg-white rounded-xl shadow-sm border border-stone-200 animate-fade-in overflow-hidden">
                <div class="p-6 bg-stone-50 border-b border-stone-100">
                     <h2 class="font-bold text-xl flex items-center gap-2 text-stone-800">
                        <i class="fas fa-cog text-gold-500"></i> Pengaturan & SEO
                    </h2>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Rename Slug Section -->
                    <div class="p-4 bg-red-50 rounded-xl border border-red-100">
                        <h3 class="font-bold text-red-800 mb-4"><i class="fas fa-link"></i> Ubah Link Undangan</h3>
                        <div class="space-y-4">
                             <div>
                                <label class="label-input text-red-700">Link Baru (Slug)</label>
                                <div class="flex gap-2">
                                     <div class="flex-1 flex items-center bg-white border border-red-200 rounded-lg overflow-hidden focus-within:ring-2 ring-red-500 transition-all">
                                         <span class="pl-3 text-stone-400 text-sm font-medium">{{ host }}/</span>
                                         <input v-model="newSlugInput" placeholder="nama-pasangan" class="flex-1 p-3 outline-none text-stone-800 font-bold" />
                                     </div>
                                     <button type="button" @click="renameSlug" :disabled="isRenaming" class="px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm transition-all disabled:opacity-50">
                                         {{ isRenaming ? '...' : 'Ubah' }}
                                     </button>
                                </div>
                                <p class="text-[10px] text-red-600 mt-1">*Mengubah link akan membuat link lama tidak bisa diakses lagi.</p>
                             </div>
                        </div>
                    </div>

                    <div class="p-4 bg-green-50 rounded-xl border border-green-100">
                        <h3 class="font-bold text-green-800 mb-4"><i class="fab fa-whatsapp"></i> Kontak RSVP</h3>
                         <label class="label-input">No WhatsApp Penerima Tamu</label>
                         <input v-model="form.rsvp.phone" placeholder="628123456789 (Awali dengan 62)" @blur="saveData(true)" class="input-field bg-white" />
                    </div>

                     <div class="p-4 bg-stone-50 rounded-xl border border-stone-100">
                         <h3 class="font-bold text-stone-700 mb-4"><i class="fas fa-share-alt"></i> Tampilan Share Link</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="label-input">Judul Link</label>
                                <input v-model="form.meta.title" placeholder="The Wedding of..." @blur="saveData(true)" class="input-field bg-white" />
                            </div>
                            <div>
                                <label class="label-input">Deskripsi Pendek</label>
                                <textarea v-model="form.meta.description" placeholder="Kami mengundang..." @blur="saveData(true)" class="input-field h-20 bg-white"></textarea>
                            </div>
                             <div>
                                <label class="label-input">Gambar Preview (Thumbnail)</label>
                                <div class="flex gap-2">
                                     <div class="flex-1">
                                        <input v-model="form.meta.image" @paste="handlePaste($event, 'meta.image')" @change="checkAndConvertDriveLink('meta.image')" placeholder="URL Foto..." @blur="saveData(true)" class="input-field bg-white" />
                                     </div>
                                     <label class="btn-icon cursor-pointer min-w-[46px] flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50" title="Upload dari Perangkat">
                                        <i class="fas fa-upload text-stone-600"></i>
                                        <input type="file" @change="handleFileUpload($event, 'meta.image')" class="hidden" accept="image/*" />
                                     </label>
                                    <button type="button" @click="checkAndConvertDriveLink('meta.image')" class="btn-icon min-w-[46px] bg-white shadow-sm" title="Cek Link Drive"><i class="fas fa-sync"></i></button>
                                </div>
                                <div v-if="form.meta.image" class="mt-4 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-[200px]">
                                     <img :src="form.meta.image" class="w-full h-auto object-cover" referrerpolicy="no-referrer" @error="(e: any) => e.target.src = 'https://placehold.co/600x400/f5f5f4/a8a29e?text=Error+Loading+Image'">
                                </div>
                                <p v-if="driveMsg['meta.image']" class="text-success mt-1"><i class="fas fa-check-circle"></i> {{ driveMsg['meta.image'] }}</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </form>
           </div>
      </div>

      <!-- RIGHT PANEL: Live Preview (Hidden on Mobile) -->
      <div class="hidden lg:flex flex-1 bg-stone-900 items-center justify-center relative overflow-hidden" ref="previewContainer">
           
           <!-- Dynamic Ambient Background -->
           <div class="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-50 blur-3xl scale-125 origin-center pointer-events-none"
                :style="{ backgroundImage: `url(${form.cover?.backgroundImage || form.hero?.backgroundImage || 'https://www.transparenttextures.com/patterns/cubes.png'})` }">
           </div>
           
           <div class="absolute inset-0 bg-stone-900/20 backdrop-blur-sm pointer-events-none"></div>

           <!-- Device Frame Wrapper for Centering and Scaling -->
           <div class="relative z-10 transition-transform duration-200 ease-out origin-center custom-shadow" 
                :style="{ transform: `scale(${previewScale})` }">
               
               <div class="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-stone-900 overflow-hidden ring-4 ring-white/10 relative">
                   <!-- Notch -->
                   <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-stone-900 rounded-b-2xl z-50 pointer-events-none"></div>
                   
                   <iframe 
                    ref="previewIframe"
                    :src="`/${slug}?preview=true`" 
                    class="w-full h-full bg-white"
                    frameborder="0"
                   ></iframe>
               </div>
           </div>

           <div class="absolute bottom-6 text-white/50 text-xs font-bold uppercase tracking-[0.2em] z-10 text-shadow cursor-default select-none pointer-events-none">
               Live Preview
           </div>
      </div>

    </div>
  </div>
</template>
