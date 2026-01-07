<script setup lang="ts">
const props = defineProps<{
  rsvp: any,
  coupleName?: string,
  isAuthorized?: boolean
}>()

const route = useRoute()
const rawSlug = route.params.slug as string
const slug = rawSlug === 'demo' ? 'wulanrezal' : rawSlug
const isSubmitting = ref(false)
const localComments = ref<any[]>([...(props.rsvp?.comments || [])])

// Admin Logic
// Auth state now comes from props
const isAuthorizedUser = computed(() => props.isAuthorized || false)

const replyToId = ref<string | null>(null)
const replyMessage = ref('')
const isReplying = ref(false)

// Sync with props if they change (e.g. initial load)
watch(() => props.rsvp?.comments, (newVal) => {
  if (newVal) localComments.value = [...newVal]
}, { deep: true })

const form = reactive({
  name: '',
  status: '', 
  message: ''
})

const attendanceOptions = [
  { value: 'Hadir', label: 'Hadir', icon: '😊' },
  { value: 'Tidak Hadir', label: 'Maaf, Tidak Bisa Hadir', icon: '😔' },
  { value: 'Masih Ragu', label: 'Masih Ragu', icon: '🤔' },
]

const submitRSVP = async () => {
  if (!form.name || !form.status) return
  
  isSubmitting.value = true
  try {
    const res = await $fetch<any>('/api/rsvp', {
      method: 'POST',
      body: {
        slug,
        name: form.name,
        status: form.status,
        message: form.message
      }
    })
    
    if (res.success && res.comment) {
      // Add to local list immediately
      localComments.value.unshift(res.comment)
      
      // Reset form
      form.name = ''
      form.status = ''
      form.message = ''
      
      // Optional: Show success toast/alert
    }
  } catch (error) {
    console.error('Failed to submit RSVP', error)
    alert('Maaf, terjadi kesalahan saat mengirim konfirmasi.')
  } finally {
    isSubmitting.value = false
  }
}

const submitReply = async (parentId: string) => {
    if (!replyMessage.value) return
    isReplying.value = true
    
    try {
        const res = await $fetch<any>('/api/rsvp', {
            method: 'POST',
            body: {
                slug,
                name: props.coupleName || 'Mempelai', // Use prop or fallback
                parentCommentId: parentId,
                message: replyMessage.value
            }
        })

        if (res.success && res.comment) {
            // Find parent and append
            const parent = localComments.value.find(c => c.id === parentId)
            if (parent) {
                if (!parent.replies) parent.replies = []
                parent.replies.push(res.comment)
            }
            replyToId.value = null
            replyMessage.value = ''
        }
    } catch(e) {
        alert('Gagal membalas')
    } finally {
        isReplying.value = false
    }
}

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(isoString))
}

const getStatusBadgeClass = (status: string) => {
  switch(status) {
    case 'Hadir': return 'bg-green-100 text-green-700 border-green-200'
    case 'Tidak Hadir': return 'bg-red-100 text-red-700 border-red-200'
    case 'Mempelai': return 'bg-gold-100 text-gold-700 border-gold-200'
    default: return 'bg-stone-100 text-stone-600 border-stone-200'
  }
}
</script>

