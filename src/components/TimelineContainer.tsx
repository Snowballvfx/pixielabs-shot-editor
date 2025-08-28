import React from 'react'
import TimelineHeader from './TimelineHeader'
import TimelineTracks from './TimelineTracks'
import Playhead from './Playhead'
import CursorPlayhead from './CursorPlayhead'

const TimelineContainer: React.FC = () => {
  return (
    <div className="timeline-container">
      <TimelineHeader />
      <div className="timeline-content">
        <div className="timeline-tracks" style={{ position: 'relative' }}>
          <TimelineTracks />
          <CursorPlayhead />
          <Playhead />
        </div>
      </div>
    </div>
  )
}

export default TimelineContainer