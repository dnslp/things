import { create } from 'zustand'
// import { persist } from 'zustand/middleware' // TODO: Add persistence later
import localforage from 'localforage'
import type { AACSymbol } from '../types'

interface AACStore {
  // Symbol data
  symbols: AACSymbol[]
  loadedVolumes: Set<number>
  activeCategory: string
  selectedSymbol: AACSymbol | null
  availableCategories: string[]
  availableTags: string[]
  
  // Phrase building
  currentPhrase: string[]
  phraseHistory: string[][]
  
  // UI state
  viewMode: 'grid' | 'semantic' | 'phrase'
  activeTags: string[]
  searchQuery: string
  sortBy: 'alphabetical' | 'category' | 'recent' | 'frequent'
  
  // Settings
  settings: {
    speechRate: number
    speechPitch: number
    speechVoice: string
    cardSize: number
    autoScan: boolean
    scanSpeed: number
  }
  
  // Analytics
  symbolUsage: Record<string, number>
  
  // Actions
  loadVolume: (volumeNumber: number) => Promise<void>
  setActiveCategory: (category: string) => void
  addToPhrase: (word: string) => void
  clearPhrase: () => void
  speakPhrase: () => void
  setViewMode: (mode: 'grid' | 'semantic' | 'phrase') => void
  toggleTag: (tag: string) => void
  logSymbolUse: (symbol: string) => void
  updateSettings: (settings: Partial<AACStore['settings']>) => void
  setSelectedSymbol: (symbol: AACSymbol | null) => void
  setSortBy: (sortBy: 'alphabetical' | 'category' | 'recent' | 'frequent') => void
  setSearchQuery: (query: string) => void
  clearAllTags: () => void
  getFilteredSymbols: () => AACSymbol[]
}

// Define all available categories based on analysis
const ALL_CATEGORIES = [
  'All',
  'Everyday Life',
  'Animals',
  'Food & Drink',
  'Places & Structures',
  'Nature & Outdoors',
  'Vehicles & Transport',
  'Work & Industry',
  'Technology & Media',
  'Entertainment & Leisure',
  'Sports',
  'Fashion & Style',
  'Health & Wellness',
  'Fantasy & Imagination',
  'History & Culture',
  'Space & Science',
  'Countries',
  'Events',
  'Hobbies',
  'Professions'
]