<template>
  <div class="rsvp-section max-w-2xl mx-auto py-12 px-4">
     <div class="text-center mb-10">
       <h2 class="font-serif text-3xl text-stone-800 mb-4">Konfirmasi Kehadiran</h2>
       <p class="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
         Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
       </p>
     </div>

     <!-- RSVP Form -->
     <div class="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-stone-200/50 mb-12 border border-stone-100 relative overflow-hidden">
        <!-- Decorative bg -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gold-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <form @submit.prevent="submitRSVP" class="relative space-y-5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Nama Lengkap</label>
              <input 
                v-model="form.name"
                type="text" 
                class="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all placeholder:text-stone-300 font-serif"
                placeholder="Masukkan nama anda"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Kehadiran</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <button
                    v-for="opt in attendanceOptions"
                    :key="opt.value"
                    type="button"
                    @click="form.status = opt.value"
                    class="px-3 py-3 rounded-lg border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                    :class="form.status === opt.value 
                       ? 'bg-gold-500 text-white border-gold-500 shadow-lg shadow-gold-500/30 font-serif' 
                       : 'bg-white border-stone-200 text-stone-500 hover:border-gold-300 hover:text-gold-600'"
                 >
                   <span class="text-lg group-hover:scale-110 transition-transform">{{ opt.icon }}</span>
                   {{ opt.label }}
                 </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Ucapan & Doa</label>
              <textarea 
                v-model="form.message"
                rows="3"
                class="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all placeholder:text-stone-300 resize-none font-serif"
                placeholder="Tuliskan ucapan selamat..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting || !form.name || !form.status"
              class="w-full py-4 bg-gold-600 text-white rounded-lg font-serif font-bold tracking-wide shadow-xl hover:bg-gold-700 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi' }}
            </button>
        </form>
     </div>

     <!-- Comments List -->
     <div v-if="localComments.length > 0" class="space-y-6">
        <h3 class="text-center font-bold text-stone-800 uppercase tracking-widest text-xs mb-6">Latest Wishes</h3>
        
        <div class="space-y-4">
           <TransitionGroup name="list">
             <div 
               v-for="comment in localComments" 
               :key="comment.id" 
               class="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-4"
             >
                <div class="flex gap-4">
                    <div class="flex-shrink-0">
                       <div 
                         class="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner"
                         :class="comment.status === 'Mempelai' ? 'bg-gold-100' : 'bg-stone-100'"
                       >
                          {{ comment.status === 'Hadir' ? '😊' : (comment.status === 'Tidak Hadir' ? '😔' : (comment.status === 'Mempelai' ? '💑' : '🤔')) }}
                       </div>
                    </div>
                    <div class="flex-grow">
                       <div class="flex items-start justify-between mb-1">
                          <div>
                            <h4 class="font-serif font-bold text-stone-800" :class="{'text-gold-600': comment.status === 'Mempelai'}">{{ comment.name }}</h4>
                            <span class="text-[10px] text-stone-400 md:hidden">{{ formatDate(comment.createdAt) }}</span>
                          </div>
                          <span 
                            class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border hidden md:inline-block whitespace-nowrap"
                            :class="getStatusBadgeClass(comment.status)"
                          >
                             {{ comment.status }}
                          </span>
                       </div>
                       
                       <p v-if="comment.message" class="text-stone-600 text-sm italic mb-2">"{{ comment.message }}"</p>
                       
                        <!-- Mobile Status Badge -->
                        <div class="md:hidden mt-2">
                           <span 
                            class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border inline-block"
                            :class="getStatusBadgeClass(comment.status)"
                          >
                             {{ comment.status }}
                          </span>
                        </div>
    
                       <div class="flex justify-between items-center mt-2">
                           <!-- Reply Button (Authorized Only) -->
                           <button 
                             v-if="isAuthorizedUser" 
                             @click="replyToId = (replyToId === comment.id ? null : comment.id)"
                             class="text-[11px] font-bold text-stone-400 hover:text-gold-600 flex items-center gap-1"
                           >
                              <i class="fas fa-reply"></i> Balas
                           </button>
                           <p class="text-[10px] text-stone-300 text-right hidden md:block">{{ formatDate(comment.createdAt) }}</p>
                       </div>

                       <!-- Reply Form -->
                       <div v-if="isAuthorizedUser && replyToId === comment.id" class="mt-3 pl-2 border-l-2 border-gold-200">
                           <textarea v-model="replyMessage" placeholder="Tulis balasan..." class="w-full text-xs p-2 border rounded bg-stone-50 mb-2"></textarea>
                           <div class="flex justify-end gap-2">
                               <button @click="replyToId = null" class="text-xs text-stone-500 font-bold">Batal</button>
                               <button @click="submitReply(comment.id)" :disabled="isReplying" class="text-xs bg-gold-600 text-white px-3 py-1 rounded font-bold">
                                   {{ isReplying ? '...' : 'Kirim' }}
                               </button>
                           </div>
                       </div>
                    </div>
                </div>

                <!-- Nested Replies -->
                <div v-if="comment.replies && comment.replies.length > 0" class="pl-14 space-y-3 mt-2">
                    <div v-for="reply in comment.replies" :key="reply.id" class="bg-gold-50/50 p-3 rounded-lg border border-gold-100 flex gap-3">
                         <div class="flex-shrink-0">
                           <div class="w-8 h-8 rounded-full bg-gold-200 flex items-center justify-center text-sm shadow-inner">
                              💑
                           </div>
                        </div>
                        <div>
                             <h5 class="font-serif font-bold text-[13px] text-gold-800">{{ reply.name }}</h5>
                             <p class="text-[12px] text-stone-600 italic">"{{ reply.message }}"</p>
                             <p class="text-[9px] text-stone-400 mt-1">{{ formatDate(reply.createdAt) }}</p>
                        </div>
                    </div>
                </div>

             </div>
           </TransitionGroup>
        </div>
     </div>

     <!-- Empty State -->
     <div v-else class="text-center py-10 opacity-50">
        <p class="text-stone-400 text-sm font-serif italic">Belum ada ucapan. Jadilah yang pertama!</p>
     </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>

