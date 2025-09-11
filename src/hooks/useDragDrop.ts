import { useCallback, useRef, useState } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { Overlay, OverlayType, ClipOverlay, TransitionInOverlay, TransitionOutOverlay } from '../types/overlays'
import { getMinimumDuration } from '../utils/timeFormat'

// Interface for clip data being dragged from gallery
export interface GalleryClipData {
  id: string
  src: string
  label?: string
  length: number // Original duration of the clip in seconds
  mediaType: 'video' | 'audio' | 'image'
  thumbnail?: string
}

// Interface for drag state
interface DragState {
  isDragging: boolean
  draggedClip: GalleryClipData | null
  dragPosition: { x: number; y: number } | null
  dropTarget: { row: number; time: number } | null
}

export const useDragDrop = () => {
  const { settings, state, actions } = useTimeline()
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedClip: null,
    dragPosition: null,
    dropTarget: null
  })
  
  const timelineRef = useRef<HTMLDivElement>(null)

  // Convert pixel position to timeline time
  const pixelToTime = useCallback((pixel: number): number => {
    return pixel / (settings.pixelsPerSecond * state.zoom)
  }, [settings.pixelsPerSecond, state.zoom])

  // Convert pixel position to track row
  const pixelToRow = useCallback((pixel: number): number => {
    const tracksTopOffset = 18 // Same as in TimelineTracks.tsx
    const adjustedPixel = pixel - tracksTopOffset
    return Math.floor(adjustedPixel / settings.trackHeight)
  }, [settings.trackHeight])

  // Snap time to grid if enabled - ensure frame-accurate snapping
  const snapToGrid = useCallback((time: number): number => {
    if (!settings.snapToGrid) return time
    if (time === 0) return 0 // Allow exact 0 values
    
    // For frame-accurate editing, snap to frame boundaries (1/fps seconds)
    const frameDuration = 1 / settings.fps
    const frameNumber = Math.round(time / frameDuration)
    return frameNumber * frameDuration
  }, [settings.snapToGrid, settings.fps])

  // Generate unique ID for new clips
  const generateClipId = useCallback((): string => {
    return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Calculate optimal clip duration based on available timeline space
  const calculateClipDuration = useCallback((originalLength: number, dropTime: number): number => {
    const remainingTimelineSpace = state.duration - dropTime
    
    // If the clip fits entirely, use its full length
    if (originalLength <= remainingTimelineSpace) {
      return originalLength
    }
    
    // Otherwise, trim to fit the remaining timeline space
    return Math.max(getMinDuration(), remainingTimelineSpace) // Minimum 1 frame duration
  }, [state.duration])

  // Get minimum duration (1 frame) based on current FPS setting
  const getMinDuration = useCallback(() => {
    return getMinimumDuration(settings.fps)
  }, [settings.fps])

  // Start drag operation
  const startDrag = useCallback((clipData: GalleryClipData, event: React.DragEvent) => {
    console.log('Starting drag with clip data:', clipData)
    
    setDragState({
      isDragging: true,
      draggedClip: clipData,
      dragPosition: { x: event.clientX, y: event.clientY },
      dropTarget: null
    })

    // Set drag data for browser compatibility
    event.dataTransfer.setData('application/json', JSON.stringify(clipData))
    event.dataTransfer.effectAllowed = 'copy'
    
    console.log('Drag state set, dataTransfer configured')
  }, [])

  // Handle drag over timeline
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    
    if (!timelineRef.current) {
      console.log('No timeline ref available')
      return
    }

    // Check if we have clip data being dragged
    const hasClipData = dragState.draggedClip || event.dataTransfer.types.includes('application/json')
    if (!hasClipData) {
      console.log('No clip data detected in drag operation')
      return
    }

    const rect = timelineRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const time = snapToGrid(Math.max(0, pixelToTime(x)))
    const row = Math.max(0, pixelToRow(y))
    
    console.log('Drag over timeline:', { x, y, time, row })
    
    setDragState(prev => ({
      ...prev,
      isDragging: true, // Ensure drag state is active
      dragPosition: { x: event.clientX, y: event.clientY },
      dropTarget: { row, time }
    }))
  }, [pixelToTime, pixelToRow, snapToGrid, dragState.draggedClip])

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear drop target if we're leaving the timeline entirely
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const { clientX, clientY } = event
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropTarget: null
      }))
    }
  }, [])

  // Handle drop on timeline
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    
    try {
      const clipDataString = event.dataTransfer.getData('application/json')
      let clipData: GalleryClipData
      
      if (clipDataString) {
        clipData = JSON.parse(clipDataString)
      } else if (dragState.draggedClip) {
        clipData = dragState.draggedClip
      } else {
        console.warn('No clip data available for drop')
        return
      }

      // If no drop target is available, calculate it from the current drop position
      let dropTarget = dragState.dropTarget
      if (!dropTarget && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        const time = snapToGrid(Math.max(0, pixelToTime(x)))
        const row = Math.max(0, pixelToRow(y))
        
        dropTarget = { row, time }
        console.log('Calculated drop target from drop position:', dropTarget)
      }

      if (!dropTarget) {
        console.warn('No drop target available and could not calculate from position')
        return
      }

      const { row, time } = dropTarget
      const clipId = generateClipId()
      const transitionInId = `${clipId}-transition-in`
      const transitionOutId = `${clipId}-transition-out`
      const duration = calculateClipDuration(clipData.length, time)
      
      // Determine overlay type based on media type
      let overlayType: OverlayType
      switch (clipData.mediaType) {
        case 'audio':
          overlayType = OverlayType.SOUND
          break
        case 'image':
          overlayType = OverlayType.IMAGE
          break
        case 'video':
        default:
          overlayType = OverlayType.CLIP
          break
      }

      // Create overlays array to add multiple overlays at once
      const overlaysToAdd: Overlay[] = []

      // Create the main overlay based on media type
      let newOverlay: Overlay
      
      if (overlayType === OverlayType.CLIP) {
        newOverlay = {
          id: clipId,
          type: OverlayType.CLIP,
          startTime: time,
          duration: duration,
          row: row,
          selected: false,
          label: clipData.label || clipData.src.split('/').pop() || 'Untitled',
          src: clipData.src,
          mediaStartTime: 0, // Start from beginning of clip
          volume: 1, // Full volume by default
          muted: false,
          length: clipData.length,
          speed: 1.0, // Normal speed
          trimmedIn: 0,
          trimmedOut: Math.max(0, clipData.length - duration), // Trim from end if needed
          transitionInId: transitionInId,
          transitionOutId: transitionOutId
        } as ClipOverlay

        // Create transition-in overlay
        const transitionIn: TransitionInOverlay = {
          id: transitionInId,
          type: OverlayType.TRANSITION_IN,
          startTime: Math.max(0, time - 0.5), // 0.5s fade in, but don't go below 0
          duration: 0.5,
          row: row,
          selected: false,
          parentClipId: clipId,
          transitionType: 'fade'
        }

        // Create transition-out overlay
        const transitionOut: TransitionOutOverlay = {
          id: transitionOutId,
          type: OverlayType.TRANSITION_OUT,
          startTime: time + duration, // starts when main clip ends
          duration: 0.5,
          row: row,
          selected: false,
          parentClipId: clipId,
          transitionType: 'fade'
        }

        overlaysToAdd.push(newOverlay, transitionIn, transitionOut)
        
      } else if (overlayType === OverlayType.SOUND) {
        newOverlay = {
          id: clipId,
          type: OverlayType.SOUND,
          startTime: time,
          duration: duration,
          row: row,
          selected: false,
          label: clipData.label || clipData.src.split('/').pop() || 'Untitled',
          src: clipData.src,
          mediaStartTime: 0,
          volume: 0.8, // Slightly lower volume for audio tracks
          muted: false,
        }
        
        overlaysToAdd.push(newOverlay)
        
      } else {
        // IMAGE type
        newOverlay = {
          id: clipId,
          type: OverlayType.IMAGE,
          startTime: time,
          duration: duration,
          row: row,
          selected: false,
          label: clipData.label || clipData.src.split('/').pop() || 'Untitled',
          src: clipData.src,
          x: 0,
          y: 0,
          width: 100, // Default width percentage
          height: 100, // Default height percentage
          opacity: 1,
        }
        
        overlaysToAdd.push(newOverlay)
      }

      // Add all overlays to timeline
      overlaysToAdd.forEach(overlay => {
        actions.addOverlay(overlay)
      })
      
      // Select the newly created main clip
      actions.selectOverlay(clipId)
      
      console.log('Successfully dropped clip with transitions:', {
        clipData,
        mainOverlay: newOverlay,
        totalOverlaysCreated: overlaysToAdd.length,
        dropTarget: dropTarget
      })
      
    } catch (error) {
      console.error('Error handling drop:', error)
    } finally {
      // Reset drag state
      setDragState({
        isDragging: false,
        draggedClip: null,
        dragPosition: null,
        dropTarget: null
      })
    }
  }, [dragState, generateClipId, calculateClipDuration, actions, snapToGrid, pixelToTime, pixelToRow])

  // End drag operation (cleanup)
  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedClip: null,
      dragPosition: null,
      dropTarget: null
    })
  }, [])

  // Get drop preview information for visual feedback
  const getDropPreview = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedClip || !dragState.dropTarget) {
      return null
    }

    const { draggedClip, dropTarget } = dragState
    const duration = calculateClipDuration(draggedClip.length, dropTarget.time)
    const width = duration * settings.pixelsPerSecond * state.zoom
    
    return {
      row: dropTarget.row,
      time: dropTarget.time,
      duration,
      width,
      label: draggedClip.label || draggedClip.src.split('/').pop() || 'Untitled',
      mediaType: draggedClip.mediaType
    }
  }, [dragState, calculateClipDuration, settings.pixelsPerSecond, state.zoom])

  return {
    // State
    dragState,
    dropPreview: getDropPreview(),
    timelineRef,
    
    // Actions
    startDrag,
    endDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    
    // Utilities
    pixelToTime,
    pixelToRow,
    snapToGrid
  }
}
