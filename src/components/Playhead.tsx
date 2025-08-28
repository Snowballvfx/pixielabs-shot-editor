import React from 'react'
import { useTimeline } from '../contexts/TimelineContext'

const Playhead: React.FC = () => {
  const { state, settings } = useTimeline()
  
  // Calculate playhead position
  const position = state.currentTime * settings.pixelsPerSecond * state.zoom
  
  return (
    <div
      className="playhead"
      style={{
        position: 'absolute',
        left: `${position + 60}px`, // Offset by track label width
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: '#ff4757',
        pointerEvents: 'none',
        zIndex: 100
      }}
    >
      {/* Playhead handle */}
      <div
        className="playhead-handle"
        style={{
          position: 'absolute',
          top: '-8px',
          left: '-6px',
          width: '14px',
          height: '16px',
          backgroundColor: '#ff4757',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
      />
      
      {/* Time indicator */}
      <div
        className="playhead-time"
        style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff4757',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
      >
        {formatTime(state.currentTime)}
      </div>
    </div>
  )
}

// Helper function to format time
function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const milliseconds = Math.floor((time % 1) * 100)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
}

export default Playhead