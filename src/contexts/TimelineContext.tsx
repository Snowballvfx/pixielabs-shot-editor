import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Overlay, TimelineState, DragInfo, TimelineSettings } from '../types/overlays'
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
    deleteOverlay: (id: string) => void
    selectOverlay: (id: string, multiSelect?: boolean) => void
    clearSelection: () => void
    
    // Drag actions
    startDrag: (dragInfo: DragInfo) => void
    updateDrag: (updates: Partial<DragInfo>) => void
    endDrag: () => void
    
    // Timeline settings
    setZoom: (zoom: number) => void
    updateSettings: (settings: Partial<TimelineSettings>) => void
  }
}

type TimelineAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'ADD_OVERLAY'; payload: Overlay }
  | { type: 'UPDATE_OVERLAY'; payload: { id: string; updates: Partial<Overlay> } }
  | { type: 'DELETE_OVERLAY'; payload: string }
  | { type: 'SELECT_OVERLAY'; payload: { id: string; multiSelect?: boolean } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'START_DRAG'; payload: DragInfo }
  | { type: 'UPDATE_DRAG'; payload: Partial<DragInfo> }
  | { type: 'END_DRAG' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimelineSettings> }

interface TimelineContextState {
  timeline: TimelineState
  settings: TimelineSettings
  dragInfo: DragInfo | null
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
  timeline: initialTimelineState,
  settings: initialSettings,
  dragInfo: null
}

function timelineReducer(state: TimelineContextState, action: TimelineAction): TimelineContextState {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        timeline: { ...state.timeline, isPlaying: true }
      }
    
    case 'PAUSE':
      return {
        ...state,
        timeline: { ...state.timeline, isPlaying: false }
      }
    
    case 'SEEK':
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        timeline: { ...state.timeline, currentTime: action.payload }
      }
    
    case 'ADD_OVERLAY':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: [...state.timeline.overlays, action.payload]
        }
      }
    
    case 'UPDATE_OVERLAY':
      const updatedOverlaysForUpdate = [...state.timeline.overlays]
      const updateIndex = updatedOverlaysForUpdate.findIndex(overlay => overlay.id === action.payload.id)
      if (updateIndex !== -1) {
        const updatedOverlay = { ...updatedOverlaysForUpdate[updateIndex] } as any
        Object.assign(updatedOverlay, action.payload.updates)
        updatedOverlaysForUpdate[updateIndex] = updatedOverlay
      }
      
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: updatedOverlaysForUpdate as any
        }
      }
    
    case 'DELETE_OVERLAY':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.filter(overlay => overlay.id !== action.payload),
          selectedOverlayIds: state.timeline.selectedOverlayIds.filter(id => id !== action.payload)
        }
      }
    
    case 'SELECT_OVERLAY':
      const { id, multiSelect } = action.payload
      let newSelectedIds: string[]
      
      if (multiSelect) {
        newSelectedIds = state.timeline.selectedOverlayIds.includes(id)
          ? state.timeline.selectedOverlayIds.filter(selectedId => selectedId !== id)
          : [...state.timeline.selectedOverlayIds, id]
      } else {
        newSelectedIds = [id]
      }
      
      const updatedOverlays = [...state.timeline.overlays]
      for (let i = 0; i < updatedOverlays.length; i++) {
        (updatedOverlays[i] as any).selected = newSelectedIds.includes(updatedOverlays[i].id)
      }
      
      return {
        ...state,
        timeline: {
          ...state.timeline,
          selectedOverlayIds: newSelectedIds,
          overlays: updatedOverlays as any
        }
      }
    
    case 'CLEAR_SELECTION':
      const clearedOverlays = [...state.timeline.overlays]
      for (let i = 0; i < clearedOverlays.length; i++) {
        (clearedOverlays[i] as any).selected = false
      }
      
      return {
        ...state,
        timeline: {
          ...state.timeline,
          selectedOverlayIds: [],
          overlays: clearedOverlays as any
        }
      }
    
    case 'START_DRAG':
      return {
        ...state,
        dragInfo: action.payload
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
      }
    
    case 'SET_ZOOM':
      return {
        ...state,
        timeline: { ...state.timeline, zoom: action.payload }
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
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
    deleteOverlay: (id: string) => dispatch({ type: 'DELETE_OVERLAY', payload: id }),
    selectOverlay: (id: string, multiSelect?: boolean) => 
      dispatch({ type: 'SELECT_OVERLAY', payload: { id, multiSelect } }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    
    startDrag: (dragInfo: DragInfo) => dispatch({ type: 'START_DRAG', payload: dragInfo }),
    updateDrag: (updates: Partial<DragInfo>) => dispatch({ type: 'UPDATE_DRAG', payload: updates }),
    endDrag: () => dispatch({ type: 'END_DRAG' }),
    
    setZoom: (zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }),
    updateSettings: (settings: Partial<TimelineSettings>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }
  
  const contextValue: TimelineContextType = {
    state: state.timeline,
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