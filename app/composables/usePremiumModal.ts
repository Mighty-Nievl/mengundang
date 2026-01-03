export interface ModalOptions {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'danger'
    confirmText?: string
    cancelText?: string
    isConfirm?: boolean
}

export const usePremiumModal = () => {
    const modalState = useState<{
        show: boolean
        options: ModalOptions
        resolve?: (val: boolean) => void
    }>('premium-modal-state', () => ({
        show: false,
        options: {
            title: '',
            message: '',
            type: 'info'
        }
    }))

    const showAlert = (options: ModalOptions) => {
        modalState.value.options = {
            ...options,
            type: options.type || 'info',
            isConfirm: false,
            confirmText: options.confirmText || 'OK'
        }
        modalState.value.show = true
        return new Promise<boolean>((resolve) => {
            modalState.value.resolve = resolve
        })
    }

    const showConfirm = (options: ModalOptions) => {
        modalState.value.options = {
            ...options,
            type: options.type || 'warning',
            isConfirm: true,
            confirmText: options.confirmText || 'Ya, Lanjutkan',
            cancelText: options.cancelText || 'Batal'
        }
        modalState.value.show = true
        return new Promise<boolean>((resolve) => {
            modalState.value.resolve = resolve
        })
    }

    const close = (result: boolean) => {
        modalState.value.show = false
        if (modalState.value.resolve) {
            modalState.value.resolve(result)
            modalState.value.resolve = undefined
        }
    }

    return {
        modalState,
        showAlert,
        showConfirm,
        close
    }
}
