import React from 'react'
import { useDragDrop, GalleryClipData } from '../hooks/useDragDrop'

// Demo clip data for testing
const demoClips: GalleryClipData[] = [
  {
    id: 'demo-video-1',
    src: '/demo/nature-clip.mp4',
    label: 'Nature Clip',
    length: 12.5,
    mediaType: 'video',
    thumbnail: '/demo/nature-thumb.jpg'
  }
]

const ClipsGallery: React.FC = () => {
  const { startDrag } = useDragDrop()

  const handleDragStart = (clipData: GalleryClipData) => (event: React.DragEvent) => {
    console.log('ClipsGallery: handleDragStart called with:', clipData)
    startDrag(clipData, event)
  }

  const getClipIcon = (mediaType: string) => {
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

  const getClipColor = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return '#4a90e2'
      case 'audio':
        return '#7ed321'
      case 'image':
        return '#bd10e0'
      default:
        return '#888'
    }
  }

  return (
    <div className="clips-gallery">
      <div className="gallery-header">
        <h3>Clips</h3>
        <p>Drag to timeline</p>
      </div>
      
      <div className="gallery-grid">
        {demoClips.map((clip) => (
          <div
            key={clip.id}
            className="gallery-clip"
            draggable
            onDragStart={handleDragStart(clip)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px',
              margin: '8px 0',
              backgroundColor: '#2a2a2a',
              borderRadius: '6px',
              border: `2px solid ${getClipColor(clip.mediaType)}`,
              cursor: 'grab',
              width: '100%',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = `0 2px 8px ${getClipColor(clip.mediaType)}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.cursor = 'grab'
            }}
          >
            <div 
              className="clip-icon"
              style={{
                fontSize: '24px',
                marginBottom: '6px'
              }}
            >
              {getClipIcon(clip.mediaType)}
            </div>
            
            <div 
              className="clip-label"
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '3px'
              }}
            >
              {clip.label}
            </div>
            
            <div 
              className="clip-duration"
              style={{
                fontSize: '9px',
                color: '#aaa',
                textAlign: 'center'
              }}
            >
              {clip.length.toFixed(1)}s
            </div>
            
            <div 
              className="clip-type"
              style={{
                fontSize: '7px',
                color: getClipColor(clip.mediaType),
                textTransform: 'uppercase',
                fontWeight: '600',
                marginTop: '3px'
              }}
            >
              {clip.mediaType}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClipsGallery
