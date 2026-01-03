export const useWebsiteData = (slug?: string) => {
    const params = slug ? { slug } : { slug: 'demo' }
    const key = `website-content-${slug || 'demo'}`

    return useFetch('/api/content', {
        key,
        query: params,
        default: () => ({
            meta: { title: '', description: '' },
            hero: { groomNickname: '', brideNickname: '', date: '' },
            groom: { fullName: '', parents: '', instagram: '', image: '' },
            bride: { fullName: '', parents: '', instagram: '', image: '' },
            events: {
                akad: { time: '', date: '', location: '', mapUrl: '', isoDate: new Date().toISOString() },
                resepsi: { time: '', date: '', location: '', mapUrl: '' }
            },
            gift: { bankName: '', accountNumber: '', accountName: '' },
            music: { url: '' },
            rsvp: { phone: '' }
        })
    })
}
