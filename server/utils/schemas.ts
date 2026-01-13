import { z } from 'zod'

// --- SHARED SCHEMAS ---

export const RsvpSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
    name: z.string().min(1, 'Nama wajib diisi').max(50, 'Nama maksimal 50 karakter'),
    status: z.string().optional(), // 'hadir', 'tidak hadir', etc.
    message: z.string().max(500, 'Pesan maksimal 500 karakter').optional(),
    parentCommentId: z.string().optional()
})

export const InvitationSchema = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
    content: z.record(z.string(), z.any()).optional()
})

export const GuestSchema = z.object({
    id: z.string().optional(), // ID exists during update
    invitationSlug: z.string(),
    name: z.string().min(1, 'Nama tamu wajib diisi').max(100),
    phoneNumber: z.string().optional().nullable(),
    note: z.string().max(200).optional().nullable()
})

export const OrderSchema = z.object({
    plan: z.enum(['regular', 'vip', 'vvip']),
    amount: z.number().positive(),
    proofUrl: z.string().url().optional().nullable(),
    referralCode: z.string().optional().nullable()
})

export const BatchWaSchema = z.object({
    phone: z.string().min(10),
    guestName: z.string().min(1),
    invitationSlug: z.string()
})

export const SystemSettingSchema = z.object({
    key: z.string().min(1),
    value: z.any()
})

export const PartnerSchema = z.object({
    slug: z.string(),
    partnerEmail: z.string().email('Format email tidak valid')
})
