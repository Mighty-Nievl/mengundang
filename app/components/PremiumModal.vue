<script setup lang="ts">
const { modalState, close } = usePremiumModal()

const iconClass = computed(() => {
    switch (modalState.value.options.type) {
        case 'success': return 'fa-check-circle text-emerald-500'
        case 'warning': return 'fa-exclamation-triangle text-amber-500'
        case 'danger': return 'fa-times-circle text-rose-500'
        default: return 'fa-info-circle text-blue-500'
    }
})

const typeBgClass = computed(() => {
    switch (modalState.value.options.type) {
        case 'success': return 'bg-emerald-50'
        case 'warning': return 'bg-amber-50'
        case 'danger': return 'bg-rose-50'
        default: return 'bg-blue-50'
    }
})
</script>

<template>
    <Transition name="modal-fade">
        <div v-if="modalState.show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-md" @click="modalState.options.isConfirm ? null : close(false)"></div>
            
            <!-- Modal Card -->
            <div class="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300">
                
                <!-- Icon Header -->
                <div :class="['h-32 flex items-center justify-center text-5xl', typeBgClass]">
                     <div class="relative">
                        <i class="fas" :class="iconClass"></i>
                        <div class="absolute inset-0 blur-xl opacity-30 animate-pulse" :class="iconClass"></div>
                     </div>
                </div>

                <!-- Content -->
                <div class="p-8 text-center">
                    <h3 class="text-xl font-serif font-bold text-stone-900 mb-2">
                        {{ modalState.options.title }}
                    </h3>
                    <p class="text-sm text-stone-500 leading-relaxed">
                        {{ modalState.options.message }}
                    </p>
                </div>

                <!-- Footer / Actions -->
                <div class="p-6 pt-0 flex gap-3">
                    <button 
                        v-if="modalState.options.isConfirm"
                        @click="close(false)"
                        class="flex-1 px-6 py-3 rounded-2xl bg-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-200 transition-all active:scale-95"
                    >
                        {{ modalState.options.cancelText }}
                    </button>
                    <button 
                        @click="close(true)"
                        class="flex-1 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-stone-200"
                        :class="[
                            modalState.options.type === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700' : 
                            'bg-stone-900 text-white hover:bg-black'
                        ]"
                    >
                        {{ modalState.options.confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
    transform: scale(0.9) translateY(30px);
}

.modal-fade-enter-to .relative,
.modal-fade-leave-to .relative {
    transform: scale(1) translateY(0);
}
</style>
