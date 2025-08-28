import React, { useEffect, useState } from 'react'
import { useTimeline } from '../contexts/TimelineContext'

const TRACK_LABEL_WIDTH_PX = 60

const CursorPlayhead: React.FC = () => {
  const { settings, state } = useTimeline()
  const [leftPx, setLeftPx] = useState<number | null>(null)
  const [isInside, setIsInside] = useState(false)

  useEffect(() => {
    const container = document.querySelector('.timeline-tracks-container') as HTMLDivElement | null
    if (!container) return

    const handleMouseEnter = () => setIsInside(true)
    const handleMouseLeave = () => {
      setIsInside(false)
      setLeftPx(null)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      let x = e.clientX - rect.left
      // Keep the blue playhead outside of the track label area
      x = Math.max(TRACK_LABEL_WIDTH_PX, Math.min(rect.width, x))
      setLeftPx(x)
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [settings.pixelsPerSecond, state.zoom])

  if (!isInside || leftPx == null) return null

  return (
    <div
      className="cursor-playhead"
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: '#3b82f6', // blue
        pointerEvents: 'none',
        zIndex: 99
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '-6px',
          width: '14px',
          height: '16px',
          backgroundColor: '#3b82f6',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default CursorPlayhead



