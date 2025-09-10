import React from 'react'
import { usePlayback } from '../hooks/usePlayback'
import { useTimeline } from '../contexts/TimelineContext'
import { useHotkeys } from 'react-hotkeys-hook'
import { OverlayType } from '../types/overlays'
import { Play, Pause, SkipBack, SkipForward, X, Undo2, Redo2, Trash2, ZoomIn } from 'lucide-react'
import { getFrameVisibleZoom } from '../utils/timeFormat'

const TimelineHeader: React.FC = () => {
  const { currentTime, duration, isPlaying, togglePlayPause, skipToStart, skipToEnd, formatTime } = usePlayback()
  const { state, actions, settings } = useTimeline()
  
  const canUndo = actions.canUndo()
  const canRedo = actions.canRedo()
  
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const zoom = parseFloat(event.target.value)
    actions.setZoom(zoom)
  }

  const handleFrameZoom = () => {
    const frameZoom = getFrameVisibleZoom(settings.fps, settings.pixelsPerSecond)
    actions.setZoom(frameZoom)
  }

  // Keyboard shortcuts similar to main app
  useHotkeys('alt+space', (e) => { e.preventDefault(); togglePlayPause() }, { enableOnFormTags: true }, [togglePlayPause])
  useHotkeys('alt+=, alt+plus', (e) => {
    e.preventDefault()
    actions.setZoom(Math.min(state.zoom + 0.1, 20))
  }, {}, [state.zoom, actions])
  useHotkeys('alt+-, alt+minus', (e) => {
    e.preventDefault()
    actions.setZoom(Math.max(state.zoom - 0.1, 0.1))
  }, {}, [state.zoom, actions])
  useHotkeys('alt+f', (e) => {
    e.preventDefault()
    handleFrameZoom()
  }, {}, [handleFrameZoom])
  
  // Undo/Redo keyboard shortcuts
  useHotkeys('ctrl+z', (e) => {
    e.preventDefault()
    if (canUndo) actions.undo()
  }, { enableOnFormTags: true }, [canUndo, actions])
  useHotkeys('ctrl+shift+z', (e) => {
    e.preventDefault()
    if (canRedo) actions.redo()
  }, { enableOnFormTags: true }, [canRedo, actions])
  
  // Delete key functionality
  useHotkeys('delete', (e) => {
    e.preventDefault()
    handleDeleteSelected()
  }, { enableOnFormTags: true }, [state.selectedOverlayIds, actions])
  
  const handleDeleteSelected = () => {
    if (state.selectedOverlayIds.length === 0) return
    
    // Get all overlays to delete (including related transitions)
    const overlaysToDelete = new Set<string>()
    
    state.selectedOverlayIds.forEach(selectedId => {
      const overlay = state.overlays.find(o => o.id === selectedId)
      if (!overlay) return
      
      overlaysToDelete.add(selectedId)
      
      // If deleting a clip, also delete its transitions
      if (overlay.type === OverlayType.CLIP || overlay.type === OverlayType.SOUND || 
          overlay.type === OverlayType.TEXT || overlay.type === OverlayType.IMAGE || 
          overlay.type === OverlayType.CAPTION) {
        if (overlay.transitionInId) {
          overlaysToDelete.add(overlay.transitionInId)
        }
        if (overlay.transitionOutId) {
          overlaysToDelete.add(overlay.transitionOutId)
        }
      }
      
      // If deleting a transition, we don't automatically delete the parent clip
      // Only delete what's explicitly selected
    })
    
    // Delete all overlays in a single batch operation for proper undo/redo
    actions.deleteOverlays(Array.from(overlaysToDelete))
    
    // Clear selection since deleted overlays are no longer selected
    actions.clearSelection()
  }
  
  return (
    <div className="timeline-header">
      <div className="timeline-controls">
        <button 
          className="control-button"
          onClick={skipToStart}
          title="Skip to start"
        >
          <SkipBack size={16} />
        </button>
        
        <button 
          className="control-button"
          onClick={togglePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <button 
          className="control-button"
          onClick={skipToEnd}
          title="Skip to end"
        >
          <SkipForward size={16} />
        </button>
        
        <div className="timeline-divider" />
        
        <button 
          className="control-button"
          onClick={actions.undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        
        <button 
          className="control-button"
          onClick={actions.redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
        
        <div className="timeline-divider" />
        
        <button 
          className="control-button"
          onClick={handleDeleteSelected}
          disabled={state.selectedOverlayIds.length === 0}
          title="Delete selected (Delete)"
        >
          <Trash2 size={16} />
        </button>
        
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      <div className="timeline-settings">
        <label htmlFor="zoom-slider">
          Zoom: {state.zoom.toFixed(1)}x
        </label>
        <input
          id="zoom-slider"
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={state.zoom}
          onChange={handleZoomChange}
          style={{ marginLeft: '8px', width: '100px' }}
        />
        
        <button 
          className="control-button"
          onClick={handleFrameZoom}
          title="Zoom to show individual frames"
          style={{ marginLeft: '8px' }}
        >
          <ZoomIn size={16} />
        </button>
        
        <button 
          className="control-button"
          onClick={() => actions.clearSelection()}
          title="Clear selection"
        >
          <X size={16} />
        </button>
        
        <div className="selected-count">
          {state.selectedOverlayIds.length > 0 && (
            <span>{state.selectedOverlayIds.length} selected</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimelineHeader