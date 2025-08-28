import React from 'react'
import { usePlayback } from '../hooks/usePlayback'
import { useTimeline } from '../contexts/TimelineContext'
import { useHotkeys } from 'react-hotkeys-hook'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'

const TimelineHeader: React.FC = () => {
  const { currentTime, duration, isPlaying, togglePlayPause, skipToStart, skipToEnd, formatTime } = usePlayback()
  const { state, actions } = useTimeline()
  
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const zoom = parseFloat(event.target.value)
    actions.setZoom(zoom)
  }

  // Keyboard shortcuts similar to main app
  useHotkeys('alt+space', (e) => { e.preventDefault(); togglePlayPause() }, { enableOnFormTags: true }, [togglePlayPause])
  useHotkeys('alt+=, alt+plus', (e) => {
    e.preventDefault()
    actions.setZoom(Math.min(state.zoom + 0.1, 5))
  }, {}, [state.zoom, actions])
  useHotkeys('alt+-, alt+minus', (e) => {
    e.preventDefault()
    actions.setZoom(Math.max(state.zoom - 0.1, 0.1))
  }, {}, [state.zoom, actions])
  
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
          max="5"
          step="0.1"
          value={state.zoom}
          onChange={handleZoomChange}
          style={{ marginLeft: '8px', width: '100px' }}
        />
        
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