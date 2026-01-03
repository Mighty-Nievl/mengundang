import { getDriveIdFromUrl, getDirectImageUrl } from '../../utils/google-drive'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const folderUrl = query.url as string

    if (!folderUrl) {
        throw createError({ statusCode: 400, statusMessage: 'Folder URL is required' })
    }

    const folderId = getDriveIdFromUrl(folderUrl)
    console.log('Drive Sync Request:', { folderUrl, folderId }) // DEBUG LOG

    if (!folderId) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid Google Drive URL' })
    }

    const apiKey = process.env.NUXT_GOOGLE_DRIVE_API_KEY
    if (!apiKey) {
        console.error('Server Error: Missing NUXT_GOOGLE_DRIVE_API_KEY')
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Google Drive API Key is missing. Please add NUXT_GOOGLE_DRIVE_API_KEY to .env'
        })
    }

    try {
        // Query to list files in the folder which are images and not trashed
        const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)`

        const response: any = await $fetch(driveApiUrl)

        if (!response.files) {
            console.warn('Drive Response has no files:', response)
            return []
        }

        return response.files.map((file: any) => {
            // Force the robust Drive Thumbnail Proxy for all files
            const hdUrl = getDirectImageUrl(file.id)

            return {
                id: file.id,
                name: file.name,
                url: hdUrl,
                thumbnail: file.thumbnailLink
            }
        })

    } catch (error: any) {
        console.error('Google Drive API Error Detailed:', error.data || error.message || error)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to fetch from Google Drive: ${error.message || 'Unknown Error'}. Ensure folder is Public.`
        })
    }
})
