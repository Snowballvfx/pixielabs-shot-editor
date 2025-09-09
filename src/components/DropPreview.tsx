import React from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { useDragDrop } from '../hooks/useDragDrop'

const DropPreview: React.FC = () => {
  const { settings, state } = useTimeline()
  const { dropPreview, dragState } = useDragDrop()
  
  if (!dropPreview || !dragState.isDragging) {
    return null
  }
  
  const { row, time, duration, width, label, mediaType } = dropPreview
  
  // Calculate position using actual timeline settings
  const top = 18 + (row * settings.trackHeight) + 10 // tracksTopOffset + (row * trackHeight) + margin
  const left = time * settings.pixelsPerSecond * state.zoom
  
  // Get appropriate icon for media type
  const getMediaIcon = () => {
    switch (mediaType) {
      case 'video':
        return '📹'
      case 'audio':
        return '🎵'
      case 'image':
        return '🖼️'
      default:
        return '📁'
    }
  }
  
  // Get appropriate color for media type
  const getMediaColor = () => {
    switch (mediaType) {
      case 'video':
        return 'rgba(74, 144, 226, 0.8)' // Blue for video clips
      case 'audio':
        return 'rgba(126, 211, 33, 0.8)' // Green for audio
      case 'image':
        return 'rgba(189, 16, 224, 0.8)' // Purple for images
      default:
        return 'rgba(128, 128, 128, 0.8)'
    }
  }
  
  return (
    <div
      className="drop-preview"
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.max(width, 40)}px`, // Minimum width for visibility
        height: '60px',
        backgroundColor: getMediaColor(),
        border: '2px dashed rgba(255, 255, 255, 0.8)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        fontSize: '10px',
        fontWeight: '600',
        textAlign: 'center',
        padding: '2px',
        boxSizing: 'border-box',
        opacity: 0.9,
        animation: 'pulse 1.5s ease-in-out infinite alternate'
      }}
    >
      <div style={{ fontSize: '16px', marginBottom: '2px' }}>
        {getMediaIcon()}
      </div>
      <div style={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        fontSize: '8px'
      }}>
        {label}
      </div>
      <div style={{ fontSize: '6px', opacity: 0.8 }}>
        {duration.toFixed(1)}s
      </div>
    </div>
  )
}

export default DropPreview
