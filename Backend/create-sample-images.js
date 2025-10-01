const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create uploads/images directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Image filenames from the database
const imageFiles = [
    'image-1759087372185-63185228.jpeg',
    'image-1759087611406-308787735.jpg',
    'image-1759087665104-508785104.jpeg'
];

// Achievement titles for the images
const achievementTitles = [
    'Battle of Minds Bootcamp',
    'ISCEA Scholarship',
    'National Blockchain Olympiad'
];

async function createSampleImage(filename, title) {
    try {
        // Create a simple colored rectangle with text as a sample image
        const width = 400;
        const height = 300;
        
        // Create SVG content for the image
        const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#2563eb"/>
            <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="#1e40af" stroke="#ffffff" stroke-width="2"/>
            <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
                Achievement Certificate
            </text>
            <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
                ${title}
            </text>
            <text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" fill="#93c5fd" font-family="Arial, sans-serif" font-size="12">
                Sample Image
            </text>
        </svg>`;

        // Convert SVG to JPEG using sharp
        const outputPath = path.join(uploadsDir, filename);
        
        await sharp(Buffer.from(svgContent))
            .jpeg({ quality: 80 })
            .toFile(outputPath);
            
        console.log(`Created: ${filename}`);
        
    } catch (error) {
        console.error(`Error creating ${filename}:`, error);
    }
}

async function createAllImages() {
    console.log('Creating sample achievement images...');
    
    for (let i = 0; i < imageFiles.length; i++) {
        await createSampleImage(imageFiles[i], achievementTitles[i]);
    }
    
    console.log('All sample images created successfully!');
}

createAllImages().catch(console.error);