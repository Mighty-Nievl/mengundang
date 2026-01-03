import { Buffer } from 'buffer'

export interface FlipBillResponse {
    bill_id: number
    external_id: string
    amount: number
    status: string
    payment_url: string
    created_at: string
}

export const createFlipBill = async (orderId: string, amount: number, title: string) => {
    console.log('!!! FLIP BILL CREATION STARTED !!!')
    const config = useRuntimeConfig()
    const secretKey = process.env.FLIP_SECRET_KEY || config.flipSecretKey
    const isSandbox = (process.env.FLIP_ENV || config.public.flipEnv) === 'sandbox'

    // Base URL determination
    const baseUrl = isSandbox
        ? 'https://bigflip.id/big_sandbox_api/v2'
        : 'https://bigflip.id/api/v2'

    const auth = Buffer.from(`${secretKey}:`).toString('base64')

    // Debugging (Remove after fix)
    console.log(`[FlipUtility] Using Secret Key Length: ${secretKey?.length}`)
    console.log(`[FlipUtility] Secret Key Starts With Quote: ${secretKey?.startsWith("'")}`)
    console.log(`[FlipUtility] Secret Key Masked: ${secretKey?.substring(0, 4)}...${secretKey?.substring(secretKey.length - 4)}`)

    try {
        const response = await $fetch<FlipBillResponse>(`${baseUrl}/pwf/bill`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                title: title,
                amount: amount.toString(),
                type: 'SINGLE',
                expired_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0].substring(0, 16), // 24h expiration
                is_address_required: '0',
                is_phone_number_required: '0',
                step: '3' // Directly show payment methods if possible
            }).toString()
        })

        return response
    } catch (error: any) {
        console.error('[FlipUtility] Error creating bill:', error.data || error.message)
        throw error
    }
}
