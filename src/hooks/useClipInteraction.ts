import { useCallback, useRef, useState } from 'react'
import { useTimeline } from '../contexts/TimelineContext'
import { Overlay, DragInfo, OverlayType, TransitionInOverlay, TransitionOutOverlay, MergedTransitionOverlay, ClipOverlay } from '../types/overlays'
import { getMinimumDuration } from '../utils/timeFormat'

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
  
  // Get minimum duration (1 frame) based on current FPS setting
  const getMinDuration = useCallback(() => {
    return getMinimumDuration(settings.fps)
  }, [settings.fps])
  
  const timelineRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(state)
  stateRef.current = state // Always keep the ref updated with current state

  // Helper functions for grouped interactions
  const getRelatedOverlays = useCallback((overlay: Overlay): Overlay[] => {
    const currentState = stateRef.current
    const related: Overlay[] = [overlay]
    
    if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      // For transitions, find the parent clip and sibling transition
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      const parentClip = currentState.overlays.find(o => o.id === parentClipId)
      
      if (parentClip) {
        related.push(parentClip)
        
        // Find sibling transition
        if (overlay.type === OverlayType.TRANSITION_IN && parentClip.transitionOutId) {
          const siblingTransition = currentState.overlays.find(o => o.id === parentClip.transitionOutId)
          if (siblingTransition) {
            related.push(siblingTransition)
          }
        } else if (overlay.type === OverlayType.TRANSITION_OUT && parentClip.transitionInId) {
          const siblingTransition = currentState.overlays.find(o => o.id === parentClip.transitionInId)
          if (siblingTransition) {
            related.push(siblingTransition)
          }
        }
      }
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      // For merged transitions, find the related clips and their remaining transitions
      const mergedTransition = overlay as MergedTransitionOverlay
      const fromClip = currentState.overlays.find(o => o.id === mergedTransition.fromClipId)
      const toClip = currentState.overlays.find(o => o.id === mergedTransition.toClipId)
      
      if (fromClip) {
        related.push(fromClip)
        if ((fromClip as any).transitionInId) {
          const tIn = currentState.overlays.find(o => o.id === (fromClip as any).transitionInId)
          if (tIn) {
            related.push(tIn)
          }
        }
        if ((fromClip as any).transitionOutId) {
          const tOut = currentState.overlays.find(o => o.id === (fromClip as any).transitionOutId)
          if (tOut) {
            related.push(tOut)
          }
        }
      }
      if (toClip) {
        related.push(toClip)
        if ((toClip as any).transitionInId) {
          const tIn = currentState.overlays.find(o => o.id === (toClip as any).transitionInId)
          if (tIn) {
            related.push(tIn)
          }
        }
        if ((toClip as any).transitionOutId) {
          const tOut = currentState.overlays.find(o => o.id === (toClip as any).transitionOutId)
          if (tOut) {
            related.push(tOut)
          }
        }
      }
    } else {
      // For clips, find their transition overlays
      if (overlay.transitionInId) {
        const transitionIn = currentState.overlays.find(o => o.id === overlay.transitionInId)
        if (transitionIn) {
          related.push(transitionIn)
        }
      }
      if (overlay.transitionOutId) {
        const transitionOut = currentState.overlays.find(o => o.id === overlay.transitionOutId)
        if (transitionOut) {
          related.push(transitionOut)
        }
      }

      // If this clip participates in a merged transition, also include the other clip and merged overlay
      const merged = currentState.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED &&
        ((o as MergedTransitionOverlay).fromClipId === overlay.id || (o as MergedTransitionOverlay).toClipId === overlay.id)) as MergedTransitionOverlay | undefined
      if (merged) {
        related.push(merged)
        const otherClipId = merged.fromClipId === overlay.id ? merged.toClipId : merged.fromClipId
        const otherClip = currentState.overlays.find(o => o.id === otherClipId)
        if (otherClip) {
          related.push(otherClip)
          // Include other clip's transitions so they stay attached while dragging either clip
          if ((otherClip as any).transitionInId) {
            const otherIn = currentState.overlays.find(o => o.id === (otherClip as any).transitionInId)
            if (otherIn) {
              related.push(otherIn)
            }
          }
          if ((otherClip as any).transitionOutId) {
            const otherOut = currentState.overlays.find(o => o.id === (otherClip as any).transitionOutId)
            if (otherOut) {
              related.push(otherOut)
            }
          }
        }
      }
    }
    
    return related
  }, [])
  
  // Convert pixel position to time (accounting for zoom and track label offset)
  const pixelToTime = useCallback((pixel: number): number => {
    const currentState = stateRef.current
    return pixel / (settings.pixelsPerSecond * currentState.zoom)
  }, [settings.pixelsPerSecond])
  
  // Convert time to pixel position (accounting for zoom)
  const timeToPixel = useCallback((time: number): number => {
    const currentState = stateRef.current
    return time * settings.pixelsPerSecond * currentState.zoom
  }, [settings.pixelsPerSecond])
  
  // Snap time to grid if enabled
  const snapToGrid = useCallback((time: number): number => {
    if (!settings.snapToGrid)
      return time
    // Special case: allow exact 0 values without snapping
    if (time === 0)
      return 0
    return Math.round(time / settings.gridSize) * settings.gridSize
  }, [settings.snapToGrid, settings.gridSize])

  // Calculate effective clip length based on original length and speed
  const getEffectiveClipLength = useCallback((clip: ClipOverlay): number => {
    return clip.length / clip.speed
  }, [])

  // Calculate actual trim values based on clip properties and transition usage
  const calculateTrimValues = useCallback((clip: ClipOverlay): { trimIn: number; trimOut: number } => {
    const currentState = stateRef.current
    const effectiveLength = getEffectiveClipLength(clip)
    const totalUsedTime = clip.duration
    
    // If the clip duration is less than effective length, some content is trimmed
    if (totalUsedTime < effectiveLength) {
      // mediaStartTime represents how much was trimmed from the beginning
      const baseTrimIn = clip.mediaStartTime / clip.speed // Convert to timeline time
      // The rest is trimmed from the end
      const baseTrimOut = effectiveLength - totalUsedTime - baseTrimIn
      
      // Account for transition usage - find transitions for this clip
      const transitionIn = currentState.overlays.find(o => o.id === clip.transitionInId)
      const transitionOut = currentState.overlays.find(o => o.id === clip.transitionOutId)
      
      // Available trim content is reduced by what transitions are using
      const trimInUsedByTransition = transitionIn?.duration || 0
      const trimOutUsedByTransition = transitionOut?.duration || 0
      
      return {
        trimIn: Math.max(0, baseTrimIn - trimInUsedByTransition),
        trimOut: Math.max(0, baseTrimOut - trimOutUsedByTransition)
      }
    }
    
    return { trimIn: 0, trimOut: 0 }
  }, [getEffectiveClipLength])

  // REMOVED: Initialize trim values for all clips on mount
  // This was causing infinite loops because it would update state on mount
  // which would cause re-renders. Trim values should be calculated on-demand.
  
  // REMOVED: Run initialization when component mounts or overlays change significantly  
  // This useEffect was causing the infinite loop warning

  // Validate that total duration doesn't exceed clip's effective length
  const validateClipTotalLength = useCallback((clipOverlay: ClipOverlay, newClipDuration?: number, newTransitionInDuration?: number, newTransitionOutDuration?: number): { isValid: boolean; maxAllowedDuration: number; currentTotal: number } => {
    const currentState = stateRef.current
    const effectiveLength = getEffectiveClipLength(clipOverlay)
    
    // Get current transition durations
    const transitionIn = clipOverlay.transitionInId ? currentState.overlays.find(o => o.id === clipOverlay.transitionInId) : null
    const transitionOut = clipOverlay.transitionOutId ? currentState.overlays.find(o => o.id === clipOverlay.transitionOutId) : null
    
    // Check for merged transitions
    const mergedTransition = currentState.overlays.find(o => 
      o.type === OverlayType.TRANSITION_MERGED && 
      ((o as MergedTransitionOverlay).fromClipId === clipOverlay.id || (o as MergedTransitionOverlay).toClipId === clipOverlay.id)
    ) as MergedTransitionOverlay | undefined

    const transitionInDuration = newTransitionInDuration ?? (transitionIn?.duration || 0)
    const transitionOutDuration = newTransitionOutDuration ?? (transitionOut?.duration || 0)
    const clipDuration = newClipDuration ?? clipOverlay.duration
    const mergedTransitionDuration = mergedTransition?.duration || 0

    // For clips with merged transitions, include the merged transition duration
    const totalDuration = mergedTransition 
      ? transitionInDuration + clipDuration + mergedTransitionDuration + transitionOutDuration
      : transitionInDuration + clipDuration + transitionOutDuration

    const maxAllowedDuration = effectiveLength
    
    return {
      isValid: totalDuration <= maxAllowedDuration,
      maxAllowedDuration,
      currentTotal: totalDuration
    }
  }, [getEffectiveClipLength])

  // Calculate maximum allowed duration for extending in a specific direction
  const getMaxAllowedDurationForExtension = useCallback((overlay: Overlay, direction: 'start' | 'end'): number => {
    const currentState = stateRef.current
    let clipOverlay: ClipOverlay | undefined

    if (overlay.type === OverlayType.CLIP) {
      clipOverlay = overlay as ClipOverlay
    } else if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      clipOverlay = currentState.overlays.find(o => o.id === parentClipId) as ClipOverlay | undefined
    }

    if (!clipOverlay) return overlay.duration

    const { trimIn, trimOut } = calculateTrimValues(clipOverlay)

    // For clips extending from start: can extend up to trimmedIn amount
    // For clips extending from end: can extend up to trimmedOut amount
    if (overlay.type === OverlayType.CLIP) {
      if (direction === 'start') {
        // Extending leftward: can add back trimmed-in content
        return overlay.duration + trimIn
      } else {
        // Extending rightward: can add back trimmed-out content
        return overlay.duration + trimOut
      }
    }

    // For transitions, the limit is based on parent clip's available content
    if (overlay.type === OverlayType.TRANSITION_IN) {
      if (direction === 'start') {
        // Transition-in extending leftward: limited by trimmed-in content
        return overlay.duration + trimIn
      } else {
        // Transition-in extending rightward: limited by remaining clip duration
        return Math.min(overlay.duration + trimOut, clipOverlay.duration)
      }
    }

    if (overlay.type === OverlayType.TRANSITION_OUT) {
      if (direction === 'start') {
        // Transition-out extending leftward: limited by remaining clip duration
        return Math.min(overlay.duration + trimIn, clipOverlay.duration)
      } else {
        // Transition-out extending rightward: limited by trimmed-out content
        return overlay.duration + trimOut
      }
    }

    return overlay.duration
  }, [getEffectiveClipLength, calculateTrimValues])

  // Calculate maximum allowed duration for a specific component (legacy function for compatibility)
  const getMaxAllowedDuration = useCallback((overlay: Overlay, componentType: 'clip' | 'transition-in' | 'transition-out'): number => {
    const currentState = stateRef.current
    let clipOverlay: ClipOverlay | undefined

    if (overlay.type === OverlayType.CLIP) {
      clipOverlay = overlay as ClipOverlay
    } else if (overlay.type === OverlayType.TRANSITION_IN || overlay.type === OverlayType.TRANSITION_OUT) {
      const parentClipId = (overlay as TransitionInOverlay | TransitionOutOverlay).parentClipId
      clipOverlay = currentState.overlays.find(o => o.id === parentClipId) as ClipOverlay | undefined
    }

    if (!clipOverlay) return overlay.duration

    const effectiveLength = getEffectiveClipLength(clipOverlay)
    const transitionIn = clipOverlay.transitionInId ? currentState.overlays.find(o => o.id === clipOverlay.transitionInId) : null
    const transitionOut = clipOverlay.transitionOutId ? currentState.overlays.find(o => o.id === clipOverlay.transitionOutId) : null
    
    const mergedTransition = currentState.overlays.find(o => 
      o.type === OverlayType.TRANSITION_MERGED && 
      ((o as MergedTransitionOverlay).fromClipId === clipOverlay.id || (o as MergedTransitionOverlay).toClipId === clipOverlay.id)
    ) as MergedTransitionOverlay | undefined

    const currentTransitionInDuration = transitionIn?.duration || 0
    const currentTransitionOutDuration = transitionOut?.duration || 0
    const currentClipDuration = clipOverlay.duration
    const currentMergedDuration = mergedTransition?.duration || 0

    // Calculate how much duration is available for the component being resized
    switch (componentType) {
      case 'clip':
        return effectiveLength - currentTransitionInDuration - currentTransitionOutDuration - currentMergedDuration
      case 'transition-in':
        return effectiveLength - currentClipDuration - currentTransitionOutDuration - currentMergedDuration
      case 'transition-out':
        return effectiveLength - currentClipDuration - currentTransitionInDuration - currentMergedDuration
      default:
        return overlay.duration
    }
  }, [getEffectiveClipLength])
  
  // Check for collisions with other overlays (only for transitions - clips can overlap)
  const checkCollision = useCallback((overlay: Overlay, newStartTime: number, newDuration?: number): boolean => {
    const currentState = stateRef.current
    // Allow clips to overlap during drag - only check collisions for transitions
    if (overlay.type === OverlayType.CLIP)
       return false
    
    const duration = newDuration ?? overlay.duration
    const endTime = newStartTime + duration
    const relatedOverlays = getRelatedOverlays(overlay)
    const relatedIds = new Set(relatedOverlays.map(o => o.id))
    
    return currentState.overlays.some(other => {
      if (relatedIds.has(other.id) || other.row !== overlay.row)
        return false
      
      const otherEndTime = other.startTime + other.duration
      return !(endTime <= other.startTime || newStartTime >= otherEndTime)
    })
  }, [getRelatedOverlays])
  
  // Find the nearest valid position without collision
  const findValidPosition = useCallback((overlay: Overlay, targetTime: number): number => {
    const currentSettings = settings  // Capture current settings
    let testTime = targetTime
    const step = currentSettings.gridSize
    const maxAttempts = 100
    
    // Try the target position first
    if (!checkCollision(overlay, testTime))
      return snapToGrid(testTime)
    
    // Try positions to the right and left alternately
    for (let i = 1; i <= maxAttempts; i++) {
      const rightTime = targetTime + (step * i)
      const leftTime = targetTime - (step * i)
      
      if (rightTime >= 0 && !checkCollision(overlay, rightTime))
        return snapToGrid(rightTime)
      
      if (leftTime >= 0 && !checkCollision(overlay, leftTime))
        return snapToGrid(leftTime)
    }
    
    // If no valid position found, return original position
    return overlay.startTime
  }, [checkCollision, snapToGrid, settings])

  // REMOVED: snapOverlappingClip function caused infinite loops
  // Snapping logic now simplified to prevent state dependency issues
  
  const handleMouseDown = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    event.preventDefault()
    event.stopPropagation()
    
    // Get the clip element (not the resize handle)
    const clipElement = document.getElementById(`overlay-${overlay.id}`)
    if (!clipElement)
      return
    
    const clipRect = clipElement.getBoundingClientRect()
    const clickX = event.clientX - clipRect.left
    const overlayWidth = clipRect.width
    
    // Determine drag type based on click position relative to the full clip
    let dragType: 'move' | 'resize-left' | 'resize-right' = 'move'
    const resizeHandleWidth = 12
    const transitionInteractiveWidth = 12
    
    // Transition resize logic: transition-in only LEFT, transition-out only RIGHT
    if (overlay.type === OverlayType.TRANSITION_IN) {
      // Only left resize handle for transition-in (slightly larger interactive zone)
      if (clickX <= transitionInteractiveWidth) {
        dragType = 'resize-left'
      }
    } else if (overlay.type === OverlayType.TRANSITION_OUT) {
      // Only right resize handle for transition-out (slightly larger interactive zone)
      if (clickX >= overlayWidth - transitionInteractiveWidth) {
        dragType = 'resize-right'
      }
    } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
      // Merged transitions get both resize handles
      if (clickX <= resizeHandleWidth) {
        dragType = 'resize-left'
      } else if (clickX >= overlayWidth - resizeHandleWidth) {
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
    
    // Store original positions of all related overlays for consistent movement
    const relatedOverlays = getRelatedOverlays(overlay)
    const originalPositions = new Map(relatedOverlays.map(o => [o.id, o.startTime]))
    
    console.log('Drag start - storing original positions:', {
      draggedOverlay: overlay.id,
      relatedOverlays: relatedOverlays.map(o => ({ id: o.id, type: o.type, startTime: o.startTime })),
      originalPositions: Array.from(originalPositions.entries())
    })
    
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
          // Calculate the target position for the dragged overlay
          const targetTime = Math.max(0, currentDragInfo.originalStartTime + deltaTime)
          const deltaFromOriginal = targetTime - currentDragInfo.originalStartTime
          
          // Move all related overlays by the same delta from their original positions
          // Use the stored relatedOverlays from drag start, not a new call to getRelatedOverlays
          
          console.log('Move operation debug:', {
            draggedOverlay: overlay.id,
            draggedType: overlay.type,
            relatedOverlays: relatedOverlays.map(o => ({ id: o.id, type: o.type, startTime: o.startTime })),
            deltaFromOriginal,
            originalPositions: Array.from(originalPositions.entries())
          })
          
          relatedOverlays.forEach(relatedOverlay => {
            const originalStart = originalPositions.get(relatedOverlay.id) || relatedOverlay.startTime
            const newStart = snapToGrid(originalStart + deltaFromOriginal)
            
            console.log(`Moving ${relatedOverlay.id} from ${originalStart} to ${newStart}`)
            
            actions.updateOverlayBatch(relatedOverlay.id, { 
              startTime: Math.max(0, newStart) 
            })
          })

          // During move operations, all related overlays move together using their original positions
          // No additional positioning logic needed - this ensures 1:1 mouse movement
        } else if (currentDragInfo.dragType === 'resize-left') {
          // Handle transition resize differently - only transition-in can resize from left
          if (overlay.type === OverlayType.TRANSITION_IN) {
            const requestedDuration = Math.max(getMinDuration(), currentDragInfo.originalDuration - deltaTime)
            // For transition-in left resize, we're potentially extending from the start
            const isExtending = requestedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending 
              ? getMaxAllowedDurationForExtension(overlay, 'start')
              : getMaxAllowedDuration(overlay, 'transition-in')
            const newDuration = Math.min(requestedDuration, maxAllowed)
            
            console.log('Transition-in resize debug:', {
              originalDuration: currentDragInfo.originalDuration,
              deltaTime,
              requestedDuration,
              isExtending,
              maxAllowed,
              newDuration,
              snappedDuration: snapToGrid(newDuration)
            })
            
            const parentClip = stateRef.current.overlays.find(o => o.id === (overlay as TransitionInOverlay).parentClipId) as ClipOverlay | undefined
            if (parentClip) {
              const newTransitionStart = parentClip.startTime - newDuration
              const finalTransitionDuration = Math.max(getMinDuration(), snapToGrid(newDuration))
              
              // Create temporary clip state with updated transition duration for trim calculation
              const tempClip = {
                ...parentClip,
                transitionInId: overlay.id // Ensure it references this transition
              }
              
              // Calculate trim values considering the new transition duration
              const effectiveLength = getEffectiveClipLength(tempClip)
              const baseTrimIn = tempClip.mediaStartTime / tempClip.speed
              const baseTrimOut = effectiveLength - tempClip.duration - baseTrimIn
              const trimIn = Math.max(0, baseTrimIn - finalTransitionDuration)
              const trimOut = Math.max(0, baseTrimOut - (stateRef.current.overlays.find(o => o.id === tempClip.transitionOutId)?.duration || 0))
              
              // Update both transition and parent clip
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: finalTransitionDuration, row: parentClip.row })
              actions.updateOverlayBatch(parentClip.id, {
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
            } else {
              const finalDuration = Math.max(getMinDuration(), snapToGrid(newDuration))
              actions.updateOverlayBatch(overlay.id, { duration: finalDuration })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_OUT) {
            // Transition-out cannot resize from left
            return
          } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
            // Merged transition left resize - resize the fromClip (like resizing clip end)
            const mergedTransition = overlay as MergedTransitionOverlay
            const fromClip = stateRef.current.overlays.find(o => o.id === mergedTransition.fromClipId) as ClipOverlay | undefined
            const toClip = stateRef.current.overlays.find(o => o.id === mergedTransition.toClipId)
            
            if (fromClip && toClip && fromClip.type === OverlayType.CLIP) {
              // Calculate new fromClip duration based on merged transition left resize
              // When dragging left handle right (positive deltaTime), we want to extend fromClip
              const mergedTransitionDelta = deltaTime // How much the transition start is moving
              const newFromClipDuration = Math.max(getMinDuration(), fromClip.duration + mergedTransitionDelta)
              
              // IMPORTANT: Add merged transition constraint - prevent extending beyond toClip start - 1 frame
              // The merged transition should stop at least 1 frame before the toClip starts
              const toClipStart = toClip.startTime
              const maxMergedEnd = toClipStart - getMinDuration() // Stop 1 frame before toClip
              const maxFromClipEnd = Math.max(fromClip.startTime + getMinDuration(), maxMergedEnd - getMinDuration()) // Account for minimum merged transition duration
              const maxFromClipDuration = maxFromClipEnd - fromClip.startTime
              
              // Apply clip length constraints
              const isExtending = newFromClipDuration > fromClip.duration
              const maxAllowed = isExtending 
                ? getMaxAllowedDurationForExtension(fromClip, 'end')
                : getMaxAllowedDuration(fromClip, 'clip')
              let constrainedDuration = Math.min(newFromClipDuration, maxAllowed)
              
              // Apply the merged transition constraint (most restrictive)
              constrainedDuration = Math.min(constrainedDuration, maxFromClipDuration)
              
              // Add timeline boundary constraints
              const maxAllowedEnd = state.duration
              const boundaryConstrainedDuration = Math.max(getMinDuration(), Math.min(constrainedDuration, maxAllowedEnd - fromClip.startTime))
              
              console.log('Merged transition left resize constraint:', {
                mergedTransitionDelta,
                newFromClipDuration,
                toClipStart,
                maxMergedEnd,
                maxFromClipEnd,
                maxFromClipDuration,
                constrainedDuration,
                finalDuration: boundaryConstrainedDuration
              })
              
              if (!checkCollision(fromClip, fromClip.startTime, boundaryConstrainedDuration)) {
                // Calculate new trim values for the fromClip
                const tempClip = {
                  ...fromClip,
                  duration: snapToGrid(boundaryConstrainedDuration)
                }
                const { trimIn, trimOut } = calculateTrimValues(tempClip)

                // Update fromClip duration
                actions.updateOverlayBatch(fromClip.id, { 
                  duration: snapToGrid(boundaryConstrainedDuration),
                  trimmedIn: trimIn,
                  trimmedOut: trimOut
                })
                
                // Update merged transition start to stay glued to fromClip end
                // and adjust duration so the end stays in the same place
                const newMergedStart = fromClip.startTime + snapToGrid(boundaryConstrainedDuration)
                const originalMergedEnd = overlay.startTime + overlay.duration
                const newMergedDuration = Math.max(getMinDuration(), originalMergedEnd - newMergedStart)
                const finalMergedDuration = Math.max(getMinDuration(), snapToGrid(newMergedDuration))
                
                actions.updateOverlayBatch(overlay.id, { 
                  startTime: newMergedStart,
                  duration: finalMergedDuration
                })
                
                // toClip (clip-2) doesn't move when resizing merged transition start
                // It stays in its original position
                
                // Update fromClip's transition-out if it exists
                if (fromClip.transitionOutId && fromClip.transitionOutId !== overlay.id) {
                  const transitionOut = stateRef.current.overlays.find(o => o.id === fromClip.transitionOutId)
                  if (transitionOut) {
                    const newTransitionOutStart = fromClip.startTime + snapToGrid(boundaryConstrainedDuration)
                    actions.updateOverlayBatch(fromClip.transitionOutId, { startTime: newTransitionOutStart, row: fromClip.row })
                  }
                }
              }
            }
            return
          }
          
          // Regular clip resize logic with length constraints
          const requestedDuration = Math.max(getMinDuration(), currentDragInfo.originalDuration - deltaTime)
          const originalEndTime = currentDragInfo.originalStartTime + currentDragInfo.originalDuration
          
          // Check clip length constraints first
          if (overlay.type === OverlayType.CLIP) {
            const clipOverlay = overlay as ClipOverlay
            // For left resize, we're potentially extending from the start
            const isExtending = requestedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending 
              ? getMaxAllowedDurationForExtension(overlay, 'start')
              : getMaxAllowedDuration(overlay, 'clip')
            let constrainedDuration = Math.min(requestedDuration, maxAllowed)
            
            // Calculate start time to maintain the original end position
            let constrainedStartTime = originalEndTime - constrainedDuration
            
            // Ensure start time doesn't go negative
            if (constrainedStartTime < 0) {
              constrainedStartTime = 0
              constrainedDuration = Math.min(originalEndTime, maxAllowed)
            }
            
            // Add timeline boundary constraints
            const maxEndTime = Math.min(constrainedStartTime + constrainedDuration, state.duration)
            constrainedDuration = Math.max(getMinDuration(), maxEndTime - constrainedStartTime)
            
            // IMPORTANT: Prevent clip from becoming unreachable behind transitions
            // When a clip has transitions, we need to ensure it remains clickable
            let minAccessibleDuration = getMinDuration()
            
            if (overlay.transitionOutId) {
              const transitionOut = stateRef.current.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut && transitionOut.duration > 0) {
                // The issue: when clip becomes very small (1 frame), the transition-out
                // may visually cover or make it hard to click the clip
                // Solution: ensure clip is always larger than 1 frame when it has transitions
                // This gives enough visual space for reliable interaction
                const bufferFrames = 2 // Ensure at least 2 frames for reliable clicking
                minAccessibleDuration = getMinDuration() * bufferFrames
                
                console.log('Left resize: preventing clip from becoming unreachable', {
                  transitionOutDuration: transitionOut.duration,
                  singleFrameDuration: getMinDuration(),
                  bufferFrames,
                  minAccessibleDuration
                })
              }
            }
            
            if (constrainedDuration < minAccessibleDuration) {
              // Adjust duration to ensure clip remains accessible
              constrainedDuration = minAccessibleDuration
              constrainedStartTime = Math.max(0, originalEndTime - constrainedDuration)
              
              console.log('Left resize: constraining duration for accessibility', {
                originalConstrainedDuration: constrainedDuration,
                minAccessibleDuration,
                adjustedStartTime: constrainedStartTime,
                adjustedDuration: constrainedDuration
              })
            }
            
            // Check for merged transition constraints when this clip is the toClip
            const mergedAsTo = state.overlays.find(o => 
              o.type === OverlayType.TRANSITION_MERGED && 
              (o as MergedTransitionOverlay).toClipId === overlay.id
            ) as MergedTransitionOverlay | undefined
            
            if (mergedAsTo) {
              // This clip is the toClip - ensure merged transition doesn't go below minimum duration
              const fromClip = state.overlays.find(o => o.id === mergedAsTo.fromClipId)
              if (fromClip) {
                const mergedStart = fromClip.startTime + fromClip.duration
                const minMergedEnd = mergedStart + getMinDuration() // Minimum end position for merged transition
                
                // Constrain the new start time to respect merged transition minimum
                const adjustedStartTime = Math.max(constrainedStartTime, minMergedEnd)
                
                // Recalculate duration based on constrained start time
                constrainedDuration = Math.max(getMinDuration(), originalEndTime - adjustedStartTime)
                constrainedStartTime = adjustedStartTime
                
                console.log('Left resize merged transition constraint:', {
                  mergedTransitionId: mergedAsTo.id,
                  fromClipEnd: fromClip.startTime + fromClip.duration,
                  minMergedEnd,
                  originalConstrainedStartTime: constrainedStartTime,
                  adjustedStartTime,
                  constrainedDuration
                })
              }
            }
            
            const newDuration = constrainedDuration
            const finalStartTime = constrainedStartTime
            
            // When left-resizing, we're effectively trimming more from the beginning
            // Calculate new mediaStartTime (in source time)
            const timeShift = finalStartTime - currentDragInfo.originalStartTime
            const newMediaStartTime = Math.max(0, clipOverlay.mediaStartTime + (timeShift * clipOverlay.speed))
            
            console.log('Left resize with constraints:', {
              deltaPixels: e.clientX - currentDragInfo.startX,
              deltaTime,
              originalStartTime: currentDragInfo.originalStartTime,
              originalDuration: currentDragInfo.originalDuration,
              originalEndTime,
              finalStartTime,
              requestedDuration,
              maxAllowed,
              finalDuration: newDuration,
              timeShift,
              oldMediaStartTime: clipOverlay.mediaStartTime,
              newMediaStartTime
            })
            
            if (!checkCollision(overlay, finalStartTime, newDuration)) {
              console.log('Updating left resize:', { 
                startTime: snapToGrid(finalStartTime), 
                duration: snapToGrid(newDuration),
                mediaStartTime: newMediaStartTime
              })
              
              // Calculate new trim values immediately based on the new clip properties
              const tempClip = {
                ...clipOverlay,
                startTime: snapToGrid(finalStartTime),
                duration: snapToGrid(newDuration),
                mediaStartTime: newMediaStartTime
              }
              const { trimIn, trimOut } = calculateTrimValues(tempClip)

              // Update the main overlay with immediate trim values
              actions.updateOverlayBatch(overlay.id, {
                startTime: snapToGrid(finalStartTime),
                duration: snapToGrid(newDuration),
                mediaStartTime: newMediaStartTime,
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
              
              // Update associated transitions - these must ALWAYS be positioned relative to the clip
              const finalClipStart = snapToGrid(finalStartTime)
              const finalClipDuration = snapToGrid(newDuration)
              const finalClipEnd = finalClipStart + finalClipDuration
              
              if (overlay.transitionInId) {
                const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
                if (transitionIn) {
                  // Transition-in should be positioned to end exactly where the clip starts
                  const tInStart = finalClipStart - transitionIn.duration
                  console.log('Left resize: updating transition-in position:', transitionIn.id, 'to start at', tInStart)
                  actions.updateOverlayBatch(overlay.transitionInId, { startTime: tInStart, row: overlay.row })
                }
              }
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  // Transition-out should be positioned to start exactly where the clip ends
                  console.log('Left resize: updating transition-out position:', transitionOut.id, 'to start at', finalClipEnd)
                  actions.updateOverlayBatch(overlay.transitionOutId, { startTime: finalClipEnd, row: overlay.row })
                }
              }

                             // Update merged transition if present
               const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
               const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === overlay.id) as MergedTransitionOverlay | undefined
               
               if (mergedAsFrom) {
                 // This clip is the fromClip - update merged transition start to stay glued to clip end
                 // and ensure toClip stays connected at the other end of the merged transition
                 const mergedStart = snapToGrid(finalStartTime) + snapToGrid(newDuration)
                 const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)
                 
                 console.log('Left resize: updating merged transition (as fromClip)', mergedAsFrom.id, 'start to', mergedStart)
                 actions.updateOverlayBatch(mergedAsFrom.id, { startTime: mergedStart, row: overlay.row })
                 
                 // Keep toClip attached to the end of the merged transition
                 if (toClip) {
                   const newToClipStart = mergedStart + mergedAsFrom.duration
                   console.log('Left resize: moving toClip', toClip.id, 'to stay attached at', newToClipStart)
                   actions.updateOverlayBatch(toClip.id, { startTime: newToClipStart, row: overlay.row })
                   
                   // Update toClip's transitions to follow
                   if ((toClip as any).transitionInId) {
                     const toTransitionIn = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                     if (toTransitionIn) {
                       const toTInStart = newToClipStart - toTransitionIn.duration
                       actions.updateOverlayBatch(toTransitionIn.id, { startTime: toTInStart, row: overlay.row })
                     }
                   }
                   if ((toClip as any).transitionOutId) {
                     const toTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                     if (toTransitionOut) {
                       const toTOutStart = newToClipStart + toClip.duration
                       actions.updateOverlayBatch(toTransitionOut.id, { startTime: toTOutStart, row: overlay.row })
                     }
                   }
                 }
               }
               
               if (mergedAsTo) {
                 // This clip is the toClip - when left-resizing toClip, adjust merged transition duration
                 // fromClip stays in place, merged transition adjusts to connect to new toClip position
                 const fromClip = state.overlays.find(o => o.id === mergedAsTo.fromClipId)
                 if (fromClip) {
                   const mergedStart = fromClip.startTime + fromClip.duration
                   const mergedEnd = snapToGrid(finalStartTime)
                   const newMergedDuration = Math.max(getMinDuration(), mergedEnd - mergedStart)
                   const finalMergedDuration = Math.max(getMinDuration(), snapToGrid(newMergedDuration))
                   console.log('Left resize: updating merged transition (as toClip)', mergedAsTo.id, 'duration to', finalMergedDuration)
                   console.log('Left resize: fromClip stays at', fromClip.startTime, 'toClip moves to', snapToGrid(finalStartTime))
                   actions.updateOverlayBatch(mergedAsTo.id, { 
                     startTime: mergedStart,
                     duration: finalMergedDuration,
                     row: overlay.row 
                   })
                 }
               }
            } else {
              console.log('Left resize collision detected - ensuring transitions stay attached to current clip position')
              
              // Even if the clip can't move due to collision, we need to ensure transitions
              // are properly positioned relative to the current clip position
              const currentClipStart = overlay.startTime
              const currentClipEnd = overlay.startTime + overlay.duration
              
              if (overlay.transitionInId) {
                const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
                if (transitionIn) {
                  const tInStart = currentClipStart - transitionIn.duration
                  console.log('Collision case: ensuring transition-in is at', tInStart)
                  actions.updateOverlayBatch(overlay.transitionInId, { startTime: tInStart, row: overlay.row })
                }
              }
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  console.log('Collision case: ensuring transition-out is at', currentClipEnd)
                  actions.updateOverlayBatch(overlay.transitionOutId, { startTime: currentClipEnd, row: overlay.row })
                }
              }
            }
          }
          
          // SAFETY CHECK: Ensure transitions are always properly positioned relative to the clip
          // This handles edge cases where constraints might leave transitions misaligned
          if (overlay.type === OverlayType.CLIP) {
            const currentClipPosition = state.overlays.find(o => o.id === overlay.id)
            if (currentClipPosition) {
              const clipStart = currentClipPosition.startTime
              const clipEnd = currentClipPosition.startTime + currentClipPosition.duration
              
              // Verify and correct transition-in position
              if (overlay.transitionInId) {
                const transitionIn = state.overlays.find(o => o.id === overlay.transitionInId)
                if (transitionIn) {
                  const expectedTInStart = clipStart - transitionIn.duration
                  const actualTInStart = transitionIn.startTime
                  if (Math.abs(actualTInStart - expectedTInStart) > 0.01) {
                    console.log('Safety check: correcting transition-in position from', actualTInStart, 'to', expectedTInStart)
                    actions.updateOverlayBatch(overlay.transitionInId, { startTime: expectedTInStart, row: overlay.row })
                  }
                }
              }
              
              // Verify and correct transition-out position
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  const expectedTOutStart = clipEnd
                  const actualTOutStart = transitionOut.startTime
                  if (Math.abs(actualTOutStart - expectedTOutStart) > 0.01) {
                    console.log('Safety check: correcting transition-out position from', actualTOutStart, 'to', expectedTOutStart)
                    actions.updateOverlayBatch(overlay.transitionOutId, { startTime: expectedTOutStart, row: overlay.row })
                  }
                }
              }
            }
          }
        } else if (currentDragInfo.dragType === 'resize-right') {
          // Handle transition resize differently - only transition-out can resize from right
          if (overlay.type === OverlayType.TRANSITION_OUT) {
            const requestedDuration = Math.max(getMinDuration(), currentDragInfo.originalDuration + deltaTime)
            // For transition-out right resize, we're potentially extending from the end
            const isExtending = requestedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending 
              ? getMaxAllowedDurationForExtension(overlay, 'end')
              : getMaxAllowedDuration(overlay, 'transition-out')
            const newDuration = Math.min(requestedDuration, maxAllowed)
            
            console.log('Transition-out resize debug:', {
              originalDuration: currentDragInfo.originalDuration,
              deltaTime,
              requestedDuration,
              isExtending,
              maxAllowed,
              newDuration,
              snappedDuration: snapToGrid(newDuration)
            })
            
            const parentClip = stateRef.current.overlays.find(o => o.id === (overlay as TransitionOutOverlay).parentClipId) as ClipOverlay | undefined
            if (parentClip) {
              const newTransitionStart = parentClip.startTime + parentClip.duration
              const finalTransitionDuration = Math.max(getMinDuration(), snapToGrid(newDuration))
              
              // Create temporary clip state with updated transition duration for trim calculation
              const tempClip = {
                ...parentClip,
                transitionOutId: overlay.id // Ensure it references this transition
              }
              
              // Calculate trim values considering the new transition duration
              const effectiveLength = getEffectiveClipLength(tempClip)
              const baseTrimIn = tempClip.mediaStartTime / tempClip.speed
              const baseTrimOut = effectiveLength - tempClip.duration - baseTrimIn
              const trimIn = Math.max(0, baseTrimIn - (stateRef.current.overlays.find(o => o.id === tempClip.transitionInId)?.duration || 0))
              const trimOut = Math.max(0, baseTrimOut - finalTransitionDuration)
              
              // Update both transition and parent clip
              actions.updateOverlayBatch(overlay.id, { startTime: newTransitionStart, duration: finalTransitionDuration, row: parentClip.row })
              actions.updateOverlayBatch(parentClip.id, {
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
            } else {
              const finalDuration = Math.max(getMinDuration(), snapToGrid(newDuration))
              actions.updateOverlayBatch(overlay.id, { duration: finalDuration })
            }
            return
          } else if (overlay.type === OverlayType.TRANSITION_IN) {
            // Transition-in cannot resize from right
            return
          } else if (overlay.type === OverlayType.TRANSITION_MERGED) {
            // Merged transition right resize - move the toClip start position (like resizing clip start)
            const mergedTransition = overlay as MergedTransitionOverlay
            const fromClip = state.overlays.find(o => o.id === mergedTransition.fromClipId)
            const toClip = state.overlays.find(o => o.id === mergedTransition.toClipId) as ClipOverlay | undefined
            
            if (fromClip && toClip && toClip.type === OverlayType.CLIP) {
              // Calculate new toClip start position based on merged transition right resize
              const mergedTransitionDelta = deltaTime // How much the transition end is moving
              
              // Constrain the delta to ensure toClip doesn't go below minimum duration
              const toClipOriginalEnd = toClip.startTime + toClip.duration
              const maxAllowedDelta = toClip.duration - getMinDuration() // Maximum we can shrink toClip
              
              // Also constrain by timeline duration - merged transition can't extend beyond timeline
              const mergedCurrentEnd = overlay.startTime + overlay.duration
              const timelineConstrainedDelta = Math.min(mergedTransitionDelta, state.duration - mergedCurrentEnd)
              
              // Use the most restrictive constraint (also ensure it's not negative)
              const constrainedDelta = Math.max(0, Math.min(maxAllowedDelta, timelineConstrainedDelta))
              
              const newToClipStart = Math.max(0, toClip.startTime + constrainedDelta)
              const newToClipDuration = Math.max(getMinDuration(), toClipOriginalEnd - newToClipStart)
              
              console.log('Merged transition right resize constraint:', {
                originalDelta: mergedTransitionDelta,
                maxAllowedDelta,
                timelineConstrainedDelta,
                constrainedDelta,
                toClipOriginalDuration: toClip.duration,
                newToClipDuration,
                minDuration: getMinDuration(),
                timelineDuration: state.duration,
                mergedCurrentEnd: overlay.startTime + overlay.duration
              })
              
              // Apply same constraints as regular clip left resize
              const isExtending = newToClipStart < toClip.startTime
              const maxAllowed = isExtending 
                ? getMaxAllowedDurationForExtension(toClip, 'start')
                : getMaxAllowedDuration(toClip, 'clip')
              const finalDuration = Math.min(newToClipDuration, maxAllowed)
              
              // Add timeline boundary constraints
              const maxEndTime = Math.min(newToClipStart + finalDuration, state.duration)
              const boundaryConstrainedDuration = Math.max(getMinDuration(), maxEndTime - newToClipStart)
              
              if (!checkCollision(toClip, newToClipStart, boundaryConstrainedDuration)) {
                // When left-resizing toClip, calculate new mediaStartTime (in source time)
                const timeShift = newToClipStart - toClip.startTime
                const newMediaStartTime = Math.max(0, toClip.mediaStartTime + (timeShift * toClip.speed))
                
                // Calculate new trim values for the toClip
                const tempClip = {
                  ...toClip,
                  startTime: snapToGrid(newToClipStart),
                  duration: snapToGrid(boundaryConstrainedDuration),
                  mediaStartTime: newMediaStartTime
                }
                const { trimIn, trimOut } = calculateTrimValues(tempClip)

                // Update toClip position and duration
                actions.updateOverlayBatch(toClip.id, { 
                  startTime: snapToGrid(newToClipStart),
                  duration: snapToGrid(boundaryConstrainedDuration),
                  mediaStartTime: newMediaStartTime,
                  trimmedIn: trimIn,
                  trimmedOut: trimOut
                })
                
                // Update merged transition end to stay glued to toClip start
                const newMergedDuration = snapToGrid(newToClipStart) - overlay.startTime
                const finalMergedDuration = Math.max(getMinDuration(), newMergedDuration)
                actions.updateOverlayBatch(overlay.id, { 
                  duration: finalMergedDuration
                })
                
                // Update toClip's transition-in if it exists
                if (toClip.transitionInId && toClip.transitionInId !== overlay.id) {
                  const transitionIn = state.overlays.find(o => o.id === toClip.transitionInId)
                  if (transitionIn) {
                    const newTransitionInStart = snapToGrid(newToClipStart) - transitionIn.duration
                    actions.updateOverlayBatch(toClip.transitionInId, { startTime: newTransitionInStart, row: toClip.row })
                  }
                }
                
                // Update toClip's transition-out if it exists
                if (toClip.transitionOutId) {
                  const transitionOut = state.overlays.find(o => o.id === toClip.transitionOutId)
                  if (transitionOut) {
                    const newTransitionOutStart = snapToGrid(newToClipStart) + snapToGrid(boundaryConstrainedDuration)
                    actions.updateOverlayBatch(toClip.transitionOutId, { startTime: newTransitionOutStart, row: toClip.row })
                  }
                }
              }
            }
            return
          }
          
          // Regular clip resize logic with length constraints
          const requestedDuration = Math.max(getMinDuration(), currentDragInfo.originalDuration + deltaTime)
          
          // Add timeline boundary constraints for right resize
          const maxAllowedEnd = state.duration
          const boundaryConstrainedDuration = Math.max(getMinDuration(), Math.min(requestedDuration, maxAllowedEnd - currentDragInfo.originalStartTime))
          
          // Check clip length constraints
          if (overlay.type === OverlayType.CLIP) {
            // For right resize, we're potentially extending from the end
            const isExtending = requestedDuration > currentDragInfo.originalDuration
            const maxAllowed = isExtending 
              ? getMaxAllowedDurationForExtension(overlay, 'end')
              : getMaxAllowedDuration(overlay, 'clip')
            let newDuration = Math.min(boundaryConstrainedDuration, maxAllowed)
            
            // IMPORTANT: Prevent clip from becoming unreachable behind transitions
            // When a clip has transitions, we need to ensure it remains clickable
            let minAccessibleDuration = getMinDuration()
            
            if (overlay.transitionOutId) {
              const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
              if (transitionOut && transitionOut.duration > 0) {
                // The issue: when clip becomes very small (1 frame), the transition-out
                // may visually cover or make it hard to click the clip
                // Solution: ensure clip is always larger than 1 frame when it has transitions
                // This gives enough visual space for reliable interaction
                const bufferFrames = 2 // Ensure at least 2 frames for reliable clicking
                minAccessibleDuration = getMinDuration() * bufferFrames
                
                console.log('Right resize: preventing clip from becoming unreachable', {
                  transitionOutDuration: transitionOut.duration,
                  singleFrameDuration: getMinDuration(),
                  bufferFrames,
                  minAccessibleDuration
                })
              }
            }
            
            if (newDuration < minAccessibleDuration) {
              // Adjust duration to ensure clip remains accessible
              newDuration = minAccessibleDuration
              
              console.log('Right resize: constraining duration for accessibility', {
                originalConstrainedDuration: newDuration,
                minAccessibleDuration,
                adjustedDuration: newDuration
              })
            }
            
            console.log('Right resize with constraints:', {
              deltaPixels: e.clientX - currentDragInfo.startX,
              deltaTime,
              originalDuration: currentDragInfo.originalDuration,
              requestedDuration,
              maxAllowed,
              finalDuration: newDuration,
              originalStartTime: currentDragInfo.originalStartTime,
              overlayStartTime: overlay.startTime
            })
            
            // For right resize, startTime should remain at the original position
            if (!checkCollision(overlay, currentDragInfo.originalStartTime, newDuration)) {
              console.log('Updating duration to:', snapToGrid(newDuration))
              
              // Calculate new trim values immediately based on the new clip properties
              const tempClip = {
                ...overlay as ClipOverlay,
                duration: snapToGrid(newDuration)
              }
              const { trimIn, trimOut } = calculateTrimValues(tempClip)

              // Update the main overlay duration with immediate trim values
              actions.updateOverlayBatch(overlay.id, { 
                duration: snapToGrid(newDuration),
                trimmedIn: trimIn,
                trimmedOut: trimOut
              })
              
              // Update transition-out position if it exists
              if (overlay.transitionOutId) {
                const transitionOut = state.overlays.find(o => o.id === overlay.transitionOutId)
                if (transitionOut) {
                  const newTransitionOutStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                  actions.updateOverlayBatch(overlay.transitionOutId, { startTime: newTransitionOutStart, row: overlay.row })
                }
              }

                             // Update merged transition if present
               const mergedAsFrom = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).fromClipId === overlay.id) as MergedTransitionOverlay | undefined
               const mergedAsTo = state.overlays.find(o => o.type === OverlayType.TRANSITION_MERGED && (o as MergedTransitionOverlay).toClipId === overlay.id) as MergedTransitionOverlay | undefined
               
               if (mergedAsFrom) {
                 // This clip is the fromClip - update merged transition start to stay glued to clip end
                 // and ensure toClip stays connected at the other end of the merged transition
                 const mergedStart = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                 const toClip = state.overlays.find(o => o.id === mergedAsFrom.toClipId)
                 
                 console.log('Right resize: updating merged transition (as fromClip)', mergedAsFrom.id, 'start to', mergedStart)
                 actions.updateOverlayBatch(mergedAsFrom.id, { startTime: mergedStart, row: overlay.row })
                 
                 // Keep toClip attached to the end of the merged transition
                 if (toClip) {
                   const newToClipStart = mergedStart + mergedAsFrom.duration
                   console.log('Right resize: moving toClip', toClip.id, 'to stay attached at', newToClipStart)
                   actions.updateOverlayBatch(toClip.id, { startTime: newToClipStart, row: overlay.row })
                   
                   // Update toClip's transitions to follow
                   if ((toClip as any).transitionInId) {
                     const toTransitionIn = state.overlays.find(o => o.id === (toClip as any).transitionInId)
                     if (toTransitionIn) {
                       const toTInStart = newToClipStart - toTransitionIn.duration
                       actions.updateOverlayBatch(toTransitionIn.id, { startTime: toTInStart, row: overlay.row })
                     }
                   }
                   if ((toClip as any).transitionOutId) {
                     const toTransitionOut = state.overlays.find(o => o.id === (toClip as any).transitionOutId)
                     if (toTransitionOut) {
                       const toTOutStart = newToClipStart + toClip.duration
                       actions.updateOverlayBatch(toTransitionOut.id, { startTime: toTOutStart, row: overlay.row })
                     }
                   }
                 }
               }
               
               if (mergedAsTo) {
                 // This clip is the toClip - when right-resizing toClip, adjust merged transition duration
                 // fromClip stays in place, merged transition adjusts to connect to new toClip end position
                 const fromClip = state.overlays.find(o => o.id === mergedAsTo.fromClipId)
                 if (fromClip) {
                   const mergedStart = fromClip.startTime + fromClip.duration
                   const mergedEnd = currentDragInfo.originalStartTime + snapToGrid(newDuration)
                   const newMergedDuration = Math.max(getMinDuration(), mergedEnd - mergedStart)
                   const finalMergedDuration = Math.max(getMinDuration(), snapToGrid(newMergedDuration))
                   console.log('Right resize: updating merged transition (as toClip)', mergedAsTo.id, 'duration to', finalMergedDuration)
                   console.log('Right resize: fromClip stays at', fromClip.startTime, 'toClip end moves to', mergedEnd)
                   actions.updateOverlayBatch(mergedAsTo.id, { 
                     duration: finalMergedDuration,
                     row: overlay.row 
                   })
                 }
               }
            } else {
              console.log('Collision detected, not updating')
            }
          }
        }
      }
    }
    
    const handleMouseUp = () => {
      // Commit history if we were actually dragging
      if (localIsDragging) {
        actions.commitDragHistory()
        
        console.log('Drag completed for overlay:', overlay.id)
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
    snapToGrid,
    getMinDuration,
    getEffectiveClipLength,
    calculateTrimValues,
    getMaxAllowedDurationForExtension,
    getMaxAllowedDuration,
    getRelatedOverlays,
    findValidPosition,
    checkCollision,
    actions,
    options
  ])
  
  const handleClick = useCallback((event: React.MouseEvent, overlay: Overlay) => {
    if (isDragging)
      return
    
    event.stopPropagation()
    
    // Handle Ctrl+click on merged transitions to split them
    if ((event.ctrlKey || event.metaKey) && overlay.type === OverlayType.TRANSITION_MERGED) {
      actions.splitMergedTransition(overlay.id)
      return
    }
    
    actions.selectOverlay(overlay.id, event.ctrlKey || event.metaKey)
    options.onSelect?.(overlay)
  }, [isDragging, actions, options])
  
  const handleTimelineMouseDown = useCallback((event: React.MouseEvent) => {
    if (isDragging)
      return
    
    const timelineElement = timelineRef.current
    if (!timelineElement)
      return
    
    const rect = timelineElement.getBoundingClientRect()
    const clickX = event.clientX - rect.left - 60 // Account for track label width
    const clickTime = Math.max(0, pixelToTime(clickX))
    
    // Start scrubbing
    setIsTimelineScrubbing(true)
    actions.seek(clickTime)
    actions.clearSelection()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTimelineScrubbing || !timelineElement)
        return
      
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
    if (isDragging)
      return 'grabbing'
    
    const overlayElement = document.getElementById(`overlay-${overlay.id}`)
    if (!overlayElement)
      return 'grab'
    
    const rect = overlayElement.getBoundingClientRect()
    const relativeX = mouseX - rect.left
    const resizeHandleWidth = 12
    const transitionInteractiveWidth = 12
    
    if (overlay.type === OverlayType.TRANSITION_IN) {
      return relativeX <= transitionInteractiveWidth ? 'ew-resize' : 'grab'
    }
    if (overlay.type === OverlayType.TRANSITION_OUT) {
      return relativeX >= rect.width - transitionInteractiveWidth ? 'ew-resize' : 'grab'
    }
    if (overlay.type === OverlayType.TRANSITION_MERGED) {
      if (relativeX <= resizeHandleWidth) return 'ew-resize'
      if (relativeX >= rect.width - resizeHandleWidth) return 'ew-resize'
      return 'grab'
    }
    if (relativeX <= resizeHandleWidth)
      return 'ew-resize'
    if (relativeX >= rect.width - resizeHandleWidth)
      return 'ew-resize'
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
    
    // Length validation utilities
    getEffectiveClipLength,
    validateClipTotalLength,
    getMaxAllowedDuration,
    
    // Refs
    timelineRef
  }
}