export default defineEventHandler(() => {
    return {
        success: true,
        message: 'Pong',
        timestamp: new Date().toISOString()
    }
})
