import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Overlay, TimelineState, DragInfo, TimelineSettings, HistoryState } from '../types/overlays'
import { demoOverlays } from '../data/demoData'


interface TimelineContextType {
  state: TimelineState
  settings: TimelineSettings
  dragInfo: DragInfo | null
  actions: {
    // Playback actions
    play: () => void
    pause: () => void
    seek: (time: number) => void
    setCurrentTime: (time: number) => void
    
    // Overlay actions
    addOverlay: (overlay: Overlay) => void
    updateOverlay: (id: string, updates: Partial<Overlay>) => void
    updateOverlayBatch: (id: string, updates: Partial<Overlay>) => void
    deleteOverlay: (id: string) => void
    deleteOverlays: (ids: string[]) => void
    selectOverlay: (id: string, multiSelect?: boolean) => void
    clearSelection: () => void
    
    // Drag actions
    startDrag: (dragInfo: DragInfo) => void
    updateDrag: (updates: Partial<DragInfo>) => void
    endDrag: () => void
    commitDragHistory: () => void
    
    // Timeline settings
    setZoom: (zoom: number) => void
    updateSettings: (settings: Partial<TimelineSettings>) => void
    
    // History actions
    undo: () => void
    redo: () => void
    canUndo: () => boolean
    canRedo: () => boolean
  }
}

type TimelineAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'ADD_OVERLAY'; payload: Overlay }
  | { type: 'UPDATE_OVERLAY'; payload: { id: string; updates: Partial<Overlay> } }
  | { type: 'UPDATE_OVERLAY_BATCH'; payload: { id: string; updates: Partial<Overlay> } }
  | { type: 'DELETE_OVERLAY'; payload: string }
  | { type: 'DELETE_OVERLAYS'; payload: string[] }
  | { type: 'SELECT_OVERLAY'; payload: { id: string; multiSelect?: boolean } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'START_DRAG'; payload: DragInfo }
  | { type: 'UPDATE_DRAG'; payload: Partial<DragInfo> }
  | { type: 'END_DRAG' }
  | { type: 'COMMIT_DRAG_HISTORY' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimelineSettings> }
  | { type: 'UNDO' }
  | { type: 'REDO' }

interface TimelineContextState {
  history: HistoryState
  settings: TimelineSettings
  dragInfo: DragInfo | null
  dragStartState: TimelineState | null // Store state before drag starts
}

const initialTimelineState: TimelineState = {
  overlays: demoOverlays,
  currentTime: 0,
  duration: 30, // 30 seconds default
  isPlaying: false,
  zoom: 1,
  selectedOverlayIds: []
}

const initialSettings: TimelineSettings = {
  pixelsPerSecond: 50,
  trackHeight: 80,
  snapToGrid: true,
  gridSize: 0.1 // 100ms
}

const initialState: TimelineContextState = {
  history: {
    past: [],
    present: initialTimelineState,
    future: [],
    maxHistorySize: 50
  },
  settings: initialSettings,
  dragInfo: null,
  dragStartState: null
}

// Helper functions for history management
function createSnapshot(timelineState: TimelineState): TimelineState {
  return {
    ...timelineState,
    overlays: timelineState.overlays.map(overlay => ({ ...overlay }))
  }
}

function addToHistory(history: HistoryState, newState: TimelineState): HistoryState {
  const newPast = [...history.past, createSnapshot(history.present)]
  
  // Limit history size
  if (newPast.length > history.maxHistorySize) {
    newPast.shift()
  }
  
  return {
    ...history,
    past: newPast,
    present: createSnapshot(newState),
    future: [] // Clear future when a new action is performed
  }
}

function canUndo(history: HistoryState): boolean {
  return history.past.length > 0
}

function canRedo(history: HistoryState): boolean {
  return history.future.length > 0
}

function performUndo(history: HistoryState): HistoryState {
  if (!canUndo(history)) return history
  
  const previous = history.past[history.past.length - 1]
  const newPast = history.past.slice(0, -1)
  
  return {
    ...history,
    past: newPast,
    present: createSnapshot(previous),
    future: [createSnapshot(history.present), ...history.future]
  }
}

