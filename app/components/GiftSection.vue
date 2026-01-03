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
  <div class="gift-section space-y-8 text-center">
    <div>
       <h2 class="font-serif text-3xl text-stone-800 mb-4">Amplop Digital</h2>
       <p class="text-stone-600 text-sm leading-relaxed max-w-sm mx-auto">
         Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
       </p>
    </div>

    <div class="max-w-md mx-auto space-y-4">
      <!-- Bank Accounts Loop -->
      <div v-for="(acc, idx) in gift.accounts" :key="idx" class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div class="flex flex-col items-center">
          <h3 class="font-sans font-bold text-2xl text-blue-800 mb-2 tracking-tighter">{{ acc.bankName }}</h3>
          
          <p class="text-stone-500 text-sm mb-1">No. Rekening</p>
          <p class="font-mono text-xl font-bold text-stone-800 mb-4">{{ acc.number }}</p>
          <p class="text-stone-800 font-medium mb-6">a.n {{ acc.name }}</p>

          <button @click="copyToClipboard(String(acc.number), Number(idx))" class="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 transition-colors">
            <span v-if="copiedIndex !== idx">Salin No. Rekening</span>
            <span v-else class="text-green-600">Berhasil Disalin!</span>
            <svg v-if="copiedIndex !== idx" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 00-2-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- QRIS -->
      <div v-if="gift.qrisUrl" class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center">
          <h3 class="font-sans font-bold text-lg text-stone-800 mb-4">Scan QRIS</h3>
          <img :src="gift.qrisUrl" alt="QRIS Code" class="w-48 h-48 object-contain mb-2" referrerpolicy="no-referrer" />
          <p class="text-xs text-stone-400">Scan untuk kirim hadiah</p>
      </div>
    </div>
  </div>
</template>
