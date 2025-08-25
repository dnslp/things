import type { AACSymbol } from '../types'

/**
 * Get the full-size WebP image path for a symbol
 */
export function getSymbolImagePath(symbol: AACSymbol): string {
  const fileName = symbol.file_name.replace(/\.[^/.]+$/, '.webp')
  return `/volume-${symbol.volume}/images-webp/${fileName}`
}

/**
 * Get the thumbnail WebP image path for a symbol
 */
export function getSymbolThumbnailPath(symbol: AACSymbol): string {
  const fileName = symbol.file_name.replace(/\.[^/.]+$/, '.webp')
  return `/volume-${symbol.volume}/images-thumbs/${fileName}`
}

/**
 * Get fallback image path
 */
export function getFallbackImagePath(): string {
  return '/vite.svg'
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Preload multiple images
 */
export async function preloadImages(symbols: AACSymbol[], useThumbnails = true): Promise<void> {
  const promises = symbols.map(symbol => {
    const path = useThumbnails ? getSymbolThumbnailPath(symbol) : getSymbolImagePath(symbol)
    return preloadImage(path).catch(() => {
      console.warn(`Failed to preload image: ${path}`)
    })
  })
  
  await Promise.all(promises)
}