function performRedo(history: HistoryState): HistoryState {
  if (!canRedo(history)) return history
  
  const next = history.future[0]
  const newFuture = history.future.slice(1)
  
  return {
    ...history,
    past: [...history.past, createSnapshot(history.present)],
    present: createSnapshot(next),
    future: newFuture
  }
}

function timelineReducer(state: TimelineContextState, action: TimelineAction): TimelineContextState {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        history: {
          ...state.history,
          present: { ...state.history.present, isPlaying: true }
        }
      }
    
    case 'PAUSE':
      return {
        ...state,
        history: {
          ...state.history,
          present: { ...state.history.present, isPlaying: false }
        }
      }
    
    case 'SEEK':
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        history: {
          ...state.history,
          present: { ...state.history.present, currentTime: action.payload }
        }
      }
    
    case 'ADD_OVERLAY': {
      const newState = {
        ...state.history.present,
        overlays: [...state.history.present.overlays, action.payload]
      }
      return {
        ...state,
        history: addToHistory(state.history, newState)
      }
    }
    
    case 'UPDATE_OVERLAY': {
      const updatedOverlaysForUpdate = [...state.history.present.overlays]
      const updateIndex = updatedOverlaysForUpdate.findIndex(overlay => overlay.id === action.payload.id)
      if (updateIndex !== -1) {
        const updatedOverlay = { ...updatedOverlaysForUpdate[updateIndex] } as any
        Object.assign(updatedOverlay, action.payload.updates)
        updatedOverlaysForUpdate[updateIndex] = updatedOverlay
      }
      
      const newState = {
        ...state.history.present,
        overlays: updatedOverlaysForUpdate as any
      }
      
      return {
        ...state,
        history: addToHistory(state.history, newState)
      }
    }
    
    case 'UPDATE_OVERLAY_BATCH': {
      // Batch updates don't create history - used during dragging
      const updatedOverlaysForUpdate = [...state.history.present.overlays]
      const updateIndex = updatedOverlaysForUpdate.findIndex(overlay => overlay.id === action.payload.id)
      if (updateIndex !== -1) {
        const updatedOverlay = { ...updatedOverlaysForUpdate[updateIndex] } as any
        Object.assign(updatedOverlay, action.payload.updates)
        updatedOverlaysForUpdate[updateIndex] = updatedOverlay
      }
      
      return {
        ...state,
        history: {
          ...state.history,
          present: {
            ...state.history.present,
            overlays: updatedOverlaysForUpdate as any
          }
        }
      }
    }
    
    case 'DELETE_OVERLAY': {
      const newState = {
        ...state.history.present,
        overlays: state.history.present.overlays.filter(overlay => overlay.id !== action.payload),
        selectedOverlayIds: state.history.present.selectedOverlayIds.filter(id => id !== action.payload)
      }
      return {
        ...state,
        history: addToHistory(state.history, newState)
      }
    }
    
    case 'DELETE_OVERLAYS': {
      const idsToDelete = new Set(action.payload)
      const newState = {
        ...state.history.present,
        overlays: state.history.present.overlays.filter(overlay => !idsToDelete.has(overlay.id)),
        selectedOverlayIds: state.history.present.selectedOverlayIds.filter(id => !idsToDelete.has(id))
      }
      return {
        ...state,
        history: addToHistory(state.history, newState)
      }
    }
    
    case 'SELECT_OVERLAY': {
      const { id, multiSelect } = action.payload
      let newSelectedIds: string[]
      
      if (multiSelect) {
        newSelectedIds = state.history.present.selectedOverlayIds.includes(id)
          ? state.history.present.selectedOverlayIds.filter(selectedId => selectedId !== id)
          : [...state.history.present.selectedOverlayIds, id]
      } else {
        newSelectedIds = [id]
      }
      
      const updatedOverlays = [...state.history.present.overlays]
      for (let i = 0; i < updatedOverlays.length; i++) {
        (updatedOverlays[i] as any).selected = newSelectedIds.includes(updatedOverlays[i].id)
      }
      
      // Selection changes don't create history snapshots
      return {
        ...state,
        history: {
          ...state.history,
          present: {
            ...state.history.present,
            selectedOverlayIds: newSelectedIds,
            overlays: updatedOverlays as any
          }
        }
      }
    }
    
    case 'CLEAR_SELECTION': {
      const clearedOverlays = [...state.history.present.overlays]
      for (let i = 0; i < clearedOverlays.length; i++) {
        (clearedOverlays[i] as any).selected = false
      }
      
      // Selection changes don't create history snapshots
      return {
        ...state,
        history: {
          ...state.history,
          present: {
            ...state.history.present,
            selectedOverlayIds: [],
            overlays: clearedOverlays as any
          }
        }
      }
    }
    
    case 'START_DRAG':
      return {
        ...state,
        dragInfo: action.payload,
        dragStartState: createSnapshot(state.history.present) // Save state before drag
      }
    
    case 'UPDATE_DRAG':
      return {
        ...state,
        dragInfo: state.dragInfo ? { ...state.dragInfo, ...action.payload } : null
      }
    
    case 'END_DRAG':
      return {
        ...state,
        dragInfo: null
        // Don't clear dragStartState yet - wait for COMMIT_DRAG_HISTORY
      }
    
    case 'COMMIT_DRAG_HISTORY': {
      if (!state.dragStartState) return state
      
      // Create history entry from dragStartState to current state
      return {
        ...state,
        history: addToHistory({
          ...state.history,
          present: state.dragStartState
        }, state.history.present),
        dragStartState: null
      }
    }
    
    case 'SET_ZOOM':
      return {
        ...state,
        history: {
          ...state.history,
          present: { ...state.history.present, zoom: action.payload }
        }
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    case 'UNDO':
      return {
        ...state,
        history: performUndo(state.history)
      }
    
    case 'REDO':
      return {
        ...state,
        history: performRedo(state.history)
      }
    
    default:
      return state
  }
}