const useStore = create<AACStore>((set, get) => ({
      // Initial state
      symbols: [],
      loadedVolumes: new Set(),
      activeCategory: 'All',
      selectedSymbol: null,
      availableCategories: ALL_CATEGORIES,
      availableTags: [],
      currentPhrase: [],
      phraseHistory: [],
      viewMode: 'grid',
      activeTags: [],
      searchQuery: '',
      sortBy: 'alphabetical',
      settings: {
        speechRate: 1.0,
        speechPitch: 1.0,
        speechVoice: 'en-US',
        cardSize: 120,
        autoScan: false,
        scanSpeed: 2000
      },
      symbolUsage: {},
      
      // Actions
      loadVolume: async (volumeNumber: number) => {
        const { loadedVolumes, symbols, availableTags } = get()
        if (loadedVolumes.has(volumeNumber)) return
        
        try {
          // Load from the meta.json files in volume folders
          const response = await fetch(`/volume-${volumeNumber}/meta.json`)
          const data = await response.json()
          
          // Add volume number to each item
          const itemsWithVolume = data.items.map((item: any) => ({
            ...item,
            volume: volumeNumber
          }))
          
          // Filter out any symbols that might already exist (by volume and slug)
          const existingKeys = new Set(symbols.map(s => `${s.volume}-${s.slug}`))
          const newSymbols = itemsWithVolume.filter((item: AACSymbol) => 
            !existingKeys.has(`${volumeNumber}-${item.slug}`)
          )
          
          // Extract unique tags from new symbols
          const newTags = new Set(availableTags)
          newSymbols.forEach((symbol: AACSymbol) => {
            if (symbol.tags) {
              symbol.tags.forEach(tag => newTags.add(tag))
            }
          })
          
          set(state => ({
            symbols: [...state.symbols, ...newSymbols],
            loadedVolumes: new Set([...state.loadedVolumes, volumeNumber]),
            availableTags: Array.from(newTags).sort()
          }))
          
          // Cache in IndexedDB
          await localforage.setItem(`volume_${volumeNumber}`, data)
        } catch (error) {
          console.error(`Failed to load volume ${volumeNumber}:`, error)
        }
      },
      
      setActiveCategory: (category: string) => {
        console.log('Store: Setting active category to:', category)
        set({ activeCategory: category })
      },
      
      addToPhrase: (word: string) => {
        const { currentPhrase, settings } = get()
        set({ currentPhrase: [...currentPhrase, word] })
        
        // Speak the word
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.rate = settings.speechRate
          utterance.pitch = settings.speechPitch
          window.speechSynthesis.speak(utterance)
        }
      },
      
      clearPhrase: () => {
        const { currentPhrase, phraseHistory } = get()
        if (currentPhrase.length > 0) {
          set({
            currentPhrase: [],
            phraseHistory: [...phraseHistory, currentPhrase]
          })
        }
      },
      
      speakPhrase: () => {
        const { currentPhrase, settings } = get()
        const text = currentPhrase.join(' ')
        
        if ('speechSynthesis' in window && text) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.rate = settings.speechRate
          utterance.pitch = settings.speechPitch
          window.speechSynthesis.speak(utterance)
        }
      },
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleTag: (tag: string) => {
        const { activeTags } = get()
        const newTags = activeTags.includes(tag)
          ? activeTags.filter(t => t !== tag)
          : [...activeTags, tag]
        set({ activeTags: newTags })
      },
      
      logSymbolUse: (symbol: string) => {
        const { symbolUsage } = get()
        const count = (symbolUsage[symbol] || 0) + 1
        set({ symbolUsage: { ...symbolUsage, [symbol]: count } })
      },
      
      updateSettings: (newSettings) => {
        const { settings } = get()
        set({ settings: { ...settings, ...newSettings } })
      },
      
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      clearAllTags: () => set({ activeTags: [] }),
      
      getFilteredSymbols: () => {
        const { symbols, activeCategory, activeTags, searchQuery, sortBy, symbolUsage } = get()
        
        // Deduplicate symbols first (in case of any duplicates)
        const uniqueSymbols = Array.from(
          new Map(symbols.map(s => [`${s.volume}-${s.slug}`, s])).values()
        )
        
        // Filter by category
        let filtered = activeCategory === 'All' 
          ? uniqueSymbols 
          : uniqueSymbols.filter(s => s.category === activeCategory)
        
        // Filter by active tags
        if (activeTags.length > 0) {
          filtered = filtered.filter(symbol => 
            symbol.tags && activeTags.some(tag => symbol.tags.includes(tag))
          )
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(symbol => 
            symbol.title.toLowerCase().includes(query) ||
            (symbol.tags && symbol.tags.some(tag => tag.toLowerCase().includes(query)))
          )
        }
        
        // Sort
        switch (sortBy) {
          case 'alphabetical':
            return filtered.sort((a, b) => a.title.localeCompare(b.title))
          case 'category':
            return filtered.sort((a, b) => {
              const catCompare = a.category.localeCompare(b.category)
              return catCompare !== 0 ? catCompare : a.title.localeCompare(b.title)
            })
          case 'recent':
            // TODO: Implement recent sorting based on usage timestamps
            return filtered
          case 'frequent':
            return filtered.sort((a, b) => {
              const aUsage = symbolUsage[a.slug] || 0
              const bUsage = symbolUsage[b.slug] || 0
              return bUsage - aUsage
            })
          default:
            return filtered
        }
      }
    }))

export default useStore