import sharp from 'sharp';

// Test conversion on one file
const testFile = 'volume-1/images/3d-printer.png';

async function test() {
  console.log('Testing WebP conversion...');
  
  // Test different quality settings
  const qualities = [60, 70, 80, 85, 90];
  
  for (const quality of qualities) {
    const output = `test-${quality}.webp`;
    
    const result = await sharp(testFile)
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toFile(output);
    
    console.log(`Quality ${quality}: ${(result.size / 1024).toFixed(0)} KB`);
  }
  
  // Test thumbnail
  const thumbResult = await sharp(testFile)
    .resize(96, 96, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toFile('test-thumb.webp');
  
  console.log(`Thumbnail: ${(thumbResult.size / 1024).toFixed(0)} KB`);
  
  // Original size
  const fs = await import('fs');
  const original = fs.statSync(testFile);
  console.log(`Original PNG: ${(original.size / 1024).toFixed(0)} KB`);
}

test().catch(console.error);