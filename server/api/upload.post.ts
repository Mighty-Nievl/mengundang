import { writeFile, mkdir } from 'fs/promises'
import { resolve, join } from 'path'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    const session = await auth.api.getSession({ headers: event.headers })
    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized - Please login to upload' })
    }

    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
    }

    const uploadedFile = files[0]
    if (!uploadedFile) {
        throw createError({ statusCode: 400, statusMessage: 'No file found' })
    }
    const fileExt = uploadedFile.filename?.split('.').pop() || 'png'
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`

    // Check for R2 Configuration
    const config = useRuntimeConfig()
    const r2Config = {
        accountId: process.env.R2_ACCOUNT_ID,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL // e.g., https://cdn.undangan.zalan.web.id
    }

    // 1. R2 / Cloud Storage Mode
    if (r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucketName) {
        try {
            const S3 = new S3Client({
                region: 'auto',
                endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: r2Config.accessKeyId,
                    secretAccessKey: r2Config.secretAccessKey
                }
            })

            await S3.send(new PutObjectCommand({
                Bucket: r2Config.bucketName,
                Key: fileName,
                Body: uploadedFile.data,
                ContentType: uploadedFile.type,
            }))

            const finalUrl = r2Config.publicUrl
                ? `${r2Config.publicUrl}/${fileName}`
                : `https://pub-${r2Config.accountId}.r2.dev/${fileName}` // Raw R2 URL fallback

            return { url: finalUrl, provider: 'R2' }
        } catch (e: any) {
            console.error('[R2 Upload Error] Fallback to local:', e)
            // Fallthrough to local upload...
        }
    }

    // 2. Local Disk Mode (Fallback)
    const uploadDir = resolve(process.cwd(), 'public/uploads')
    const filePath = join(uploadDir, fileName)

    try {
        await mkdir(uploadDir, { recursive: true })
        await writeFile(filePath, uploadedFile.data)
        return { url: `/uploads/${fileName}`, provider: 'Local' }
    } catch (error) {
        console.error('Upload Error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to save file' })
    }
})
