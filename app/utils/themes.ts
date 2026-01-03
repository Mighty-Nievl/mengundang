export const THEMES = [
    {
        id: 'original',
        label: 'Original Gold',
        previewColor: '#fbf5e6', // Gold-100
        textColor: '#d4af37'      // Gold-500
    },
    {
        id: 'midnight',
        label: 'Midnight Luxury',
        previewColor: '#0c0a09', // Stone-950 (Dark)
        textColor: '#d4af37'     // Gold-500
    },
    {
        id: 'rose',
        label: 'Rose Gold',
        previewColor: '#fff1f2', // Rose-50
        textColor: '#ec4899'     // Pink-500
    },
    {
        id: 'forest',
        label: 'Forest Elegance',
        previewColor: '#f2fcf5', // Green-50
        textColor: '#ca8a04'     // Yellow-600
    }
]

export type ThemeId = 'original' | 'midnight' | 'rose' | 'forest'
