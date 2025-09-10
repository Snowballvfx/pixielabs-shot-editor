import React, { useMemo } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { useClipInteraction } from '../hooks/useClipInteraction'
import { useDragDrop } from '../hooks/useDragDrop'
import { OverlayType } from '../types/overlays'
import Track from './Track'
import DropPreview from './DropPreview'

const TimelineTracks: React.FC = () => {
  const { state, settings } = useTimeline()
  const { handleTimelineClick, handleTimelineMouseDown, timelineRef } = useClipInteraction()
  const { handleDragOver, handleDragLeave, handleDrop, timelineRef: dragDropTimelineRef } = useDragDrop()
  
  // Combine refs for timeline interaction and drag & drop
  const combinedTimelineRef = (el: HTMLDivElement | null) => {
    // Set the ref for timeline interaction
    if (timelineRef) {
      (timelineRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    }
    // Set the ref for drag & drop
    if (dragDropTimelineRef) {
      (dragDropTimelineRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    }
  }
  
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

  // Determine track display order - waveform tracks at the bottom
  const trackOrder = useMemo(() => {
    const regularTracks: number[] = []
    const waveformTracks: number[] = []
    
    Object.keys(trackData).forEach(rowStr => {
      const row = parseInt(rowStr)
      // A waveform track is any SOUND overlay (they're designed to show waveforms)
      const hasWaveform = trackData[row].some(overlay => overlay.type === OverlayType.SOUND)
      
      if (hasWaveform) {
        waveformTracks.push(row)
      } else {
        regularTracks.push(row)
      }
    })
    
    return [...regularTracks.sort((a, b) => a - b), ...waveformTracks.sort((a, b) => a - b)]
  }, [trackData])

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
    const x = time * settings.pixelsPerSecond * state.zoom + 60 // Add 60px offset for track labels
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
      ref={combinedTimelineRef}
      className="timeline-tracks-container"
      onClick={handleTimelineClick}
      onMouseDown={handleTimelineMouseDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        width: `${Math.max(timelineWidth + 60, 800)}px`, // Add 60px for track labels
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
        {trackOrder.map((originalRow, displayIndex) => (
          <Track
            key={originalRow}
            rowIndex={displayIndex} // Use display index for positioning
            overlays={trackData[originalRow] || []}
          />
        ))}
        
        {/* Add empty tracks if needed */}
        {Array.from({ length: Math.max(0, trackCount - trackOrder.length) }, (_, index) => (
          <Track
            key={`empty-${index}`}
            rowIndex={trackOrder.length + index}
            overlays={[]}
          />
        ))}
      </div>
      
      {/* Drop preview for drag & drop */}
      <DropPreview />
    </div>
  )
}

export default TimelineTracks