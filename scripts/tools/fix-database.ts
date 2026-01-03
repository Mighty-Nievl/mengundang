
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../server/db/schema';
import { eq } from 'drizzle-orm';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite, { schema });

const FOLDER_ID = '1--z5BArlOw6tWaZgp9-JUWotQk--bMzU';
const API_KEY = process.env.NUXT_GOOGLE_DRIVE_API_KEY || 'AIzaSyB7_1Swn94CRAznJZZdI2fYcCgdnwcr8es';
const SLUG = 'wulanrezal';

async function fix() {
    console.log('--- REPAIRING DATABASE FOR SLUG:', SLUG, '---');

    // 1. Fetch Fresh IDs from Folder
    const q = `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${API_KEY}&fields=files(id)`;

    console.log('Fetching fresh IDs from Drive...');
    const res = await fetch(driveApiUrl);
    const driveData: any = await res.json();

    if (!driveData.files || driveData.files.length === 0) {
        console.error('Failed to fetch IDs from folder. Is it public?');
        return;
    }

    const freshUrls = driveData.files.map((f: any) => `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`);
    console.log(`Found ${freshUrls.length} fresh images.`);

    // 2. Load Invitation from DB
    const invitation = await db.query.invitations.findFirst({
        where: eq(schema.invitations.slug, SLUG)
    });

    if (!invitation) {
        console.error('Invitation not found in DB!');
        return;
    }

    let content = invitation.content as any;
    if (typeof content === 'string') content = JSON.parse(content);

    // 3. Update Gallery
    console.log('Existing gallery count:', content.gallery?.length || 0);
    content.gallery = freshUrls; // Replacing with fresh working URLs

    // 4. Update Cover and other fields if they are LH3 to make them consistent
    const fixUrl = (url: string) => {
        if (!url) return url;
        if (url.includes('googleusercontent.com/d/')) {
            const id = url.split('/d/')[1]?.split('?')[0];
            if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
        }
        return url;
    }

    if (content.cover?.backgroundImage) content.cover.backgroundImage = fixUrl(content.cover.backgroundImage);
    if (content.hero?.backgroundImage) content.hero.backgroundImage = fixUrl(content.hero.backgroundImage);
    if (content.groom?.image) content.groom.image = fixUrl(content.groom.image);
    if (content.bride?.image) content.bride.image = fixUrl(content.bride.image);
    if (content.meta?.image) content.meta.image = fixUrl(content.meta.image);

    // 5. Save back with a fresh version to bust cache
    console.log('Saving updated content to DB...');
    const now = new Date();
    if (content.meta) content.meta.updatedAt = now.getTime();

    await db.update(schema.invitations)
        .set({ content: content, updatedAt: now })
        .where(eq(schema.invitations.slug, SLUG));

    console.log('✅ REPAIR COMPLETE!');
}

fix();
