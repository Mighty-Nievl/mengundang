import { db } from '../../server/utils/db'
import { invitations } from '../../server/db/schema'

async function inspect() {
    const all = await db.select().from(invitations)
    console.log('--- DETAILED SLUG LIST ---')
    all.forEach(inv => {
        console.log(`ID: ${inv.id}`)
        console.log(`Original Slug: [${inv.slug}]`)
        console.log(`Hex Representation: ${Buffer.from(inv.slug || '').toString('hex')}`)
        console.log(`Length: ${inv.slug?.length}`)
        console.log('---')
    })
}

inspect().then(() => process.exit(0))
