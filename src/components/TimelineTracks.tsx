import React, { useMemo } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { useClipInteraction } from '../hooks/useClipInteraction'
import Track from './Track'

const TimelineTracks: React.FC = () => {
  const { state, settings } = useTimeline()
  const { handleTimelineClick, handleTimelineMouseDown, timelineRef } = useClipInteraction()
  
  // Group overlays by row
  const trackData = useMemo(() => {
    const tracks: { [key: number]: typeof state.overlays } = {}
    
    state.overlays.forEach(overlay => {
      if (!tracks[overlay.row]) {
        tracks[overlay.row] = []
      }
      tracks[overlay.row].push(overlay)
    })
    
    // Sort overlays within each track by start time
    Object.keys(tracks).forEach(row => {
      tracks[parseInt(row)].sort((a, b) => a.startTime - b.startTime)
    })
    
    return tracks
  }, [state.overlays])
  
  // Determine the number of tracks to display
  const maxRow = Math.max(0, ...Object.keys(trackData).map(Number))
  const minTracks = 4 // Always show at least 4 tracks
  const trackCount = Math.max(minTracks, maxRow + 1)
  
  // Add vertical space above Track 1 to avoid overlapping time indicators
  const tracksTopOffset = 18
  
  // Generate timeline grid background
  const timelineWidth = state.duration * settings.pixelsPerSecond * state.zoom
  const gridLines: React.ReactElement[] = []
  const majorGridInterval = 5 // seconds
  const minorGridInterval = 1 // seconds
  
  // Generate grid lines
  for (let time = 0; time <= state.duration; time += minorGridInterval) {
    const x = time * settings.pixelsPerSecond * state.zoom
    const isMajor = time % majorGridInterval === 0
    
    gridLines.push(
      <div
        key={`grid-${time}`}
        className={`timeline-grid-line ${isMajor ? 'major' : 'minor'}`}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: isMajor ? '#444' : '#333',
          opacity: isMajor ? 0.8 : 0.4,
          pointerEvents: 'none'
        }}
      />
    )
    
    // Add time labels for major grid lines
    if (isMajor && time > 0) {
      gridLines.push(
        <div
          key={`label-${time}`}
          className="timeline-time-label"
          style={{
            position: 'absolute',
            left: `${x + 4}px`,
            top: '4px',
            fontSize: '10px',
            color: '#888',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
        </div>
      )
    }
  }
  
  return (
    <div
      ref={timelineRef}
      className="timeline-tracks-container"
      onClick={handleTimelineClick}
      onMouseDown={handleTimelineMouseDown}
      style={{
        position: 'relative',
        width: `${Math.max(timelineWidth, 800)}px`,
        minHeight: `${tracksTopOffset + trackCount * settings.trackHeight}px`,
        backgroundColor: '#1e1e1e',
        cursor: 'crosshair'
      }}
    >
      {/* Grid background */}
      <div className="timeline-grid" style={{ position: 'absolute', inset: 0 }}>
        {gridLines}
      </div>
      
      {/* Tracks */}
      <div
        className="timeline-tracks-wrapper"
        style={{ position: 'absolute', top: `${tracksTopOffset}px`, left: 0, right: 0 }}
      >
        {Array.from({ length: trackCount }, (_, index) => (
          <Track
            key={index}
            rowIndex={index}
            overlays={trackData[index] || []}
          />
        ))}
      </div>
    </div>
  )
}

export default TimelineTracks