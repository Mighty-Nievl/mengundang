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
  { value: 'Hadir', label: 'Hadir', icon: 'fa-check-circle', colorClass: 'text-green-400' },
  { value: 'Tidak Hadir', label: 'Berhalangan', icon: 'fa-times-circle', colorClass: 'text-red-400' },
  { value: 'Masih Ragu', label: 'Belum Pasti', icon: 'fa-question-circle', colorClass: 'text-yellow-400' },
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


</script>

<template>
  <div class="rsvp-section max-w-2xl mx-auto py-12 px-4">
     <div class="text-center mb-10 reveal-on-scroll">
       <h2 class="font-display text-4xl text-gold mb-4 uppercase tracking-widest drop-shadow-md">Guest Book</h2>
       <p class="text-white/60 text-sm font-serif italic tracking-wide leading-relaxed max-w-md mx-auto">
         "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu."
       </p>
     </div>

     <!-- RSVP Form (Royal Style) -->
     <div class="relative mb-16 reveal-on-scroll">
         <!-- Decorative Borders -->
         <div class="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/50"></div>
         <div class="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/50"></div>
         <div class="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/50"></div>
         <div class="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/50"></div>

         <div class="bg-black/40 backdrop-blur-sm p-6 md:p-10 border-y border-gold/10 relative z-10">
            <form @submit.prevent="submitRSVP" class="space-y-8">
                <!-- Name Input -->
                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-2 group-focus-within:text-gold transition-colors">Nama Lengkap</label>
                  <input 
                    v-model="form.name"
                    type="text" 
                    class="w-full p-4 bg-white/5 rounded-sm text-white placeholder:text-white/20 focus:bg-white/10 focus:outline-none transition-all font-serif text-lg"
                    placeholder="Masukkan nama anda"
                    required
                  />
                </div>

                <!-- Attendance Options -->
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-4">Konfirmasi Kehadiran</label>
                  <div class="flex flex-col sm:flex-row gap-3">
                     <button
                        v-for="opt in attendanceOptions"
                        :key="opt.value"
                        type="button"
                        @click="form.status = opt.value"
                        class="flex-1 py-4 px-4 rounded-sm text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                        :class="form.status === opt.value 
                           ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold' 
                           : 'bg-white/5 text-gold/70 hover:bg-white/10 hover:text-gold'"
                     >
                       <i :class="['fas', opt.icon, 'relative z-10 transition-transform group-hover:scale-110', opt.colorClass]"></i>
                       <span class="relative z-10 uppercase tracking-wider text-xs">{{ opt.label }}</span>
                     </button>
                  </div>
                </div>

                <!-- Message Input -->
                <div class="group">
                  <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-2 group-focus-within:text-gold transition-colors">Ucapan & Doa</label>
                  <textarea 
                    v-model="form.message"
                    rows="3"
                    class="w-full p-4 bg-white/5 rounded-sm text-white placeholder:text-white/20 focus:bg-white/10 focus:outline-none transition-all font-serif italic"
                    placeholder="Tulis ucapan & doa anda..."
                    required
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <div class="pt-4">
                    <button 
                      type="submit" 
                      :disabled="isSubmitting || !form.name || !form.status"
                      class="w-full py-4 bg-[#111] border border-gold text-gold hover:bg-gold hover:text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-500 uppercase tracking-[0.2em] text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      <span class="relative z-10 flex items-center justify-center gap-3">
                          <span v-if="isSubmitting" class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          {{ isSubmitting ? 'MENGIRIM...' : 'KIRIM UCAPAN' }}
                          <i v-if="!isSubmitting" class="fas fa-paper-plane text-xs group-hover:translate-x-1 transition-transform"></i>
                      </span>
                    </button>
                </div>
            </form>
         </div>
     </div>

     <!-- Comments List (Royal Scroll) -->
     <div v-if="localComments.length > 0" class="relative">
        <div class="text-center mb-10">
            <div class="flex items-center justify-center gap-4 opacity-50 mb-2">
                <div class="w-12 h-px bg-gold"></div>
                <i class="fas fa-certificate text-gold text-xs"></i>
                <div class="w-12 h-px bg-gold"></div>
            </div>
            <h3 class="font-serif italic text-gold/80 text-lg">Doa & Harapan</h3>
        </div>
        
        <div class="space-y-8 relative">
           <!-- Vertical Line -->
           <div class="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent md:left-1/2"></div>
           
           <TransitionGroup name="list">
             <div 
               v-for="(comment, idx) in localComments" 
               :key="comment.id" 
               class="relative flex flex-col md:flex-row gap-6 group hover:translate-x-1 transition-transform duration-300"
               :class="idx % 2 === 0 ? 'md:flex-row-reverse' : ''"
             >
                <!-- Central Node -->
                <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border border-gold rounded-full z-10 mt-1 shadow-[0_0_10px_rgba(212,175,55,0.5)] group-hover:scale-125 transition-transform"></div>

                <!-- Content Side -->
                <div class="pl-12 md:pl-0 md:w-1/2 md:px-8" :class="idx % 2 === 0 ? 'md:text-right' : 'md:text-left'">
                    <div class="mb-1">
                        <h4 class="font-display text-gold text-lg tracking-wide mb-1">{{ comment.name }}</h4>
                        <!-- Status Badge (Minimalist text) -->
                        <span class="text-[10px] uppercase tracking-widest px-2 py-0.5 border border-white/10 rounded-full inline-block"
                              :class="comment.status === 'Hadir' ? 'text-green-400 border-green-400/30' : 
                                      (comment.status === 'Tidak Hadir' ? 'text-red-400 border-red-400/30' : 'text-yellow-400 border-yellow-400/30')">
                           {{ comment.status }}
                        </span>
                    </div>
                    
                    <p class="text-white/80 font-serif italic text-sm leading-relaxed mb-2">"{{ comment.message }}"</p>
                    <p class="text-[9px] text-white/30 uppercase tracking-widest">{{ formatDate(comment.createdAt) }}</p>
                    
                    <!-- Reply Action -->
                    <button v-if="isAuthorizedUser" @click="replyToId = (replyToId === comment.id ? null : comment.id)" 
                            class="text-[10px] text-gold/60 hover:text-gold mt-2 uppercase tracking-wide font-bold">
                        [ Balas ]
                    </button>
                    
                     <!-- Nested Reply Form -->
                    <div v-if="isAuthorizedUser && replyToId === comment.id" class="mt-4 bg-[#222] p-3 rounded border border-gold/20" :class="idx % 2 === 0 ? 'ml-auto' : ''">
                        <textarea v-model="replyMessage" class="w-full bg-black/50 text-white text-xs p-2 border border-white/10 focus:border-gold outline-none" placeholder="Tulis balasan..."></textarea>
                         <div class="flex justify-end gap-2 mt-2">
                             <button @click="submitReply(comment.id)" class="px-3 py-1 bg-gold text-black text-xs font-bold uppercase">Kirim</button>
                         </div>
                    </div>

                    <!-- Replies Display -->
                     <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 space-y-2">
                         <div v-for="reply in comment.replies" :key="reply.id" class="p-3 bg-white/5 border-l border-gold/30 text-left">
                             <h5 class="text-gold text-xs font-bold mb-1">{{ reply.name }} <span class="text-[9px] font-normal opacity-50 font-serif italic">(Mempelai)</span></h5>
                             <p class="text-white/70 text-xs italic">"{{ reply.message }}"</p>
                         </div>
                     </div>
                </div>

                <!-- Empty Side for Balance -->
                <div class="hidden md:block md:w-1/2"></div>
             </div>
           </TransitionGroup>
        </div>
     </div>

     <!-- Empty State -->
     <div v-else class="text-center py-16 opacity-60">
         <i class="fas fa-feather-alt text-gold text-3xl mb-4 block"></i>
         <p class="text-white/50 font-serif italic text-sm">Jadilah yang pertama memberi doa restu...</p>
     </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

