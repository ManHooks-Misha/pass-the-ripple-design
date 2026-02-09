// scripts/convert-to-webp.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Images to convert (relative to project root)
const imagesToConvert = [
    // Public assets - teachers
    'public/assets/teachers/hero-classroom.jpg',
    'public/assets/teachers/how-it-works-start.jpg',
    'public/assets/teachers/how-it-works-act.jpg',
    'public/assets/teachers/how-it-works-reflect.jpg',
    'public/assets/teachers/sel-moments.jpg',
    'public/assets/teachers/teacher-dashboard-preview.jpg',
    'public/assets/teachers/privacy-safety.jpg',
    'public/assets/teachers/sel-competencies.jpg',
    'public/assets/teachers/resources-preview.jpg',
    'public/assets/teachers/cta-background.jpg',

    // Public assets - ripple-map
    'public/assets/ripple-map/world-journey-hero.jpg',
    'public/assets/ripple-map/journey-example.jpg',
    'public/assets/ripple-map/journey-detail.jpg',
    'public/assets/ripple-map/class-impact.png',
    'public/assets/ripple-map/privacy-comparison.png',
    'public/assets/ripple-map/kindness-connects.jpg',

    // Public assets - challenges
    'public/assets/images/challenges/challenges-collage.jpg',
    'public/assets/images/challenges/community-champions-card.png',
    'public/assets/images/challenges/challenges-icons.jpg',
    'public/assets/images/challenges/at-home-helpers.jpg',
    'public/assets/images/challenges/school-superstars.jpg',
    'public/assets/images/challenges/friendship-builders.jpg',
    'public/assets/images/challenges/gratitude-giver.jpg',
    'public/assets/images/challenges/school-superstars-card.png',
    'public/assets/images/challenges/friendship-builders-card.png',

    // Src assets - hero-wall
    'src/assets/hero-wall/wall-banner.png',
    'src/assets/hero-wall/story-scene.jpg',
    'src/assets/hero-wall/card-helper.png',
    'src/assets/hero-wall/card-share.png',
    'src/assets/hero-wall/card-invite.png',
    'src/assets/hero-wall/card-thankyou.png',
    'src/assets/hero-wall/community-hands.jpg',

    // Src assets - highlights
    'src/assets/highlights/kindness-swirl.jpg',
    'src/assets/highlights/celebration-ring.jpg',
    'src/assets/highlights/example-room-3b.jpg',
    'src/assets/highlights/example-dashboard-pie.jpg',
    'src/assets/highlights/example-impact-graph.jpg',
    'src/assets/highlights/morning-meeting.jpg',

    // Shared src assets
    'src/assets/water-pencil-texture.png',
    'src/assets/Footprint.png',
];

async function convertToWebp(inputPath) {
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    try {
        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipped (not found): ${inputPath}`);
            return null;
        }

        await sharp(inputPath)
            .webp({ quality: 85 })
            .toFile(outputPath);

        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
        return { input: inputPath, output: outputPath, savings };
    } catch (error) {
        console.error(`❌ Error converting ${inputPath}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting WebP conversion...\n');

    const results = [];
    for (const imagePath of imagesToConvert) {
        const result = await convertToWebp(imagePath);
        if (result) results.push(result);
    }

    console.log(`\n✨ Converted ${results.length} images to WebP format!`);

    // Calculate total savings
    let totalOriginal = 0;
    let totalWebp = 0;
    for (const r of results) {
        totalOriginal += fs.statSync(r.input).size;
        totalWebp += fs.statSync(r.output).size;
    }

    const totalSavings = ((totalOriginal - totalWebp) / totalOriginal * 100).toFixed(1);
    console.log(`📊 Total size reduction: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalWebp / 1024 / 1024).toFixed(2)}MB (${totalSavings}% smaller)`);
}

main().catch(console.error);
