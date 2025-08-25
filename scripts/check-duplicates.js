#!/usr/bin/env node

import { readFileSync } from 'fs';

async function checkDuplicates() {
  const allSymbols = [];
  const slugCount = {};
  
  // Load all volumes
  for (let i = 1; i <= 7; i++) {
    try {
      const data = JSON.parse(readFileSync(`volume-${i}/meta.json`, 'utf-8'));
      data.items.forEach(item => {
        const key = `${i}-${item.slug}`;
        if (slugCount[key]) {
          console.log(`DUPLICATE found in volume ${i}: ${item.slug}`);
          slugCount[key]++;
        } else {
          slugCount[key] = 1;
        }
        allSymbols.push({ ...item, volume: i });
      });
    } catch (err) {
      console.error(`Error loading volume ${i}:`, err.message);
    }
  }
  
  // Check for cross-volume duplicates
  const slugOnlyCount = {};
  allSymbols.forEach(symbol => {
    if (slugOnlyCount[symbol.slug]) {
      slugOnlyCount[symbol.slug].push(symbol.volume);
    } else {
      slugOnlyCount[symbol.slug] = [symbol.volume];
    }
  });
  
  console.log('\nTotal symbols loaded:', allSymbols.length);
  
  // Report symbols that appear in multiple volumes
  const multiVolumeSymbols = Object.entries(slugOnlyCount)
    .filter(([slug, volumes]) => volumes.length > 1)
    .slice(0, 20); // Show first 20
    
  if (multiVolumeSymbols.length > 0) {
    console.log('\nSymbols appearing in multiple volumes (first 20):');
    multiVolumeSymbols.forEach(([slug, volumes]) => {
      console.log(`  ${slug}: volumes ${volumes.join(', ')}`);
    });
    console.log(`Total cross-volume duplicates: ${Object.values(slugOnlyCount).filter(v => v.length > 1).length}`);
  } else {
    console.log('\nNo cross-volume duplicates found!');
  }
}

checkDuplicates();