import React from 'react'
import useStore from '../store/useStore'

const PhraseBar: React.FC = () => {
  const { currentPhrase, speakPhrase, clearPhrase } = useStore()
  
  return (
    <div className="phrase-bar">
      <div className="phrase-display">
        {currentPhrase.length === 0 ? (
          <span className="placeholder">Tap symbols to build phrase...</span>
        ) : (
          currentPhrase.map((word, idx) => (
            <span key={idx} className="phrase-word">
              {word}
            </span>
          ))
        )}
      </div>
      <div className="phrase-actions">
        <button
          onClick={speakPhrase}
          disabled={currentPhrase.length === 0}
          className="btn-speak"
          aria-label="Speak phrase"
        >
          🔊
        </button>
        <button
          onClick={clearPhrase}
          disabled={currentPhrase.length === 0}
          className="btn-clear"
          aria-label="Clear phrase"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default PhraseBar