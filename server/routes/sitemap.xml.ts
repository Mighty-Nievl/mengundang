export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const baseUrl = 'https://undangan.zalan.web.id'

    // Static Routes that are crucial for SEO
    const routes = [
        '/',
        '/login',
        '/register',
        '/pricing', // Assuming we have a pricing page, if not it will 404 but better than nothing
        '/og-preview' // Technical page
    ]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes.map(route => `
    <url>
        <loc>${baseUrl}${route}</loc>
        <changefreq>daily</changefreq>
        <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>
    `).join('')}
</urlset>`

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return sitemap
})
