import { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import SymbolCard from './SymbolCard'

type GroupingMode = 'alphabetical' | 'category' | 'tags' | 'frequency'

const GlossaryView: React.FC = () => {
  const activeCategory = useStore(state => state.activeCategory)
  const activeTags = useStore(state => state.activeTags)
  const searchQuery = useStore(state => state.searchQuery)
  const sortBy = useStore(state => state.sortBy)
  const setSortBy = useStore(state => state.setSortBy)
  const toggleTag = useStore(state => state.toggleTag)
  const clearAllTags = useStore(state => state.clearAllTags)
  const setSearchQuery = useStore(state => state.setSearchQuery)
  const getFilteredSymbols = useStore(state => state.getFilteredSymbols)
  const symbolUsage = useStore(state => state.symbolUsage)
  const availableTags = useStore(state => state.availableTags)
  
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('alphabetical')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
  // Get filtered symbols
  const symbols = useMemo(() => getFilteredSymbols(), [
    activeCategory, activeTags, searchQuery, sortBy
  ])

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(group)) {
      newExpanded.delete(group)
    } else {
      newExpanded.add(group)
    }
    setExpandedGroups(newExpanded)
  }

  const groupSymbols = () => {
    switch (groupingMode) {
      case 'alphabetical': {
        const grouped: Record<string, typeof symbols> = {}
        symbols.forEach(symbol => {
          const firstLetter = symbol.title[0].toUpperCase()
          if (!grouped[firstLetter]) grouped[firstLetter] = []
          grouped[firstLetter].push(symbol)
        })
        return grouped
      }
      
      case 'category': {
        const grouped: Record<string, typeof symbols> = {}
        symbols.forEach(symbol => {
          const category = symbol.category || 'Uncategorized'
          if (!grouped[category]) grouped[category] = []
          grouped[category].push(symbol)
        })
        return grouped
      }
      
      case 'frequency': {
        const sortedSymbols = [...symbols].sort((a, b) => {
          const aUsage = symbolUsage[a.title] || 0
          const bUsage = symbolUsage[b.title] || 0
          return bUsage - aUsage
        })
        
        return {
          'Most Used': sortedSymbols.slice(0, 20),
          'Frequently Used': sortedSymbols.slice(20, 50),
          'Sometimes Used': sortedSymbols.slice(50, 100),
          'All Others': sortedSymbols.slice(100)
        }
      }
      
      case 'tags': {
        const grouped: Record<string, typeof symbols> = {}
        symbols.forEach(symbol => {
          if (symbol.tags) {
            symbol.tags.forEach(tag => {
              if (!grouped[tag]) grouped[tag] = []
              grouped[tag].push(symbol)
            })
          } else {
            if (!grouped['No Tags']) grouped['No Tags'] = []
            grouped['No Tags'].push(symbol)
          }
        })
        return grouped
      }
      
      default:
        return {}
    }
  }

  const groupedSymbols = groupSymbols()
  const groups = Object.keys(groupedSymbols).sort()

  return (
    <div className="glossary-view">
      <div className="glossary-header">
        <h2>Symbol Glossary</h2>
        
        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Tag filters */}
        {availableTags.length > 0 && (
          <div className="tag-filters">
            <span className="filter-label">Filter by tags:</span>
            <div className="tag-chips">
              {availableTags.slice(0, 20).map(tag => (
                <button
                  key={tag}
                  className={`tag-chip ${activeTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
              {activeTags.length > 0 && (
                <button
                  className="tag-chip clear"
                  onClick={clearAllTags}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Grouping controls */}
        <div className="grouping-controls">
          <span className="control-label">Group by:</span>
          <button 
            className={groupingMode === 'alphabetical' ? 'active' : ''}
            onClick={() => setGroupingMode('alphabetical')}
          >
            A-Z
          </button>
          <button 
            className={groupingMode === 'category' ? 'active' : ''}
            onClick={() => setGroupingMode('category')}
          >
            Categories
          </button>
          <button 
            className={groupingMode === 'tags' ? 'active' : ''}
            onClick={() => setGroupingMode('tags')}
          >
            Tags
          </button>
          <button 
            className={groupingMode === 'frequency' ? 'active' : ''}
            onClick={() => setGroupingMode('frequency')}
          >
            Most Used
          </button>
        </div>
        
        {/* Sort controls */}
        <div className="sort-controls">
          <span className="control-label">Sort by:</span>
          <button
            className={sortBy === 'alphabetical' ? 'active' : ''}
            onClick={() => setSortBy('alphabetical')}
          >
            Name
          </button>
          <button
            className={sortBy === 'category' ? 'active' : ''}
            onClick={() => setSortBy('category')}
          >
            Category
          </button>
          <button
            className={sortBy === 'frequent' ? 'active' : ''}
            onClick={() => setSortBy('frequent')}
          >
            Usage
          </button>
        </div>
      </div>
      
      <div className="glossary-groups">
        {groups.map(group => (
          <div key={group} className="glossary-group">
            <div 
              className="group-header"
              onClick={() => toggleGroup(group)}
            >
              <span className="group-toggle">
                {expandedGroups.has(group) ? '▼' : '▶'}
              </span>
              <h3>{group}</h3>
              <span className="group-count">
                {groupedSymbols[group].length} symbols
              </span>
            </div>
            
            {expandedGroups.has(group) && (
              <div className="group-symbols">
                {groupedSymbols[group].map(symbol => (
                  <SymbolCard
                    key={`${symbol.volume}-${symbol.slug}`}
                    symbol={symbol}
                    size={80}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GlossaryView