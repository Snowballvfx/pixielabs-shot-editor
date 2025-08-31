import React from 'react'
import { Overlay, OverlayType, SoundOverlay, TransitionInOverlay, TransitionOutOverlay, MergedTransitionOverlay } from '../types/overlays'
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
  
  // Get parent clip for transitions to match colors
  const getParentClip = () => {
    if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      return state.overlays.find(o => o.id === parentClipId)
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      // For merged transitions, get the first clip for color matching
      const fromClipId = (overlay as MergedTransitionOverlay).fromClipId
      return state.overlays.find(o => o.id === fromClipId)
    }
    return null
  }
  
  const parentClip = getParentClip()
  
  // Calculate clip dimensions and position
  const clipStyle = getClipStyle(overlay)
  const width = overlay.duration * settings.pixelsPerSecond * state.zoom
  const height = settings.trackHeight - 20 // Leave some margin
  
  // Get clip-specific styling
  const getClipClassName = () => {
    const baseClass = 'clip'
    // For transitions, use parent clip type for color matching, but keep transition class for gradients
    let typeClass = `clip-${overlay.type}`
    if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentTypeClass = parentClip ? `clip-${parentClip.type}` : 'clip-clip'
      typeClass = `${typeClass} ${parentTypeClass}-transition`
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      const parentTypeClass = parentClip ? `clip-${parentClip.type}` : 'clip-clip'
      typeClass = `${typeClass} ${parentTypeClass}-transition`
    }
    const selectedClass = overlay.selected ? 'selected' : ''
    const draggingClass = dragInfo?.overlayId === overlay.id ? 'dragging' : ''
    return [baseClass, typeClass, selectedClass, draggingClass].filter(Boolean).join(' ')
  }
  
  // Render clip content based on type
  const renderClipContent = () => {
    switch (overlay.type) {
      case OverlayType.TRANSITION_IN:
        return (
          <div className="clip-content" />
        )
      
      case OverlayType.TRANSITION_OUT:
        return (
          <div className="clip-content" />
        )
      
      case OverlayType.TRANSITION_MERGED:
        const mergedTransition = overlay as MergedTransitionOverlay
        return (
          <div className="clip-content">
            <div className="clip-title" style={{ fontSize: '8px', textAlign: 'center' }}>
              Merged Transition
            </div>
            <div className="transition-info" style={{ 
              fontSize: '6px', 
              textAlign: 'center',
              opacity: 0.8,
              marginTop: '2px'
            }}>
              {mergedTransition.transitionType}
            </div>
          </div>
        )
      
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
      
      {/* Resize handles - for clips and selective handles for transitions */}
      {overlay.type !== OverlayType.TRANSITION_IN && overlay.type !== OverlayType.TRANSITION_OUT ? (
        // Regular clips and merged transitions get normal resize handles
        <>
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
        </>
      ) : (
        // Transitions get selective resize handles
        <>
          {/* Transition-in: only left resize handle */}
          {overlay.type === OverlayType.TRANSITION_IN && (
            <div 
              className="resize-handle resize-handle-left transition-resize"
              onMouseDown={(e) => {
                e.stopPropagation()
                handleMouseDown(e, overlay)
              }}
            />
          )}
          {/* Transition-out: only right resize handle */}
          {overlay.type === OverlayType.TRANSITION_OUT && (
            <div 
              className="resize-handle resize-handle-right transition-resize"
              onMouseDown={(e) => {
                e.stopPropagation()
                handleMouseDown(e, overlay)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Clip