const TimelineContext = createContext<TimelineContextType | null>(null)

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState)
  
  const actions = {
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    seek: (time: number) => dispatch({ type: 'SEEK', payload: time }),
    setCurrentTime: (time: number) => dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    
    addOverlay: (overlay: Overlay) => dispatch({ type: 'ADD_OVERLAY', payload: overlay }),
    updateOverlay: (id: string, updates: Partial<Overlay>) => 
      dispatch({ type: 'UPDATE_OVERLAY', payload: { id, updates } }),
    updateOverlayBatch: (id: string, updates: Partial<Overlay>) => 
      dispatch({ type: 'UPDATE_OVERLAY_BATCH', payload: { id, updates } }),
    deleteOverlay: (id: string) => dispatch({ type: 'DELETE_OVERLAY', payload: id }),
    deleteOverlays: (ids: string[]) => dispatch({ type: 'DELETE_OVERLAYS', payload: ids }),
    selectOverlay: (id: string, multiSelect?: boolean) => 
      dispatch({ type: 'SELECT_OVERLAY', payload: { id, multiSelect } }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    
    startDrag: (dragInfo: DragInfo) => dispatch({ type: 'START_DRAG', payload: dragInfo }),
    updateDrag: (updates: Partial<DragInfo>) => dispatch({ type: 'UPDATE_DRAG', payload: updates }),
    endDrag: () => dispatch({ type: 'END_DRAG' }),
    commitDragHistory: () => dispatch({ type: 'COMMIT_DRAG_HISTORY' }),
    
    setZoom: (zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }),
    updateSettings: (settings: Partial<TimelineSettings>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    canUndo: () => canUndo(state.history),
    canRedo: () => canRedo(state.history)
  }
  
  const contextValue: TimelineContextType = {
    state: state.history.present,
    settings: state.settings,
    dragInfo: state.dragInfo,
    actions
  }
  
  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider')
  }
  return context
}