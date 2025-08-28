import { useCallback, useRef, useState } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { Overlay, DragInfo, OverlayType, TransitionInOverlay, TransitionOutOverlay } from '../types/overlays'

interface UseClipInteractionOptions {
  onDragStart?: (overlay: Overlay) => void
  onDragEnd?: (overlay: Overlay) => void
  onSelect?: (overlay: Overlay) => void
}

export function useClipInteraction(options: UseClipInteractionOptions = {}) {
  const { state, settings, dragInfo, actions } = useTimeline()
  const [isDragging, setIsDragging] = useState(false)
  const [isTimelineScrubbing, setIsTimelineScrubbing] = useState(false)
  const dragThreshold = 5 // pixels
  
  const timelineRef = useRef<HTMLDivElement>(null)
  
  // Helper functions for grouped interactions
  const getRelatedOverlays = useCallback((overlay: Overlay): Overlay[] => {
    const related: Overlay[] = [overlay]
    
    if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      // For transitions, find the parent clip and sibling transition
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      const parentClip = state.overlays.find(o => o.id === parentClipId)
      
      if (parentClip) {
        related.push(parentClip)
        
        // Find sibling transition
        if (overlay.type === OverlayType.TRANSITION_IN && parentClip.transitionOutId) {
          const siblingTransition = state.overlays.find(o => o.id === parentClip.transitionOutId)
          if (siblingTransition) related.push(siblingTransition)
        } else if (overlay.type === OverlayType.TRANSITION_OUT && parentClip.transitionInId) {
          const siblingTransition = state.overlays.find(o => o.id === parentClip.transitionInId)
          if (siblingTransition) related.push(siblingTransition)
        }
      }
    } else {
      // For clips, find their transition overlays
      if (overlay.transitionInId) {
        const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
        if (transitionIn) related.push(transitionIn)
      }
      if (overlay.transitionOutId) {
        const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
        if (transitionOut) related.push(transitionOut)
      }
    }
    
    return related
  }, [state.overlays])
  
  // Convert pixel position to time (accounting for zoom and track label offset)
  const pixelToTime = useCallback((pixel: number): number => {
    return pixel / (settings.pixelsPerSecond * state.zoom)
  }, [settings.pixelsPerSecond, state.zoom])
  
  // Convert time to pixel position (accounting for zoom)
  const timeToPixel = useCallback((time: number): number => {
    return time * settings.pixelsPerSecond * state.zoom
  }, [settings.pixelsPerSecond, state.zoom])
  
  // Snap time to grid if enabled
  const snapToGrid = useCallback((time: number): number => {
    if (!settings.snapToGrid) return time
    return Math.round(time / settings.gridSize) * settings.gridSize
  }, [settings.snapToGrid, settings.gridSize])
  
  // Check for collisions with other overlays (excluding related overlays in the group)
  const checkCollision = useCallback((overlay: Overlay, newStartTime: number, newDuration?: number): boolean => {
    const duration = newDuration ?? overlay.duration
    const endTime = newStartTime + duration
    const relatedOverlays = getRelatedOverlays(overlay)
    const relatedIds = new Set(relatedOverlays.map(o => o.id))
    
    return state.overlays.some(other => {
      if (relatedIds.has(other.id) || other.row !== overlay.row) return false
      
      const otherEndTime = other.startTime + other.duration
      return !(endTime <= other.startTime || newStartTime >= otherEndTime)
    })
  }, [state.overlays, getRelatedOverlays])
  
  // Find the nearest valid position without collision
  const findValidPosition = useCallback((overlay: Overlay, targetTime: number): number => {
    let testTime = targetTime
    const step = settings.gridSize
    const maxAttempts = 100
    
    // Try the target position first
    if (!checkCollision(overlay, testTime)) {
      return snapToGrid(testTime)
    }
    
    // Try positions to the right and left alternately
    for (let i = 1; i <= maxAttempts; i++) {
      const rightTime = targetTime + (step * i)
      const leftTime = targetTime - (step * i)
      
      if (rightTime >= 0 && !checkCollision(overlay, rightTime)) {
        return snapToGrid(rightTime)
      }
      
      if (leftTime >= 0 && !checkCollision(overlay, leftTime)) {
        return snapToGrid(leftTime)
      }
    }
    
    // If no valid position found, return original position
    return overlay.startTime
  }, [checkCollision, snapToGrid, settings.gridSize])
  
  const handleMouseDown = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    event.preventDefault()
    event.stopPropagation()
    
    // Get the clip element (not the resize handle)
    const clipElement = document.getElementById(`overlay-${overlay.id}`)
    if (!clipElement) return
    
    const clipRect = clipElement.getBoundingClientRect()
    const clickX = event.clientX - clipRect.left
    const overlayWidth = clipRect.width
    
    // Determine drag type based on click position relative to the full clip
    let dragType: 'move' | 'resize-left' | 'resize-right' = 'move'
    const resizeHandleWidth = 8
    
    // Transition resize logic: transition-in only LEFT, transition-out only RIGHT
    if (overlay.type === OverlayType.TRANSITION_IN) {
      // Only left resize handle for transition-in
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      }
    } else if (overlay.type === OverlayType.TRANSITION_OUT) {
      // Only right resize handle for transition-out
      if (clickX >= overlayWidth - resizeHandleWidth) {
        dragType = 'resize-right'
      }
    } else {
      // Regular clips get both resize handles
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      } else if (clickX >= overlayWidth - resizeHandleWidth) {
        dragType = 'resize-right'
      }
    }
    
    console.log('Drag detection:', { 
      clickX, 
      overlayWidth, 
      resizeHandleWidth, 
      dragType,
      rightThreshold: overlayWidth - resizeHandleWidth,
      targetElement: event.currentTarget.className
    })
    
    // Select the overlay if not already selected
    if (!overlay.selected) {
      actions.selectOverlay(overlay.id, event.ctrlKey || event.metaKey)
    }
    
    const currentDragInfo: DragInfo = {
      overlayId: overlay.id,
      startX: event.clientX,
      startTime: overlay.startTime,
      originalStartTime: overlay.startTime,
      originalDuration: overlay.duration,
      dragType
    }
    
    const startPosition = { x: event.clientX, y: event.clientY }
    actions.startDrag(currentDragInfo)
    options.onDragStart?.(overlay)
    
    // Add global mouse event listeners
    let localIsDragging = false
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosition.x
      const deltaY = e.clientY - startPosition.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (!localIsDragging && distance > dragThreshold) {
        localIsDragging = true
        setIsDragging(true)
      }
      
      if (localIsDragging) {
        const deltaPixels = e.clientX - currentDragInfo.startX
        const deltaTime = pixelToTime(deltaPixels)
        
        if (currentDragInfo.dragType === 'move') {
          const newStartTime = Math.max(0, currentDragInfo.originalStartTime + deltaTime)
          const validStartTime = findValidPosition(overlay, newStartTime)
          
          // Move all related overlays as a group
          const relatedOverlays = getRelatedOverlays(overlay)
          relatedOverlays.forEach(relatedOverlay => {
            if (relatedOverlay.type === OverlayType.TRANSITION_IN || relatedOverlay.type === OverlayType.TRANSITION_OUT) {
              // For transitions, maintain their relative position to the parent clip
              const transition = relatedOverlay as TransitionInOverlay | TransitionOutOverlay
              const parentClip = relatedOverlays.find(o => o.id === transition.parentClipId)
              if (parentClip) {
                let newTransitionStartTime
                if (relatedOverlay.type === OverlayType.TRANSITION_IN) {
                  // Transition-in ends when clip starts
                  newTransitionStartTime = validStartTime - relatedOverlay.duration
                } else {
                  // Transition-out starts when clip ends
                  newTransitionStartTime = validStartTime + parentClip.duration
                }
                actions.updateOverlayBatch(relatedOverlay.id, { startTime: newTransitionStartTime, row: (parentClip as any).row })
              }
            } else {
              // For clips, apply the same delta
              actions.updateOverlayBatch(relatedOverlay.id, { startTime: validStartTime })
            }
          })
        } else if (currentDragInfo.dragType === 'resize-left') {
          // Handle transition resize differently - only transition-in can resize from left
          if (overlay.type === OverlayType.TRANSITION_IN) {
            const newDuration = Math.max(0.05, currentDragInfo.originalDuration - deltaTime)
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionInOverlay).parentClipId)
            if (parentClip) {
              const newTransitionStart = parentClip.startTime - snapToGrid(newDuration)
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: snapToGrid(newDuration), row: parentClip.row })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_OUT) {
            // Transition-out cannot resize from left
            return
          }
          
          // Regular clip resize logic
          const newStartTime = Math.max(0, currentDragInfo.originalStartTime + deltaTime)
          const newDuration = Math.max(0.1, currentDragInfo.originalDuration - deltaTime)
          
          console.log('Left resize:', {
            deltaPixels: e.clientX - currentDragInfo.startX,
            deltaTime,
            originalStartTime: currentDragInfo.originalStartTime,
            originalDuration: currentDragInfo.originalDuration,
            newStartTime,
            newDuration
          })
          
          if (!checkCollision(overlay, newStartTime, newDuration)) {
            console.log('Updating left resize:', { 
              startTime: snapToGrid(newStartTime), 
              duration: snapToGrid(newDuration) 
            })
            
            // Update the main overlay
            actions.updateOverlayBatch(overlay.id, {
              startTime: snapToGrid(newStartTime),
              duration: snapToGrid(newDuration)
            })
            
            // Update associated transitions
            if (overlay.transitionInId) {
              const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
              if (transitionIn) {
                const tInStart = snapToGrid(newStartTime) - transitionIn.duration
                actions.updateOverlayBatch(overlay.transitionInId, { startTime: tInStart, row: overlay.row })
              }
            }
            if (overlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut) {
                const newTransitionOutStart = snapToGrid(newStartTime) + snapToGrid(newDuration)
                actions.updateOverlayBatch(overlay.transitionOutId, { startTime: newTransitionOutStart, row: overlay.row })
              }
            }
          } else {
            console.log('Left resize collision detected')
          }
        } else if (currentDragInfo.dragType === 'resize-right') {
          // Handle transition resize differently - only transition-out can resize from right
          if (overlay.type === OverlayType.TRANSITION_OUT) {
            const newDuration = Math.max(0.05, currentDragInfo.originalDuration + deltaTime)
            const parentClip = state.overlays.find(o => o.id === (overlay as TransitionOutOverlay).parentClipId)
            if (parentClip) {
              const newTransitionStart = parentClip.startTime + parentClip.duration
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: snapToGrid(newDuration), row: parentClip.row })
            } else {
              actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_IN) {
            // Transition-in cannot resize from right
            return
          }
          
          // Regular clip resize logic
          const newDuration = Math.max(0.1, currentDragInfo.originalDuration + deltaTime)
          
          console.log('Right resize:', {
            deltaPixels: e.clientX - currentDragInfo.startX,
            deltaTime,
            originalDuration: currentDragInfo.originalDuration,
            newDuration,
            originalStartTime: currentDragInfo.originalStartTime,
            overlayStartTime: overlay.startTime
          })
          
          // For right resize, startTime should remain at the original position
          if (!checkCollision(overlay, currentDragInfo.originalStartTime, newDuration)) {
            console.log('Updating duration to:', snapToGrid(newDuration))
            
            // Update the main overlay duration
            actions.updateOverlayBatch(overlay.id, { duration: snapToGrid(newDuration) })
            
            // Update transition-out position if it exists
            if (overlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut) {
                const newTransitionOutStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                actions.updateOverlayBatch(overlay.transitionOutId, { startTime: newTransitionOutStart, row: overlay.row })
              }
            }
          } else {
            console.log('Collision detected, not updating')
          }
        }
      }
    }
    
    const handleMouseUp = () => {
      // Commit history if we were actually dragging
      if (localIsDragging) {
        actions.commitDragHistory()
      }
      
      localIsDragging = false
      setIsDragging(false)
      actions.endDrag()
      options.onDragEnd?.(overlay)
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [
    dragThreshold,
    pixelToTime,
    findValidPosition,
    checkCollision,
    snapToGrid,
    actions,
    options
  ])
  
  const handleClick = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    if (isDragging) return
    
    event.stopPropagation()
    actions.selectOverlay(overlay.id, event.ctrlKey || event.metaKey)
    options.onSelect?.(overlay)
  }, [isDragging, actions, options])
  
  const handleTimelineMouseDown = useCallback((event: React.MouseEvent) => {
    if (isDragging) return
    
    const timelineElement = timelineRef.current
    if (!timelineElement) return
    
    const rect = timelineElement.getBoundingClientRect()
    const clickX = event.clientX - rect.left - 60 // Account for track label width
    const clickTime = Math.max(0, pixelToTime(clickX))
    
    // Start scrubbing
    setIsTimelineScrubbing(true)
    actions.seek(clickTime)
    actions.clearSelection()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTimelineScrubbing || !timelineElement) return
      
      const rect = timelineElement.getBoundingClientRect()
      const moveX = e.clientX - rect.left - 60
      const moveTime = Math.max(0, Math.min(state.duration, pixelToTime(moveX)))
      
      actions.seek(moveTime)
    }
    
    const handleMouseUp = () => {
      setIsTimelineScrubbing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [isDragging, isTimelineScrubbing, pixelToTime, actions, state.duration, timelineRef])

  const handleTimelineClick = useCallback((event: React.MouseEvent) => {
    // This will be handled by mousedown for scrubbing
    event.preventDefault()
  }, [])
  
  const getClipStyle = useCallback((overlay: Overlay) => {
    const left = timeToPixel(overlay.startTime)
    const width = timeToPixel(overlay.duration)
    
    return {
      left: `${left}px`,
      width: `${width}px`,
      zIndex: overlay.selected ? 10 : 1
    }
  }, [timeToPixel])
  
  const getCursor = useCallback((overlay: Overlay, mouseX: number) => {
    if (isDragging) return 'grabbing'
    
    const overlayElement = document.getElementById(`overlay-${overlay.id}`)
    if (!overlayElement) return 'grab'
    
    const rect = overlayElement.getBoundingClientRect()
    const relativeX = mouseX - rect.left
    const resizeHandleWidth = 8
    
    if (relativeX <= resizeHandleWidth) return 'ew-resize'
    if (relativeX >= rect.width - resizeHandleWidth) return 'ew-resize'
    return 'grab'
  }, [isDragging])
  
  return {
    // State
    isDragging,
    isTimelineScrubbing,
    dragInfo,
    
    // Event handlers
    handleMouseDown,
    handleClick,
    handleTimelineClick,
    handleTimelineMouseDown,
    
    // Utilities
    getClipStyle,
    getCursor,
    pixelToTime,
    timeToPixel,
    snapToGrid,
    
    // Refs
    timelineRef
  }
}