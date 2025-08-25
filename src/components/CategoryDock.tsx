import React from 'react'
import useStore from '../store/useStore'

// Category icon mappings
const CATEGORY_ICONS: Record<string, string> = {
  'All': '🌍',
  'Everyday Life': '🏠',
  'Animals': '🐾',
  'Food & Drink': '🍽️',
  'Places & Structures': '🏛️',
  'Nature & Outdoors': '🌳',
  'Vehicles & Transport': '🚗',
  'Work & Industry': '⚙️',
  'Technology & Media': '💻',
  'Entertainment & Leisure': '🎨',
  'Sports': '⚽',
  'Fashion & Style': '👕',
  'Health & Wellness': '💊',
  'Fantasy & Imagination': '🦄',
  'History & Culture': '🏺',
  'Space & Science': '🚀',
  'Countries': '🌐',
  'Events': '🎉',
  'Hobbies': '🎨',
  'Professions': '👷'
}

const CategoryDock: React.FC = () => {
  const symbols = useStore(state => state.symbols)
  const activeCategory = useStore(state => state.activeCategory)
  const setActiveCategory = useStore(state => state.setActiveCategory)
  const availableCategories = useStore(state => state.availableCategories)
  
  // Get categories that actually have symbols and deduplicate
  const categoriesWithSymbols = Array.from(new Set(
    availableCategories.filter(cat => {
      if (cat === 'All') return true
      return symbols.some(s => s.category === cat)
    })
  ))
  
  // Get a representative symbol for each category
  const getCategorySymbol = (category: string) => {
    if (category === 'All') return null
    return symbols.find(s => s.category === category)
  }
  return (
    <nav className="category-dock">
      {categoriesWithSymbols.map((category) => {
        const representativeSymbol = getCategorySymbol(category)
        const fileName = representativeSymbol?.file_name.replace(/\.[^/.]+$/, '.webp')
        const imageUrl = representativeSymbol 
          ? `/volume-${representativeSymbol.volume}/images-thumbs/${fileName}`
          : null
        
        return (
          <button
            key={category}
            className={`dock-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
            title={category}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={category}
                width={48}
                height={48}
                onError={(e) => {
                  // Fallback to icon if image fails
                  e.currentTarget.style.display = 'none'
                  const span = document.createElement('span')
                  span.className = 'category-icon'
                  span.textContent = CATEGORY_ICONS[category] || category.substring(0, 2)
                  e.currentTarget.parentElement!.appendChild(span)
                }}
              />
            ) : (
              <span className="category-icon">
                {CATEGORY_ICONS[category] || category.substring(0, 2)}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default CategoryDock