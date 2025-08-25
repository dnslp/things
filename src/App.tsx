import { useEffect } from 'react'
import useStore from './store/useStore'
import SymbolCard from './components/SymbolCard'
import PhraseBar from './components/PhraseBar'
import CategoryDock from './components/CategoryDock'
import './App.css'

function App() {
  const activeCategory = useStore(state => state.activeCategory)
  const viewMode = useStore(state => state.viewMode)
  const loadVolume = useStore(state => state.loadVolume)
  const getFilteredSymbols = useStore(state => state.getFilteredSymbols)
  
  // Get filtered symbols using the store method
  const filteredSymbols = getFilteredSymbols()
  
  // Load all volumes on mount for full experience
  useEffect(() => {
    const loadVolumes = async () => {
      // Load volumes sequentially to ensure proper loading
      for (let i = 1; i <= 7; i++) {
        await loadVolume(i)
      }
    }
    loadVolumes()
  }, [loadVolume])
  
  // Debug logging
  useEffect(() => {
    console.log('Active category:', activeCategory, 'Filtered symbols:', filteredSymbols.length)
  }, [activeCategory, filteredSymbols.length])
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>things_AAC</h1>
        </div>
        <div className="header-right">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => useStore.setState({ viewMode: 'grid' })}
          >
            Glossary
          </button>
          <button 
            className={viewMode === 'semantic' ? 'active' : ''}
            onClick={() => useStore.setState({ viewMode: 'semantic' })}
          >
            Semantic
          </button>
          <button 
            className={viewMode === 'phrase' ? 'active' : ''}
            onClick={() => useStore.setState({ viewMode: 'phrase' })}
          >
            Phrases
          </button>
        </div>
      </header>
      
      <PhraseBar />
      
      <CategoryDock />
      
      <main className="main-content">
        {viewMode === 'grid' && (
          <div className="symbol-grid">
            {filteredSymbols.map(symbol => (
              <SymbolCard
                key={`${symbol.volume}-${symbol.slug}`}
                symbol={symbol}
                isHighlighted={false}
              />
            ))}
            {filteredSymbols.length === 0 && (
              <div className="no-symbols">
                <p>No symbols found. Loading volume 1...</p>
              </div>
            )}
          </div>
        )}
        
        {viewMode === 'semantic' && (
          <div className="semantic-view">
            <h2>Semantic Web View</h2>
            <p>Select a symbol to explore relationships</p>
            <h2>Feature in development</h2>
            <p className="hint">Double-click any symbol in grid view to explore its semantic relationships</p>
          </div>
        )}
        
        {viewMode === 'phrase' && (
          <div className="phrase-templates">
            <h2>Common Phrases</h2>
              <h2>Feature in development</h2>
            <div className="phrase-template-list">
              <button className="phrase-template">I want...</button>
              <button className="phrase-template">I need...</button>
              <button className="phrase-template">Can I have...</button>
              <button className="phrase-template">I feel...</button>
              <button className="phrase-template">Let's go to...</button>
              <button className="phrase-template">I like...</button>
              <button className="phrase-template">I don't like...</button>
              <button className="phrase-template">Help me...</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App