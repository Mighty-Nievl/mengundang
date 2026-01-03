import { db } from './server/utils/db'
import { invitations } from './server/db/schema'

async function listInvites() {
    try {
        const all = await db.select().from(invitations)
        console.log('---INVITATIONS---')
        console.log(JSON.stringify(all.map(i => ({ id: i.id, slug: i.slug, owner: i.owner })), null, 2))
        console.log('---END---')
    } catch (e) {
        console.error(e)
    } finally {
        process.exit(0)
    }
}

listInvites()
