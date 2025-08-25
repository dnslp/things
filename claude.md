# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AAC Communication App

## Project Overview

This is an Augmentative and Alternative Communication (AAC) app designed for elementary school children with autism spectrum disorder. The app provides a visual symbol-based communication system with advanced semantic features to help non-verbal or minimally verbal students express themselves effectively.

**Current Status**: Initial React + TypeScript + Vite template setup. The AAC functionality needs to be implemented.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Type checking (happens during build)
tsc -b
```

## Data Processing Commands

```bash
# Convert PNG to WebP (requires cwebp installation)
# Generate thumbnails (96x96)
cwebp -resize 96 96 input.png -o output_thumb.webp

# Convert full-size images
cwebp input.png -o output.webp

# Process all volumes (to be implemented)
npm run process-symbols
```

## Critical Context

### Target Users
- **Primary Users**: Elementary school children (ages 5-12) with autism diagnoses
- **Secondary Users**: Special education teachers, speech-language pathologists, parents/caregivers
- **Environment**: Primarily classroom settings, also home use
- **Device Usage**: iPad/iPhone in Guided Access mode to prevent accidental exits

### Accessibility Requirements
- **MUST** work completely offline after initial load
- **MUST** support iOS Switch Control for motor-impaired users
- **MUST** work with external switches and scanning
- **MUST** be usable in Guided Access mode
- **MUST** have high contrast, clear visual symbols
- **MUST** provide immediate audio feedback

## Technical Architecture

### Current Stack
- **Framework**: React 19 with TypeScript 5.8
- **Build Tool**: Vite 7
- **Linting**: ESLint 9 with TypeScript and React plugins
- **Module System**: ES Modules

### TypeScript Configuration
- Strict mode enabled
- Target: ES2022
- JSX: react-jsx
- Module resolution: bundler mode
- Unused locals/parameters checking enabled

### Planned Architecture
- **State Management**: Zustand with persistence
- **Offline Storage**: IndexedDB via LocalForage
- **Styling**: Tailwind CSS
- **PWA**: Workbox for service workers
- **iOS Integration**: WKWebView with native bridge

### Current Project Structure
```
aac-app/
├── src/                 # React app source (template code)
│   ├── App.tsx
│   ├── main.tsx
│   └── assets/
├── volume-1/           # Core vocabulary (698 symbols)
│   ├── meta.json       # Symbol metadata for volume 1
│   └── images/         # PNG images (need WebP conversion)
├── volume-2/           # Extended vocabulary
│   ├── meta.json       # Symbol metadata for volume 2
│   └── images/         # PNG images
├── volume-3/           # Additional symbols
│   ├── meta.json       # Symbol metadata for volume 3
│   └── images/         # PNG images
├── volume-4/           # Additional symbols
│   └── meta.json       # Symbol metadata for volume 4
├── volume-5/           # Additional symbols
│   └── meta.json       # Symbol metadata for volume 5
├── volume-6/           # Additional symbols
│   └── meta.json       # Symbol metadata for volume 6
└── volume-7/           # Additional symbols
    └── meta.json       # Symbol metadata for volume 7
```

### Planned Project Structure
```
aac-app/
├── src/
│   ├── components/      # React components
│   │   ├── SymbolCard.tsx
│   │   ├── PhraseBar.tsx
│   │   ├── CategoryDock.tsx
│   │   └── SemanticWeb.tsx
│   ├── store/           # Zustand stores
│   │   └── useStore.ts
│   ├── utils/           # Utility functions
│   │   ├── speech.ts    # Speech synthesis manager
│   │   ├── semanticEngine.ts
│   │   └── iosBridge.ts # iOS native communication
│   ├── hooks/           # Custom React hooks
│   │   ├── useKeyboardNavigation.ts
│   │   └── useSwitchControl.ts
│   └── types/           # TypeScript definitions
│       └── index.ts
├── public/
│   ├── data/           # Processed symbol metadata (from meta.json files)
│   ├── images_thumbs/  # 96x96 WebP thumbnails (to be generated)
│   └── images_webp/    # Full-size WebP images (to be converted)
└── ios/
    └── _AAC/           # iOS Swift wrapper app (future)
