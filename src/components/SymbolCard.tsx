import React, { memo, useState, useEffect } from 'react'
import type { AACSymbol } from '../types'
import useStore from '../store/useStore'
import { getSymbolImagePath, getSymbolThumbnailPath, getFallbackImagePath } from '../utils/imagePaths'

interface SymbolCardProps {
  symbol: AACSymbol
  isHighlighted?: boolean
  size?: number
}

const SymbolCard: React.FC<SymbolCardProps> = memo(({ symbol, isHighlighted, size = 120 }) => {
  const { addToPhrase, logSymbolUse, setSelectedSymbol } = useStore()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Reset loading state when symbol changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [symbol.slug, symbol.volume])
  
  const handleClick = () => {
    addToPhrase(symbol.title)
    logSymbolUse(symbol.title)
  }
  
  const handleDoubleClick = () => {
    setSelectedSymbol(symbol)
    useStore.setState({ viewMode: 'semantic' })
  }
  
  const handleImageLoad = () => {
    setImageLoaded(true)
  }
  
  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true) // Stop showing skeleton on error
  }
  
  // Use WebP images for better performance
  const imageUrl = size <= 100 
    ? getSymbolThumbnailPath(symbol)
    : getSymbolImagePath(symbol)
  
  return (
    <button
      className={`symbol-card ${isHighlighted ? 'highlighted' : ''} ${!imageLoaded ? 'loading' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        width: size,
        height: size,
      }}
      aria-label={symbol.title}
    >
      <div className="symbol-image-container">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={symbol.title}
            loading="lazy"
            className={imageLoaded ? 'loaded' : ''}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <img
            src={getFallbackImagePath()}
            alt={symbol.title}
            className="loaded"
          />
        )}
      </div>
      <div className="symbol-label">
        {imageLoaded ? symbol.title : '\u00A0'}
      </div>
    </button>
  )
})

SymbolCard.displayName = 'SymbolCard'

export default SymbolCard