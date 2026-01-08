import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public'); // Adjust path as needed

// List of specific files to convert or scan directory
const filesToConvert = [
    'logo_loader.png',
    'logo_refined_hd.png',
    'cover.png',
    'banner.png'
];

async function convertImages() {
    console.log(`Scanning ${publicDir}...`);

    for (const file of filesToConvert) {
        const filePath = path.join(publicDir, file);
        if (fs.existsSync(filePath)) {
            const fileName = path.parse(file).name;
            const outputPath = path.join(publicDir, `${fileName}.webp`);

            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                const originalSize = fs.statSync(filePath).size / 1024;
                const newSize = fs.statSync(outputPath).size / 1024;

                console.log(`✅ Converted ${file}: ${originalSize.toFixed(2)}KB -> ${newSize.toFixed(2)}KB (Saved ${(originalSize - newSize).toFixed(2)}KB)`);
            } catch (err) {
                console.error(`❌ Failed to convert ${file}:`, err);
            }
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    }
}

convertImages();