```

## Key Features to Implement

### 1. Symbol Library
- **7 volumes** of high-quality symbols (not clipart)
- Categories merged for simplicity:
  - "Professions + Work & Industry"
  - "Technology + Entertainment + Hobbies"  
  - "Places & Structures + Countries"
- Each symbol needs:
  - Visual representation (WebP format for size efficiency)
  - Title/label
  - Category
  - Semantic tags
  - Volume number

### 2. Semantic Web System
Build semantic relationships between words to enable contextual communication:

```javascript
// Example semantic relationships
'eat' → {
  objects: ['food', 'sandwich', 'apple'],
  tools: ['fork', 'spoon', 'plate'],
  locations: ['kitchen', 'restaurant'],
  actions: ['chew', 'swallow', 'taste']
}
```

**Double-click** any symbol to explore its semantic web and find related words.

### 3. Phrase Building
- Visual phrase bar at top of screen
- Tap symbols to build phrases
- Speech synthesis on each tap
- Full phrase playback
- Phrase history tracking

### 4. Communication Modes
- **Grid View**: Traditional AAC grid layout
- **Semantic View**: Explore word relationships
- **Phrase View**: Quick access to common phrase templates

## iOS Integration Requirements

### WebView Configuration
The app must run in a WKWebView with:
- JavaScript enabled
- Custom URL scheme handler for offline resources
- Message handlers for native features:
  ```swift
  window.webkit.messageHandlers.speak.postMessage(text)
  window.webkit.messageHandlers.logSymbol.postMessage(symbol)
  window.webkit.messageHandlers.vibrate.postMessage({})
  ```

### Guided Access Support
- All navigation contained within app
- No external links
- Context menus disabled
- Text selection disabled
- Pinch-to-zoom disabled

## Data Management Requirements

### Symbol Data Format

Each volume contains a `meta.json` file with symbol metadata:

```json
{
  "object_count": 698,
  "uploaded_on": "2025-07-22 08:32:17",
  "items": [
    {
      "title": "Microwave Oven",
      "file_name": "microwave-oven.png",
      "added_on": "2025-05-15 16:06:53",
      "slug": "microwave-oven",
      "category": "Everyday Life",
      "tags": ["appliance", "kitchen"],
      "volume": 1
    }
  ]
}
```

Images are currently in PNG format in `volume-*/images/` directories and need to be converted to WebP for efficiency.

### Volume Loading Strategy
1. Volume 1 (Core Vocabulary) loads immediately
2. Additional volumes load on-demand
3. All data cached in IndexedDB
4. Images cached by service worker

## Speech Synthesis Configuration

```javascript
{
  rate: 1.0,      // Speech rate (0.1 - 2.0)
  pitch: 1.0,     // Voice pitch (0.5 - 2.0)  
  volume: 1.0,    // Volume (0.0 - 1.0)
  voice: 'en-US'  // Voice selection
}
```

### Fallback Strategy
1. Try Web Speech API
2. Fall back to iOS native synthesis via webkit bridge
3. Visual feedback if speech unavailable

## Accessibility Features to Implement

### Switch Control
- Automatic scanning with configurable speed (default: 2000ms)
- Manual scanning with external switches
- Visual highlighting during scan
- Auditory feedback on focus

### Keyboard Navigation
- Tab: Start navigation mode
- Arrow keys: Navigate symbols
- Enter/Space: Select symbol
- Escape: Exit navigation mode

### Visual Accessibility
- High contrast borders
- Large touch targets (minimum 44x44 points)
- Clear visual feedback on interaction
- Customizable symbol size

## Performance Requirements

### Image Loading
- Lazy loading with Intersection Observer
- Progressive enhancement (thumbnail → full image)
- WebP format for 30% smaller file sizes
- Virtual scrolling for large grids

### Caching Strategy
- Service Worker: Cache-first for images
- IndexedDB: Symbol metadata
- LocalStorage: User preferences
- Memory: Recent symbols cache

## Development Guidelines

### Component Best Practices
1. Use `React.memo` for symbol cards to prevent unnecessary re-renders
2. Implement virtual scrolling for grids with >100 symbols
3. Debounce search and filter operations
4. Use semantic HTML for screen reader compatibility

### AAC-Specific Considerations
1. **Immediate Feedback**: Every interaction must provide instant visual/audio feedback
2. **Error Prevention**: No destructive actions without confirmation
3. **Consistency**: Same symbols always in same positions
4. **Predictability**: No unexpected navigation or popups
5. **Customization**: Teachers can hide/show symbols per student needs

### Testing Checklist
- [ ] Works offline after first load
- [ ] Guided Access mode compatible
- [ ] Switch Control functional
- [ ] VoiceOver compatible
- [ ] Touch targets ≥44x44 points
- [ ] Speech synthesis working
- [ ] All 7 volumes load correctly
- [ ] Semantic relationships functional
- [ ] iOS native bridge working

## Implementation Priorities

1. **Data Processing**
   - Process meta.json files from all volumes
   - Convert PNG images to WebP format
   - Generate 96x96 thumbnails
   - Organize assets in public directory

2. **Core Infrastructure**
   - Set up Zustand store with persistence
   - Implement basic component structure
   - Set up Tailwind CSS

3. **Symbol System**
   - Create SymbolCard component
   - Implement symbol data loading from meta.json
   - Add basic grid layout

4. **Communication Features**
   - Implement phrase building
   - Add speech synthesis
   - Create phrase history

5. **Accessibility**
   - Add keyboard navigation
   - Implement switch control
   - Ensure WCAG compliance

6. **Offline Support**
   - Set up service worker
   - Implement IndexedDB caching
   - Test offline functionality

7. **iOS Integration**
   - Create native bridge
   - Test in WKWebView
   - Validate Guided Access mode

## Performance Metrics

Target metrics for optimal AAC experience:
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Symbol tap to speech: <100ms
- Category switch: <200ms
- Offline load time: <2s

## Known Limitations

1. iOS WebView doesn't support all Web APIs
2. Service Workers limited in WKWebView
3. Maximum 50MB localStorage per origin
4. Speech synthesis voices vary by device
5. Some CSS animations reduced in Guided Access

## Resources

- [AAC Best Practices](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://react.dev/learn/accessibility)

---

*This AAC app helps give voice to those who communicate differently. Every improvement makes a real difference in a child's ability to express themselves.*