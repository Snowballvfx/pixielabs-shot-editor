import React from 'react'
import { Overlay } from '../types/overlays'
import { useTimeline } from '../contexts/TimelineContext'
import Clip from './Clip'

interface TrackProps {
  rowIndex: number
  overlays: Overlay[]
}

const Track: React.FC<TrackProps> = ({ rowIndex, overlays }) => {
  const { settings } = useTimeline()
  
  return (
    <div
      className="track"
      style={{
        position: 'absolute',
        top: `${rowIndex * settings.trackHeight}px`,
        left: 0,
        right: 0,
        height: `${settings.trackHeight}px`,
        borderBottom: '1px solid #333'
      }}
    >
      {/* Track label */}
      <div
        className="track-label"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '60px',
          height: '100%',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#888',
          borderRight: '1px solid #444',
          zIndex: 1
        }}
      >
        Track {rowIndex + 1}
      </div>
      
      {/* Track content area */}
      <div
        className="track-content"
        style={{
          position: 'absolute',
          left: '60px',
          top: 0,
          right: 0,
          height: '100%'
        }}
      >
        {overlays.map(overlay => (
          <Clip key={overlay.id} overlay={overlay} />
        ))}
      </div>
    </div>
  )
}

export default Track