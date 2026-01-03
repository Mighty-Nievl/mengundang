export const getDriveIdFromUrl = (url: string): string | null => {
    if (!url) return null;

    // Pattern for Folder
    const folderMatch = url.match(/folders\/([-\w]+)/);
    if (folderMatch) return folderMatch[1] || null;

    // Pattern for File (Direct share link)
    const fileMatch = url.match(/d\/([-\w]+)/);
    if (fileMatch) return fileMatch[1] || null;

    // Pattern for open?id= (Legacy/UC format)
    const idMatch = url.match(/[?&]id=([-\w]+)/);
    if (idMatch) return idMatch[1] || null;

    // Pattern for ID only
    if (/^[-\w]{25,}$/.test(url)) return url;

    return null;
}

export const getDirectImageUrl = (fileId: string): string => {
    // drive.google.com/uc is often rate-limited or blocked (403).
    // drive.google.com/thumbnail?id=ID&sz=w1600 is very reliable for public files.
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}
