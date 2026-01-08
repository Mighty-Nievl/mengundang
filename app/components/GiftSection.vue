<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  gift: any
}>()

const copiedIndex = ref<number | null>(null)

const copyToClipboard = async (text: string, index: number) => {
  try {
      if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
      } else {
          // Fallback for older browsers / non-secure contexts
          const textArea = document.createElement("textarea")
          textArea.value = text
          textArea.style.position = "fixed"
          textArea.style.left = "-9999px"
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          try {
              document.execCommand('copy')
          } catch (err) {
              console.error('Fallback copy failed', err)
              alert('Gagal menyalin. Silakan salin manual.')
              return
          }
          document.body.removeChild(textArea)
      }
      
      // Success Feedback
      copiedIndex.value = index
      setTimeout(() => {
          if (copiedIndex.value === index) {
              copiedIndex.value = null
          }
      }, 2000)

  } catch (err) {
      console.error('Copy failed', err)
      alert('Gagal menyalin. Izin browser mungkin ditolak.')
  }
}
</script>

<template>
  <div class="gift-section space-y-12 text-center" id="gift">
    <div class="reveal-on-scroll">
       <h2 class="font-serif text-3xl md:text-4xl text-stone-800 mb-6 relative inline-block">
        <span class="relative z-10">Wedding Gift</span>
        <div class="absolute -bottom-2 left-0 right-0 h-1 bg-gold-300 rounded-full opacity-50"></div>
       </h2>
       <p class="text-stone-600 text-sm md:text-base leading-relaxed max-w-lg mx-auto px-4 italic">
         "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless."
       </p>
    </div>

    <div class="max-w-md mx-auto space-y-8 px-4">
      <!-- Bank Accounts Loop -->
      <div v-for="(acc, idx) in gift.accounts" :key="idx" class="relative group perspective reveal-on-scroll">
          
          <!-- Credit Card Component -->
          <div class="relative bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl shadow-xl overflow-hidden text-left p-8 text-gold-100 border border-stone-700/50 transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <!-- Decorative Background Elements -->
              <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
              <div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

              <!-- Card Content -->
              <div class="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                  <div class="flex justify-between items-start mb-8">
                      <!-- Chip -->
                      <div class="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md border border-yellow-600/30 flex items-center justify-center overflow-hidden">
                          <div class="w-full h-[1px] bg-yellow-600/50 my-[2px]"></div>
                          <div class="absolute w-[1px] h-full bg-yellow-600/50 mx-[2px]"></div>
                      </div>
                      
                      <!-- Bank Name -->
                      <h3 class="font-serif text-xl md:text-2xl font-bold tracking-widest text-gold-200 opacity-90 uppercase">{{ acc.bankName }}</h3>
                  </div>

                  <div class="space-y-1">
                      <p class="text-[10px] uppercase tracking-[0.2em] text-stone-400">Nomor Rekening</p>
                      <div class="flex items-center gap-3">
                          <p class="font-mono text-2xl md:text-3xl font-bold text-white tracking-widest text-shadow drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">{{ acc.number }}</p>
                          
                          <!-- Copy Button -->
                          <button @click="copyToClipboard(String(acc.number), Number(idx))" class="ml-auto w-8 h-8 rounded-full bg-gold-500/20 hover:bg-gold-500 text-gold-400 hover:text-stone-900 flex items-center justify-center transition-all active:scale-95 backdrop-blur-sm" title="Salin">
                              <i v-if="copiedIndex !== idx" class="fas fa-copy text-sm"></i>
                              <i v-else class="fas fa-check text-sm"></i>
                          </button>
                      </div>
                  </div>

                  <div class="mt-8 flex justify-between items-end">
                       <div>
                          <p class="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">Atas Nama</p>
                          <p class="font-medium text-lg uppercase tracking-wider text-gold-50">{{ acc.name }}</p>
                       </div>
                       <div class="text-2xl text-gold-500/50">
                            <!-- Optional Card Type Logo/Icon -->
                           <i class="fab fa-cc-visa" v-if="acc.bankName.toLowerCase().includes('bca') || acc.bankName.toLowerCase().includes('mandiri')"></i>
                           <i class="fas fa-wallet" v-else></i>
                       </div>
                  </div>
              </div>
          </div>
          
          <!-- Copied Floating Badge -->
          <Transition name="fade">
              <div v-if="copiedIndex === idx" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div class="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl animate-fade-in-up">
                      <i class="fas fa-check-circle text-green-400 mr-2"></i> Berhasil Disalin
                  </div>
              </div>
          </Transition>
      </div>

      <!-- QRIS -->
      <div v-if="gift.qrisUrl" class="bg-white p-6 rounded-2xl shadow-lg border border-stone-100 flex flex-col items-center relative overflow-hidden reveal-on-scroll">
           <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300"></div>
           
           <h3 class="font-sans font-bold text-lg text-stone-800 mb-4 tracking-wide uppercase">Scan Qris</h3>
           <div class="p-2 border-2 border-dashed border-stone-200 rounded-xl mb-4 bg-stone-50">
                <img :src="gift.qrisUrl" alt="QRIS Code" class="w-48 h-48 md:w-56 md:h-56 object-contain mix-blend-multiply" referrerpolicy="no-referrer" />
           </div>
           
           <div class="flex items-center gap-2 text-xs text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
               <i class="fas fa-camera"></i>
               <span>Scan barcode untuk kirim hadiah</span>
           </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-shadow {
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
