import React from 'react'
import { Overlay, OverlayType, SoundOverlay } from '../types/overlays'
import { useTimeline } from '../contexts/TimelineContext'
import { useClipInteraction } from '../hooks/useClipInteraction'
import { useWaveform } from '../hooks/useWaveform'

interface ClipProps {
  overlay: Overlay
}

const Clip: React.FC<ClipProps> = ({ overlay }) => {
  const { settings, state, dragInfo } = useTimeline()
  const { handleMouseDown, handleClick, getClipStyle } = useClipInteraction()
  
  // For sound overlays, load waveform data
  const { waveformData, generateMockWaveform } = useWaveform(
    overlay.type === OverlayType.SOUND ? (overlay as SoundOverlay).src : undefined
  )
  
  // Calculate clip dimensions and position
  const clipStyle = getClipStyle(overlay)
  const width = overlay.duration * settings.pixelsPerSecond * state.zoom
  const height = settings.trackHeight - 20 // Leave some margin
  
  // Get clip-specific styling
  const getClipClassName = () => {
    const baseClass = 'clip'
    const typeClass = `clip-${overlay.type}`
    const selectedClass = overlay.selected ? 'selected' : ''
    const draggingClass = dragInfo?.overlayId === overlay.id ? 'dragging' : ''
    return [baseClass, typeClass, selectedClass, draggingClass].filter(Boolean).join(' ')
  }
  
  // Render clip content based on type
  const renderClipContent = () => {
    switch (overlay.type) {
      case OverlayType.SOUND:
        const soundOverlay = overlay as SoundOverlay
        let peaks: number[] = []
        
        if (waveformData?.peaks) {
          peaks = waveformData.peaks
        } else {
          // Generate mock waveform for demo
          const mockData = generateMockWaveform(overlay.duration, Math.floor(width / 4))
          peaks = mockData.peaks
        }
        
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px', marginBottom: '2px' }}>
              Audio {soundOverlay.volume !== 1 && `(${Math.round(soundOverlay.volume * 100)}%)`}
              {soundOverlay.muted && ' (Muted)'}
            </div>
            <div className="waveform" style={{ height: '30px', overflow: 'hidden' }}>
              <svg width={width} height={30} style={{ display: 'block' }}>
                {peaks.map((peak, index) => {
                  const barWidth = width / peaks.length
                  const barHeight = peak * 25
                  const x = index * barWidth
                  const y = (30 - barHeight) / 2
                  
                  return (
                    <rect
                      key={index}
                      x={x}
                      y={y}
                      width={Math.max(1, barWidth - 0.5)}
                      height={barHeight}
                      fill="currentColor"
                      opacity={0.8}
                    />
                  )
                })}
              </svg>
            </div>
          </div>
        )
      
      case OverlayType.CLIP:
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px' }}>
              Video Clip
            </div>
            <div className="clip-preview" style={{ 
              width: '100%', 
              height: '40px', 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              📹
            </div>
          </div>
        )
      
      case OverlayType.TEXT:
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px' }}>
              Text
            </div>
            <div className="text-preview" style={{ 
              fontSize: '8px',
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {(overlay as any).text || 'Text Overlay'}
            </div>
          </div>
        )
      
      case OverlayType.IMAGE:
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px' }}>
              Image
            </div>
            <div className="image-preview" style={{ 
              width: '100%', 
              height: '40px', 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              🖼️
            </div>
          </div>
        )
      
      case OverlayType.CAPTION:
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px' }}>
              Captions
            </div>
            <div className="caption-preview" style={{ 
              fontSize: '8px',
              opacity: 0.8
            }}>
              📝 Subtitles
            </div>
          </div>
        )
      
      default:
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '10px' }}>
              Unknown
            </div>
          </div>
        )
    }
  }
  
  return (
    <div
      id={`overlay-${overlay.id}`}
      className={getClipClassName()}
      style={{
        ...clipStyle,
        height: `${height}px`,
        top: '10px'
      }}
      onMouseDown={(e) => handleMouseDown(e, overlay)}
      onClick={(e) => handleClick(e, overlay)}
    >
      {renderClipContent()}
      
      {/* Resize handles */}
      <div 
        className="resize-handle resize-handle-left"
        onMouseDown={(e) => {
          e.stopPropagation()
          handleMouseDown(e, overlay)
        }}
      />
      <div 
        className="resize-handle resize-handle-right"
        onMouseDown={(e) => {
          e.stopPropagation()
          handleMouseDown(e, overlay)
        }}
      />
    </div>
  )
}

export default Clip