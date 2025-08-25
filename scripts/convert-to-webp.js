#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  // Full size images - reasonable quality for AAC use
  fullSize: {
    width: 512,
    height: 512,
    quality: 85, // Good quality, significant size reduction
  },
  // Thumbnail images for quick loading
  thumbnail: {
    width: 96,
    height: 96,
    quality: 80,
  }
};

async function convertImage(inputPath, outputPath, options) {
  try {
    await sharp(inputPath)
      .resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .webp({ quality: options.quality })
      .toFile(outputPath);
    
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    return {
      original: inputStats.size,
      compressed: outputStats.size,
      reduction: reduction
    };
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error.message);
    return null;
  }
}

async function processVolume(volumeNumber) {
  const volumeDir = path.join(rootDir, `volume-${volumeNumber}`);
  const imagesDir = path.join(volumeDir, 'images');
  const outputDir = path.join(rootDir, 'public', `volume-${volumeNumber}`);
  const webpDir = path.join(outputDir, 'images-webp');
  const thumbDir = path.join(outputDir, 'images-thumbs');
  
  // Check if volume exists
  try {
    await fs.access(imagesDir);
  } catch {
    console.log(`Volume ${volumeNumber} images directory not found, skipping...`);
    return { volumeNumber, totalOriginal: 0, totalCompressed: 0, fileCount: 0 };
  }
  
  // Create output directories
  await fs.mkdir(webpDir, { recursive: true });
  await fs.mkdir(thumbDir, { recursive: true });
  
  // Get all PNG files
  const files = await fs.readdir(imagesDir);
  const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
  
  console.log(`\nProcessing Volume ${volumeNumber}: ${pngFiles.length} images`);
  
  let totalOriginal = 0;
  let totalCompressed = 0;
  let totalThumb = 0;
  let processed = 0;
  
  for (const file of pngFiles) {
    const inputPath = path.join(imagesDir, file);
    const baseName = path.basename(file, '.png');
    const webpPath = path.join(webpDir, `${baseName}.webp`);
    const thumbPath = path.join(thumbDir, `${baseName}.webp`);
    
    // Convert full size
    const fullResult = await convertImage(inputPath, webpPath, CONFIG.fullSize);
    // Convert thumbnail
    const thumbResult = await convertImage(inputPath, thumbPath, CONFIG.thumbnail);
    
    if (fullResult && thumbResult) {
      totalOriginal += fullResult.original;
      totalCompressed += fullResult.compressed;
      totalThumb += thumbResult.compressed;
      processed++;
      
      if (processed % 50 === 0) {
        console.log(`  Processed ${processed}/${pngFiles.length} images...`);
      }
    }
  }
  
  const totalFinal = totalCompressed + totalThumb;
  const reduction = ((1 - totalFinal / totalOriginal) * 100).toFixed(1);
  
  console.log(`Volume ${volumeNumber} Complete:`);
  console.log(`  Original: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  WebP Full: ${(totalCompressed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  WebP Thumbs: ${(totalThumb / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Total: ${(totalFinal / 1024 / 1024).toFixed(1)} MB (${reduction}% reduction)`);
  
  return {
    volumeNumber,
    totalOriginal,
    totalCompressed: totalFinal,
    fileCount: processed
  };
}

async function main() {
  console.log('🖼️  AAC Image Optimization Tool');
  console.log('================================');
  console.log(`Full size: ${CONFIG.fullSize.width}x${CONFIG.fullSize.height} @ ${CONFIG.fullSize.quality}% quality`);
  console.log(`Thumbnails: ${CONFIG.thumbnail.width}x${CONFIG.thumbnail.height} @ ${CONFIG.thumbnail.quality}% quality`);
  
  const results = [];
  
  // Process all 7 volumes
  for (let i = 1; i <= 7; i++) {
    const result = await processVolume(i);
    results.push(result);
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 FINAL SUMMARY');
  console.log('================================');
  
  const totals = results.reduce((acc, r) => ({
    original: acc.original + r.totalOriginal,
    compressed: acc.compressed + r.totalCompressed,
    files: acc.files + r.fileCount
  }), { original: 0, compressed: 0, files: 0 });
  
  console.log(`Total files processed: ${totals.files}`);
  console.log(`Original size: ${(totals.original / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Compressed size: ${(totals.compressed / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Total reduction: ${((1 - totals.compressed / totals.original) * 100).toFixed(1)}%`);
  
  if (totals.compressed < 1024 * 1024 * 1024) {
    console.log('\n✅ Compressed size is under 1GB - suitable for GitHub Pages!');
  } else {
    console.log(`\n⚠️  Compressed size is ${(totals.compressed / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log('Consider hosting volumes separately or using a CDN.');
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { processVolume, CONFIG };