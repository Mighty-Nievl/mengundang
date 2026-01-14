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
       <h2 class="font-display text-3xl md:text-5xl text-gold mb-4 relative inline-block drop-shadow-md">
        <span class="relative z-10">{{ gift.title || 'Wedding Gift' }}</span>
       </h2>
       <p class="text-white/70 text-sm md:text-base leading-relaxed max-w-lg mx-auto px-4 font-serif italic tracking-wide">
         "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless."
       </p>
    </div>

    <div class="max-w-md mx-auto space-y-8 px-4">
      <!-- Bank Accounts Loop -->
      <div v-for="(acc, idx) in gift.accounts" :key="idx" class="relative group perspective reveal-on-scroll">
          
          <!-- Royal Card Component -->
          <div class="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-sm shadow-2xl overflow-hidden text-left p-8 transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <!-- Decorative Background Elements -->
              <div class="absolute inset-0 opacity-10 pointer-events-none">
                  <!-- Batik Pattern Overlay (Using Mandala as backup) -->
                 <img src="/images/themes/mandala-gold.jpg" class="w-full h-full object-cover grayscale opacity-50" />
              </div>
              <div class="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
              <div class="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl"></div>

              <!-- Card Content -->
              <div class="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                  <div class="flex justify-between items-start mb-8">
                      <!-- Gunungan Icon/Chip -->
                      <div class="w-10 opacity-80">
                         <img src="/images/themes/gunungan-motif.png" class="w-full h-auto drop-shadow-lg filter brightness-0 invert" style="filter: brightness(0.8) sepia(1) hue-rotate(5deg) saturate(3);" />
                      </div>
                      
                      <!-- Bank Name -->
                      <h3 class="font-display text-xl md:text-2xl font-bold tracking-widest text-gold opacity-90 uppercase text-right">{{ acc.bankName }}</h3>
                  </div>

                  <div class="space-y-2">
                      <p class="text-[10px] uppercase tracking-[0.3em] text-gold/50 font-serif">Nomor Rekening</p>
                      <div class="flex flex-col gap-2">
                          <p class="font-display text-2xl md:text-3xl text-white tracking-widest text-shadow drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">{{ acc.number }}</p>
                          
                          <!-- Premium Copy Button -->
                          <button @click="copyToClipboard(String(acc.number), Number(idx))" class="self-start mt-4 px-5 py-2 rounded-sm bg-white/5 hover:bg-gold hover:text-black text-gold text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 group/btn font-bold shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                              <span v-if="copiedIndex !== idx">SALIN NO. REK</span>
                              <span v-else>BERHASIL</span>
                              <i v-if="copiedIndex !== idx" class="fas fa-copy text-[10px] group-hover/btn:scale-110 transition-transform"></i>
                              <i v-else class="fas fa-check text-[10px]"></i>
                          </button>
                      </div>
                  </div>

                  <div class="mt-8 pt-6 flex justify-between items-end">
                       <div>
                          <p class="text-[10px] uppercase tracking-[0.3em] text-gold/50 mb-1 font-serif">Atas Nama</p>
                          <p class="font-medium text-lg uppercase tracking-wider text-gold-50">{{ acc.name }}</p>
                       </div>
                  </div>
              </div>
          </div>
          
          <!-- Copied Floating Badge (Toast) -->
          <Transition name="fade">
              <div v-if="copiedIndex === idx" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div class="bg-black/90 backdrop-blur border border-gold/30 text-gold px-6 py-3 rounded-sm shadow-2xl animate-fade-in-up flex items-center gap-3">
                      <i class="fas fa-check-circle text-gold"></i> 
                      <span class="uppercase tracking-widest text-xs font-bold">Tersalin</span>
                  </div>
              </div>
          </Transition>
      </div>

      <!-- QRIS -->
      <div v-if="gift.qrisUrl" class="bg-[#1a1a1a] p-6 rounded-sm shadow-lg border border-gold/20 flex flex-col items-center relative overflow-hidden reveal-on-scroll group hover:border-gold/50 transition-colors">
           <!-- Decorative Corners -->
           <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold/50"></div>
           <div class="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold/50"></div>
           <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold/50"></div>
           <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold/50"></div>
           
           <h3 class="font-display font-bold text-lg text-gold mb-6 tracking-[0.2em] uppercase">Scan Qris</h3>
           
           <div class="p-3 bg-white rounded-sm mb-6 relative group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-shadow duration-500">
                <img :src="gift.qrisUrl" alt="QRIS Code" class="w-48 h-48 md:w-56 md:h-56 object-contain" referrerpolicy="no-referrer" />
           </div>
           
           <div class="flex items-center gap-2 text-xs text-white/50 bg-black/30 px-4 py-2 rounded-full border border-white/5">
               <i class="fas fa-camera text-gold"></i>
               <span class="tracking-wide">Scan barcode untuk kirim hadiah</span>
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
